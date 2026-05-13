from fastapi import APIRouter, Depends
from app.models.auth import get_current_user
from app.models.database import User

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])


@router.get("/latest")
def latest_recommendations(risk_level: str = "Low", current_user: User = Depends(get_current_user)):
    risk = risk_level.lower()
    diet = ["Low sodium diet", "Balanced protein intake", "Avoid processed foods"]
    hydration = "Maintain moderate hydration (as advised by nephrologist)."
    precautions = ["Track blood pressure", "Avoid nephrotoxic medicines", "Regular renal profile checks"]
    doctor_advice = "Consult nephrologist monthly." if risk in ("high", "critical") else "Follow up every 2-3 months."
    return {
        "user_id": current_user.id,
        "risk_level": risk_level,
        "diet_suggestions": diet,
        "hydration_advice": hydration,
        "precautions": precautions,
        "doctor_recommendation": doctor_advice,
    }
