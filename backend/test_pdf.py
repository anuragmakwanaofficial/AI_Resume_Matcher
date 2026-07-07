import sys
import uuid
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.analysis import Analysis
from app.services.pdf_generator import generate_analysis_pdf

def test_pdf():
    db = SessionLocal()
    try:
        # Get the first analysis
        analysis = db.query(Analysis).first()
        if not analysis:
            print("No analysis found in DB to test.")
            return
            
        print(f"Testing PDF generation for Analysis ID: {analysis.id}")
        pdf_bytes = generate_analysis_pdf(analysis)
        print(f"PDF generated successfully, size: {len(pdf_bytes)} bytes")
    except Exception as e:
        print(f"Error generating PDF: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_pdf()
