from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.config import get_db
from app.models.auth import get_password_hash, require_roles
from app.models.database import DoctorProfile, User
from app.schemas.auth import UserResponse

router = APIRouter(prefix="/api/admin/users", tags=["Admin User Management"])


@router.post("/create-staff", response_model=UserResponse)
def create_staff(payload: dict, _: User = Depends(require_roles("admin")), db: Session = Depends(get_db)):
    role = (payload.get("role") or "").lower()
    email = payload.get("email")
    username = payload.get("username")
    password = payload.get("password")
    full_name = payload.get("full_name") or payload.get("name")

    if role not in ("doctor", "admin"):
        raise HTTPException(status_code=400, detail="Only doctor/admin staff can be created here")
    if not email or not username or not password:
        raise HTTPException(status_code=422, detail="email, username and password are required")

    existing = db.query(User).filter((User.email == email) | (User.username == username)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email or username already exists")

    user = User(
        email=email,
        username=username,
        full_name=full_name,
        role=role,
        hashed_password=get_password_hash(password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    if user.role == "doctor":
        db.add(DoctorProfile(user_id=user.id, specialization=payload.get("specialization", "General Medicine")))
        db.commit()
    return user


@router.get("/doctors")
def list_doctors(_: User = Depends(require_roles("admin")), db: Session = Depends(get_db)):
    return db.query(User).filter(User.role == "doctor").all()


@router.get("/all")
def list_all_users(_: User = Depends(require_roles("admin")), db: Session = Depends(get_db)):
    return db.query(User).order_by(User.created_at.desc()).all()
