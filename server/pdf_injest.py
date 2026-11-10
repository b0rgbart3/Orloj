"""Standalone CLI script to ingest PDFs and text files from server/documents/
into LanceDB.

Run manually whenever new source PDFs or .txt files are added:
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


def load_txt_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


LOADERS = {
    ".pdf": load_pdf_text,
    ".txt": load_txt_text,
}


def chunk_faq_text(text: str, splitter: SentenceSplitter) -> list[str]:
    """Splits FAQ-formatted .txt files on blank lines so each Q&A pair stays
    one atomic chunk, instead of running them through the generic sentence
    splitter (which could merge unrelated pairs or cut a question away from
    its answer)."""
    blocks = [b.strip() for b in re.split(r"\n\s*\n", text) if b.strip()]
    chunks = []
    for block in blocks:
        if len(block.split()) > 512:
            chunks.extend(splitter.split_text(block))
        else:
            chunks.append(block)
    return chunks


def existing_sources(table) -> set[str]:
    if table is None:
        return set()
    rows = table.to_arrow().column("source").to_pylist()
    return set(rows)


def main():
    doc_paths = sorted(
        p for ext in LOADERS for p in DOCUMENTS_DIR.glob(f"*{ext}")
    )
    if not doc_paths:
        print(f"No PDFs or text files found in {DOCUMENTS_DIR}")
        return

    db = lancedb.connect(str(LANCEDB_DIR))
    table = db.open_table(TABLE_NAME) if TABLE_NAME in db.list_tables() else None
    already_ingested = existing_sources(table)

    splitter = SentenceSplitter(chunk_size=512, chunk_overlap=50)
    print(f"Loading embedding model {EMBEDDING_MODEL}...")
    model = SentenceTransformer(EMBEDDING_MODEL)

    rows = []
    for doc_path in doc_paths:
        if doc_path.name in already_ingested:
            print(f"Skipping already-ingested: {doc_path.name}")
            continue

        text = LOADERS[doc_path.suffix.lower()](doc_path)
        if not text.strip():
            print(f"Warning: no extractable text in {doc_path.name}")
            continue

        if doc_path.suffix.lower() == ".txt":
            raw_chunks = chunk_faq_text(text, splitter)
        else:
            raw_chunks = splitter.split_text(text)
        chunks = [c for c in raw_chunks if len(c.split()) >= MIN_CHUNK_WORDS]
        if not chunks:
            print(f"Warning: no usable chunks from {doc_path.name}")
            continue

        embeddings = model.encode(chunks, show_progress_bar=False)
        for chunk, vector in zip(chunks, embeddings):
            rows.append(
                {
                    "id": str(uuid.uuid4()),
                    "vector": vector.tolist(),
                    "doc_type": "orloj",
                    "text": chunk,
                    "source": doc_path.name,
                }
            )
        print(f"Ingested {len(chunks)} chunks from {doc_path.name}")

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
