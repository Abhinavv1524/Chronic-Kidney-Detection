from fastapi import APIRouter, Depends
from app.models.auth import get_current_user
from sqlalchemy.orm import Session
from app.core.config import get_db
from app.models.database import Appointment, Notification, User

router = APIRouter(prefix="/api/ai", tags=["AI Tools"])


@router.post("/explain")
def explain_prediction(payload: dict, _: User = Depends(get_current_user)):
    pred = payload.get("prediction", {})
    importance = pred.get("feature_importance", {})
    top = sorted(importance.items(), key=lambda x: x[1], reverse=True)[:5]
    return {
        "method": "Feature Importance Surrogate (SHAP/LIME-ready integration point)",
        "top_factors": [{"feature": f, "weight": float(w)} for f, w in top],
        "reasoning": "Higher-weight factors contributed more strongly to the model decision.",
    }


@router.post("/chatbot")
def ckd_chatbot(payload: dict, _: User = Depends(get_current_user)):
    q = (payload.get("query") or "").lower()
    if "diet" in q:
        msg = "Prefer low-sodium meals, controlled protein, and avoid processed food."
    elif "symptom" in q:
        msg = "Common CKD signs include fatigue, swelling, and changes in urination. Please consult a doctor."
    elif "prevention" in q:
        msg = "Control blood pressure, blood sugar, hydration, and schedule periodic kidney function tests."
    else:
        msg = "I can help with CKD symptoms, diet, prevention, hydration, and when to seek doctor care."
    return {"answer": msg}


@router.post("/share")
def share_result_with_doctor(payload: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doctor_id = payload.get("doctor_id")
    record_id = payload.get("record_id")
    if not doctor_id:
        latest_appt = (
            db.query(Appointment)
            .filter(Appointment.patient_id == current_user.id)
            .order_by(Appointment.appointment_date.desc())
            .first()
        )
        if latest_appt:
            doctor_id = latest_appt.doctor_id
    if not doctor_id:
        return {"message": "No doctor selected/linked yet"}

    db.add(
        Notification(
            user_id=int(doctor_id),
            title="Patient Shared CKD Result",
            message=f"{current_user.full_name or current_user.username} shared assessment record #{record_id}.",
            type="report",
        )
    )
    db.commit()
    return {"message": "Result shared with doctor"}
