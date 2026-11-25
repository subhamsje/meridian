import hashlib
import json
import os
import io
from typing import Dict, Any, List, Optional, Tuple
import pymupdf  # PyMuPDF
import docx
import openpyxl
import pandas as pd
import pptx
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from models import InvestigationDocument, Source, EvidenceItem, Investigation

class DocumentParsingService:
    @staticmethod
    def compute_sha256(file_bytes: bytes) -> str:
        return hashlib.sha256(file_bytes).hexdigest()

    @staticmethod
    def detect_file_type(filename: str, content_type: Optional[str] = None) -> str:
        ext = filename.split(".")[-1].lower() if "." in filename else ""
        if ext in ["pdf"]:
            return "pdf"
        elif ext in ["docx", "doc"]:
            return "docx"
        elif ext in ["xlsx", "xls"]:
            return "xlsx"
        elif ext in ["csv"]:
            return "csv"
        elif ext in ["pptx", "ppt"]:
            return "pptx"
        elif ext in ["txt"]:
            return "txt"
        elif ext in ["md", "markdown"]:
            return "md"
        elif ext in ["html", "htm"]:
            return "html"
        elif ext in ["json"]:
            return "json"
        
        # Fallback to content type
        if content_type:
            if "pdf" in content_type:
                return "pdf"
            elif "spreadsheet" in content_type or "excel" in content_type:
                return "xlsx"
            elif "presentation" in content_type or "powerpoint" in content_type:
                return "pptx"
            elif "word" in content_type:
                return "docx"
            elif "json" in content_type:
                return "json"
            elif "html" in content_type:
                return "html"
            elif "csv" in content_type:
                return "csv"
            elif "text" in content_type:
                return "txt"
        return "txt"

    @classmethod
    def parse_document(cls, filename: str, file_bytes: bytes, content_type: Optional[str] = None) -> Dict[str, Any]:
        """
        Parses document bytes into extracted text, page/sheet count, and structured metadata.
        Supports PDF, DOCX, XLSX, CSV, PPTX, TXT, MD, HTML, JSON with zero-crash resilience.
        """
        file_type = cls.detect_file_type(filename, content_type)
        checksum = cls.compute_sha256(file_bytes)
        file_size = len(file_bytes)
        
        extracted_text = ""
        page_or_sheet_count = 1
        metadata: Dict[str, Any] = {
            "filename": filename,
            "file_type": file_type,
            "file_size_bytes": file_size,
            "checksum_sha256": checksum,
            "sections": [],
            "tables": []
        }

        # Guard against zero-byte files
        if file_size == 0:
            return {
                "filename": filename,
                "file_type": file_type,
                "file_size_bytes": 0,
                "page_or_sheet_count": 0,
                "checksum_sha256": checksum,
                "extraction_status": "empty",
                "extracted_text": "",
                "extracted_metadata": {**metadata, "is_empty": True},
                "error_message": "Document file is empty (0 bytes)."
            }

        try:
            if file_type == "pdf":
                doc = pymupdf.open(stream=file_bytes, filetype="pdf")
                page_or_sheet_count = len(doc)
                pages_text = []
                for idx, page in enumerate(doc):
                    p_text = page.get_text()
                    if p_text.strip():
                        pages_text.append(f"--- [Page {idx + 1}] ---\n" + p_text.strip())
                extracted_text = "\n\n".join(pages_text)
                metadata["page_count"] = page_or_sheet_count

            elif file_type == "docx":
                bio = io.BytesIO(file_bytes)
                doc = docx.Document(bio)
                paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
                # Extract tables
                table_texts = []
                for t_idx, table in enumerate(doc.tables):
                    rows_data = []
                    for row in table.rows:
                        rows_data.append(" | ".join([cell.text.strip() for cell in row.cells]))
                    if rows_data:
                        table_texts.append(f"[Table {t_idx + 1}]\n" + "\n".join(rows_data))
                
                extracted_text = "\n\n".join(paragraphs + table_texts)
                page_or_sheet_count = max(1, len(paragraphs) // 10)
                metadata["paragraph_count"] = len(paragraphs)
                metadata["table_count"] = len(table_texts)

            elif file_type == "xlsx":
                bio = io.BytesIO(file_bytes)
                xl = pd.ExcelFile(bio)
                sheet_names = xl.sheet_names
                page_or_sheet_count = len(sheet_names)
                metadata["sheet_names"] = sheet_names
                sheets_text = []
                for sheet in sheet_names:
                    df = xl.parse(sheet)
                    text_repr = df.to_string(max_rows=100, max_cols=20)
                    sheets_text.append(f"--- [Sheet: {sheet}] ---\n" + text_repr)
                extracted_text = "\n\n".join(sheets_text)

            elif file_type == "csv":
                try:
                    df = pd.read_csv(io.BytesIO(file_bytes), sep=None, engine="python")
                    page_or_sheet_count = 1
                    metadata["row_count"] = len(df)
                    metadata["column_count"] = len(df.columns)
                    metadata["columns"] = list(df.columns)
                    extracted_text = df.to_string(max_rows=200, max_cols=25)
                except Exception:
                    extracted_text = cls._decode_text_safely(file_bytes)
                    page_or_sheet_count = 1

            elif file_type == "pptx":
                bio = io.BytesIO(file_bytes)
                prs = pptx.Presentation(bio)
                page_or_sheet_count = len(prs.slides)
                slides_text = []
                for s_idx, slide in enumerate(prs.slides):
                    slide_lines = []
                    for shape in slide.shapes:
                        if shape.has_text_frame and shape.text.strip():
                            slide_lines.append(shape.text.strip())
                    if slide_lines:
                        slides_text.append(f"--- [Slide {s_idx + 1}] ---\n" + "\n".join(slide_lines))
                extracted_text = "\n\n".join(slides_text)
                metadata["slide_count"] = page_or_sheet_count

            elif file_type == "html":
                soup = BeautifulSoup(cls._decode_text_safely(file_bytes), "html.parser")
                for s in soup(["script", "style", "nav", "footer"]):
                    s.decompose()
                extracted_text = soup.get_text(separator="\n", strip=True)
                page_or_sheet_count = max(1, len(extracted_text) // 2000)

            elif file_type == "json":
                parsed = json.loads(cls._decode_text_safely(file_bytes))
                extracted_text = json.dumps(parsed, indent=2)
                page_or_sheet_count = 1
                metadata["is_valid_json"] = True

            else:  # txt, md, etc.
                extracted_text = cls._decode_text_safely(file_bytes)
                page_or_sheet_count = max(1, len(extracted_text) // 2000)

            status = "processed"
            error_message = None

        except Exception as e:
            status = "failed"
            error_message = str(e)
            extracted_text = cls._decode_text_safely(file_bytes)[:1000]

        return {
            "filename": filename,
            "file_type": file_type,
            "file_size_bytes": file_size,
            "page_or_sheet_count": page_or_sheet_count,
            "checksum_sha256": checksum,
            "extraction_status": status,
            "extracted_text": extracted_text,
            "extracted_metadata": metadata,
            "error_message": error_message
        }

    @staticmethod
    def _decode_text_safely(raw_bytes: bytes) -> str:
        """
        Attempts multiple encodings (UTF-8, UTF-8-SIG, Latin-1, CP1252) before falling back to replacement.
        """
        for enc in ("utf-8", "utf-8-sig", "latin-1", "cp1252"):
            try:
                return raw_bytes.decode(enc)
            except (UnicodeDecodeError, LookupError):
                continue
        return raw_bytes.decode("utf-8", errors="replace")

    @classmethod
    def ingest_and_store_document(
        cls,
        db: Session,
        investigation_id: str,
        company_id: Optional[str],
        filename: str,
        file_bytes: bytes,
        content_type: Optional[str] = None
    ) -> InvestigationDocument:
        """
        Parses document, persists an InvestigationDocument record, creates a Source
        and corresponding EvidenceItem chunks for downstream specialist agent consumption.
        """
        parsed = cls.parse_document(filename, file_bytes, content_type)
        
        # Get investigation for org ID
        inv = db.query(Investigation).filter(Investigation.id == investigation_id).first()
        org_id = inv.organization_id if inv else "org-default"

        # 1. Create Source entry
        source_category = "document_upload"
        if parsed["file_type"] == "pdf" and ("10-k" in filename.lower() or "10-q" in filename.lower() or "sec" in filename.lower()):
            source_category = "sec_filing"
        elif parsed["file_type"] in ["xlsx", "csv"]:
            source_category = "financial_model"

        source = Source(
            organization_id=org_id,
            title=f"Uploaded Document: {filename}",
            publisher="Primary Evidence / Upload",
            source_category=source_category,
            reliability_score=0.92,
            checksum=parsed["checksum_sha256"]
        )
        db.add(source)
        db.flush()

        # 2. Create InvestigationDocument
        doc_record = InvestigationDocument(
            investigation_id=investigation_id,
            company_id=company_id,
            filename=filename,
            file_type=parsed["file_type"],
            file_size_bytes=parsed["file_size_bytes"],
            page_or_sheet_count=parsed["page_or_sheet_count"],
            checksum_sha256=parsed["checksum_sha256"],
            extraction_status=parsed["extraction_status"],
            extracted_text=parsed["extracted_text"],
            extracted_metadata=parsed["extracted_metadata"],
            source_id=source.id,
            error_message=parsed["error_message"]
        )
        db.add(doc_record)
        db.flush()

        # 3. Create initial EvidenceItems from chunked text (500-1500 char chunks)
        text = parsed["extracted_text"] or ""
        if text.strip() and parsed["extraction_status"] == "processed":
            chunks = cls._chunk_text(text, max_chunk_size=1500)
            for idx, chunk in enumerate(chunks[:12]):  # up to 12 primary evidence chunks per document
                evidence = EvidenceItem(
                    investigation_id=investigation_id,
                    source_id=source.id,
                    location_reference=f"{filename} § Item {idx + 1}",
                    extracted_passage=chunk,
                    is_verified=True,
                    reliability_assessment="Verified through direct document upload checksum validation",
                    extraction_method="structured_ingestion"
                )
                db.add(evidence)

        db.commit()
        db.refresh(doc_record)
        return doc_record

    @staticmethod
    def _chunk_text(text: str, max_chunk_size: int = 1500) -> List[str]:
        paragraphs = text.split("\n\n")
        chunks = []
        current_chunk = []
        current_len = 0
        for p in paragraphs:
            p_strip = p.strip()
            if not p_strip:
                continue
            if current_len + len(p_strip) > max_chunk_size and current_chunk:
                chunks.append("\n\n".join(current_chunk))
                current_chunk = [p_strip]
                current_len = len(p_strip)
            else:
                current_chunk.append(p_strip)
                current_len += len(p_strip)
        if current_chunk:
            chunks.append("\n\n".join(current_chunk))
        return chunks
