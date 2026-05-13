from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: str
    username: str
    full_name: Optional[str] = None
    role: str = "patient"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class BootstrapAdminRequest(BaseModel):
    email: str
    username: str
    password: str
    full_name: Optional[str] = None
    bootstrap_key: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class RecordBase(BaseModel):
    age: Optional[float] = None
    bp: Optional[float] = None
    sg: Optional[float] = None
    al: Optional[int] = None
    su: Optional[int] = None
    rbc: Optional[str] = None
    pc: Optional[str] = None
    pcc: Optional[str] = None
    ba: Optional[str] = None
    bgr: Optional[float] = None
    bu: Optional[float] = None
    sc: Optional[float] = None
    sod: Optional[float] = None
    pot: Optional[float] = None
    hemo: Optional[float] = None
    pcv: Optional[float] = None
    wbcc: Optional[float] = None
    rbcc: Optional[float] = None
    htn: Optional[str] = None
    dm: Optional[str] = None
    cad: Optional[str] = None
    appet: Optional[str] = None
    pe: Optional[str] = None
    ane: Optional[str] = None

class RecordCreate(RecordBase):
    pass

class RecordResponse(RecordBase):
    id: int
    user_id: int
    binary_prediction: Optional[str] = None
    binary_probability: Optional[float] = None
    stage_prediction: Optional[int] = None
    confidence_score: Optional[str] = None
    risk_level: Optional[str] = None
    file_name: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
