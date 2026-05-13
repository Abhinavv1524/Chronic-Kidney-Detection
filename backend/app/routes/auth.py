from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from app.core.config import get_db, create_tables
from app.core.settings import ACCESS_TOKEN_EXPIRE_MINUTES, BOOTSTRAP_ADMIN_KEY
from app.models.database import User
from app.models.auth import get_password_hash, create_access_token, authenticate_user, get_current_user
from app.models.auth import generate_reset_token
from app.schemas.auth import UserCreate, UserResponse, Token, ForgotPasswordRequest, ResetPasswordRequest, BootstrapAdminRequest, ChangePasswordRequest

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    create_tables()
    if user.role not in ("patient", "doctor"):
        raise HTTPException(status_code=403, detail="Public registration allowed for patient/doctor roles only")

    existing = db.query(User).filter(
        (User.email == user.email) | (User.username == user.username)
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )

    hashed = get_password_hash(user.password)

    db_user = User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        role=user.role,
        hashed_password=hashed
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    if db_user.role == "doctor":
        from app.models.database import DoctorProfile
        db.add(DoctorProfile(user_id=db_user.id, specialization="General Medicine"))
        db.commit()
    return db_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        return {"message": "If the email exists, reset instructions were generated."}

    user.reset_token = generate_reset_token()
    user.reset_token_expires_at = datetime.utcnow() + timedelta(minutes=20)
    db.commit()
    return {
        "message": "Reset token generated. Integrate email service to send this in production.",
        "reset_token": user.reset_token
    }


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == payload.token).first()
    if not user or not user.reset_token_expires_at or user.reset_token_expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user.hashed_password = get_password_hash(payload.new_password)
    user.reset_token = None
    user.reset_token_expires_at = None
    db.commit()
    return {"message": "Password reset successfully"}


@router.post("/bootstrap-admin", response_model=UserResponse)
def bootstrap_admin(payload: BootstrapAdminRequest, db: Session = Depends(get_db)):
    create_tables()
    if payload.bootstrap_key != BOOTSTRAP_ADMIN_KEY:
        raise HTTPException(status_code=403, detail="Invalid bootstrap key")

    existing_admin = db.query(User).filter(User.role == "admin").first()
    if existing_admin:
        raise HTTPException(status_code=400, detail="Admin already exists. Use Admin Workspace to create staff.")

    existing_user = db.query(User).filter((User.email == payload.email) | (User.username == payload.username)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email or username already registered")

    admin_user = User(
        email=payload.email,
        username=payload.username,
        full_name=payload.full_name,
        role="admin",
        hashed_password=get_password_hash(payload.password),
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    return admin_user


@router.get("/profile", response_model=UserResponse)
def profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/update", response_model=UserResponse)
def update_profile(payload: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    for field in ("full_name", "email", "username"):
        if field in payload and payload[field]:
            setattr(current_user, field, payload[field])
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/change-password")
def change_password(payload: ChangePasswordRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.models.auth import verify_password
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.hashed_password = get_password_hash(payload.new_password)
    db.commit()
    return {"message": "Password updated"}


@router.delete("/delete-account")
def delete_account(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.delete(current_user)
    db.commit()
    return {"message": "Account deleted"}
