import io
from xml.sax.saxutils import escape
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

def generate_analysis_pdf(analysis) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50)
    
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    heading_style = styles['Heading2']
    normal_style = styles['Normal']
    
    # Custom Styles
    score_style = ParagraphStyle(
        'Score',
        parent=styles['Normal'],
        fontSize=18,
        textColor=colors.HexColor('#0058be'),
        spaceAfter=20,
        fontName='Helvetica-Bold'
    )
    
    elements = []
    
    # Title
    elements.append(Paragraph("AI Resume Matcher - Analysis Report", title_style))
    elements.append(Spacer(1, 10))
    
    # Meta
    res_name = escape(analysis.resume_filename) if analysis.resume_filename else 'Pasted Text'
    jd_name = escape(analysis.jd_filename) if analysis.jd_filename else 'Pasted Text'
    elements.append(Paragraph(f"<b>Resume:</b> {res_name}", normal_style))
    elements.append(Paragraph(f"<b>Job Description:</b> {jd_name}", normal_style))
    elements.append(Spacer(1, 20))
    
    # Score
    elements.append(Paragraph(f"Overall Match Score: {analysis.overall_score}%", score_style))
    
    # Narrative
    elements.append(Paragraph("<b>Analysis Summary:</b>", heading_style))
    elements.append(Paragraph(escape(analysis.narrative or ""), normal_style))
    elements.append(Spacer(1, 20))
    
    # Suggestions
    if analysis.suggestions:
        elements.append(Paragraph("<b>Improvement Suggestions:</b>", heading_style))
        for tip in analysis.suggestions:
            if isinstance(tip, str):
                elements.append(Paragraph(f"• {escape(tip)}", normal_style))
        elements.append(Spacer(1, 20))
    
    # Skills Matrix Table
    elements.append(Paragraph("<b>Skill Match Matrix:</b>", heading_style))
    elements.append(Spacer(1, 10))
    
    matched_must = [s.skill_name for s in analysis.skill_matches if s.category == 'must_have' and s.status == 'matched']
    missing_must = [s.skill_name for s in analysis.skill_matches if s.category == 'must_have' and s.status == 'missing']
    matched_nice = [s.skill_name for s in analysis.skill_matches if s.category == 'nice_to_have' and s.status == 'matched']
    missing_nice = [s.skill_name for s in analysis.skill_matches if s.category == 'nice_to_have' and s.status == 'missing']
    
    table_data = [
        ['Category', 'Matched', 'Missing'],
        [
            'Must Have', 
            Paragraph(escape(", ".join(matched_must)) if matched_must else "-", normal_style), 
            Paragraph(escape(", ".join(missing_must)) if missing_must else "-", normal_style)
        ],
        [
            'Nice to Have', 
            Paragraph(escape(", ".join(matched_nice)) if matched_nice else "-", normal_style), 
            Paragraph(escape(", ".join(missing_nice)) if missing_nice else "-", normal_style)
        ]
    ]
    
    t = Table(table_data, colWidths=[100, 200, 200])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0b1c30')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8f9ff')),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN',(0,0),(-1,-1),'TOP')
    ]))
    
    elements.append(t)
    
    doc.build(elements)
    
    return buffer.getvalue()
