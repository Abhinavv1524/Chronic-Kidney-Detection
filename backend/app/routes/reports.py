from io import BytesIO
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from app.models.auth import get_current_user
from app.models.database import User

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.post("/medical-pdf")
def generate_medical_pdf(payload: dict, current_user: User = Depends(get_current_user)):
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, 800, "HFSA-CKD Medical Prediction Report")
    p.setFont("Helvetica", 11)
    p.drawString(50, 775, f"Patient: {payload.get('patient_name', current_user.full_name or current_user.username)}")
    p.drawString(50, 758, f"Prediction: {payload.get('binary_prediction', '-')}")
    p.drawString(50, 741, f"CKD Stage: {payload.get('stage_prediction', '-')}")
    p.drawString(50, 724, f"Risk Level: {payload.get('risk_level', '-')}")
    p.drawString(50, 707, f"Confidence: {payload.get('confidence_score', '-')}")
    p.drawString(50, 680, "Recommendations:")
    y = 662
    for rec in payload.get("recommendations", []):
        p.drawString(60, y, f"- {rec}")
        y -= 16
    p.showPage()
    p.save()
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=hfsa_ckd_report.pdf"},
    )
