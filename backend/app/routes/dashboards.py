from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.config import get_db
from app.models.auth import get_current_user, require_roles
from app.models.database import User, PatientRecord

router = APIRouter(prefix="/api/dashboards", tags=["Dashboards"])


@router.get("/patient")
def patient_dashboard(current_user: User = Depends(require_roles("patient", "doctor", "admin")), db: Session = Depends(get_db)):
    records = db.query(PatientRecord).filter(PatientRecord.user_id == current_user.id).order_by(PatientRecord.created_at.desc()).all()
    high_risk = sum(1 for r in records if r.risk_level in ("High", "Critical"))
    return {
        "user": {"id": current_user.id, "name": current_user.full_name, "role": current_user.role},
        "total_predictions": len(records),
        "high_risk_count": high_risk,
        "recent_records": records[:10],
    }


@router.get("/doctor")
def doctor_dashboard(current_user: User = Depends(require_roles("doctor", "admin")), db: Session = Depends(get_db)):
    stage_distribution = (
        db.query(PatientRecord.stage_prediction, func.count(PatientRecord.id))
        .group_by(PatientRecord.stage_prediction)
        .all()
    )
    return {
        "doctor": {"id": current_user.id, "name": current_user.full_name},
        "total_patients_with_records": db.query(PatientRecord.user_id).distinct().count(),
        "total_predictions": db.query(PatientRecord).count(),
        "stage_distribution": [{"stage": s, "count": c} for s, c in stage_distribution],
    }


@router.get("/admin")
def admin_dashboard(current_user: User = Depends(require_roles("admin")), db: Session = Depends(get_db)):
    users_count = db.query(User).count()
    total_patients = db.query(User).filter(User.role == "patient").count()
    total_doctors = db.query(User).filter(User.role == "doctor").count()
    predictions = db.query(PatientRecord).count()
    return {
        "total_users": users_count,
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "total_predictions": predictions,
    }
