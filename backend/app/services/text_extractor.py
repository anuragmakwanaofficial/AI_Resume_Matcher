"""
Text Extraction Service

Extracts plain text from PDF and DOCX files.
"""
import logging
import io
from typing import Optional

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF file bytes using pdfplumber."""
    try:
        import pdfplumber
        text_parts = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                # Use layout=True to better preserve columns and tables
                page_text = page.extract_text(layout=True)
                if page_text:
                    text_parts.append(page_text)
        result = "\n".join(text_parts).strip()
        logger.info(f"PDF extraction complete: {len(result)} chars from {len(text_parts)} pages")
        return result
    except Exception as e:
        logger.error(f"PDF extraction failed: {e}")
        raise ValueError(f"Could not extract text from PDF: {e}")


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract text from DOCX file bytes using python-docx."""
    try:
        from docx import Document
        doc = Document(io.BytesIO(file_bytes))
        paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
        result = "\n".join(paragraphs).strip()
        logger.info(f"DOCX extraction complete: {len(result)} chars from {len(paragraphs)} paragraphs")
        return result
    except Exception as e:
        logger.error(f"DOCX extraction failed: {e}")
        raise ValueError(f"Could not extract text from DOCX: {e}")


def extract_text_from_file(filename: str, file_bytes: bytes) -> str:
    """Dispatch extraction based on file extension."""
    filename_lower = filename.lower()
    if filename_lower.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    elif filename_lower.endswith(".docx"):
        return extract_text_from_docx(file_bytes)
    elif filename_lower.endswith(".doc"):
        raise ValueError("Legacy .doc format is not supported. Please convert to .docx or PDF.")
    elif filename_lower.endswith(".txt"):
        return file_bytes.decode("utf-8", errors="ignore").strip()
    else:
        raise ValueError(f"Unsupported file type: {filename}. Please use PDF, DOCX, or TXT.")
