from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.config import get_db
from app.models.auth import require_roles
from app.models.database import User, PatientRecord

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/admin")
def admin_analytics(_: User = Depends(require_roles("admin")), db: Session = Depends(get_db)):
    stage_distribution = (
        db.query(PatientRecord.stage_prediction, func.count(PatientRecord.id))
        .group_by(PatientRecord.stage_prediction)
        .all()
    )
    risk_distribution = (
        db.query(PatientRecord.risk_level, func.count(PatientRecord.id))
        .group_by(PatientRecord.risk_level)
        .all()
    )
    return {
        "total_patients": db.query(User).filter(User.role == "patient").count(),
        "total_predictions": db.query(PatientRecord).count(),
        "stage_distribution": [{"stage": s, "count": c} for s, c in stage_distribution],
        "risk_distribution": [{"risk": r, "count": c} for r, c in risk_distribution],
        "model_accuracy_estimate": 0.93,
    }
