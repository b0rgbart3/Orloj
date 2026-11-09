from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from ask_agent import generate_followup, run_agent, stream_agent_response

DIST_DIR = Path(__file__).resolve().parent.parent / "dist"

app = FastAPI()

# Dev-only: lets `vite dev` (port 5173) call this API directly without a
# proxy. Harmless in production, where the frontend is served same-origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AskRequest(BaseModel):
    message: str
    history: list[dict] = []


@app.post("/api/ask")
def ask(request: AskRequest):
    return run_agent(request.message, request.history)


@app.post("/api/ask/stream")
def ask_stream(request: AskRequest):
    return StreamingResponse(
        stream_agent_response(request.message, request.history),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )


@app.post("/api/followup")
def followup(request: AskRequest):
    return {"followup": generate_followup(request.message, request.history)}


if DIST_DIR.exists():
    app.mount("/", StaticFiles(directory=DIST_DIR, html=True), name="dist")
