"""Standalone CLI script to ingest PDFs from server/documents/ into LanceDB.

Run manually whenever new source PDFs are added:
    python pdf_injest.py

Not invoked by the API/UI — ingestion is a deliberate, offline step.
"""

import re
import uuid
from pathlib import Path

import lancedb
from llama_index.core.node_parser import SentenceSplitter
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer

DOCUMENTS_DIR = Path(__file__).resolve().parent / "documents"
LANCEDB_DIR = Path(__file__).resolve().parent / "lancedb"
TABLE_NAME = "orloj_chunks"
EMBEDDING_MODEL = "BAAI/bge-small-en-v1.5"
MIN_CHUNK_WORDS = 5


def load_pdf_text(path: Path) -> str:
    reader = PdfReader(str(path))
    raw = "\n".join(page.extract_text() or "" for page in reader.pages)
    # Some PDF exporters (e.g. browser "print to PDF") encode inter-word
    # spacing as literal tab characters rather than spaces.
    return re.sub(r"[ \t]+", " ", raw)


def existing_sources(table) -> set[str]:
    if table is None:
        return set()
    rows = table.to_arrow().column("source").to_pylist()
    return set(rows)


def main():
    pdf_paths = sorted(DOCUMENTS_DIR.glob("*.pdf"))
    if not pdf_paths:
        print(f"No PDFs found in {DOCUMENTS_DIR}")
        return

    db = lancedb.connect(str(LANCEDB_DIR))
    table = db.open_table(TABLE_NAME) if TABLE_NAME in db.list_tables() else None
    already_ingested = existing_sources(table)

    splitter = SentenceSplitter(chunk_size=512, chunk_overlap=50)
    print(f"Loading embedding model {EMBEDDING_MODEL}...")
    model = SentenceTransformer(EMBEDDING_MODEL)

    rows = []
    for pdf_path in pdf_paths:
        if pdf_path.name in already_ingested:
            print(f"Skipping already-ingested: {pdf_path.name}")
            continue

        text = load_pdf_text(pdf_path)
        if not text.strip():
            print(f"Warning: no extractable text in {pdf_path.name}")
            continue

        chunks = [c for c in splitter.split_text(text) if len(c.split()) >= MIN_CHUNK_WORDS]
        if not chunks:
            print(f"Warning: no usable chunks from {pdf_path.name}")
            continue

        embeddings = model.encode(chunks, show_progress_bar=False)
        for chunk, vector in zip(chunks, embeddings):
            rows.append(
                {
                    "id": str(uuid.uuid4()),
                    "vector": vector.tolist(),
                    "doc_type": "orloj",
                    "text": chunk,
                    "source": pdf_path.name,
                }
            )
        print(f"Ingested {len(chunks)} chunks from {pdf_path.name}")

    if not rows:
        print("Nothing new to ingest.")
        return

    if table is None:
        table = db.create_table(TABLE_NAME, data=rows)
    else:
        table.add(rows)

    print(f"Done. Table '{TABLE_NAME}' now has {table.count_rows()} rows.")


if __name__ == "__main__":
    main()
