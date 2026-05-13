from datetime import datetime
from pydantic import BaseModel
from typing import Optional


class DoctorProfileResponse(BaseModel):
    doctor_id: int
    full_name: str
    email: str
    specialization: Optional[str] = None
    experience_years: Optional[int] = None
    qualification: Optional[str] = None
    hospital: Optional[str] = None


class AppointmentCreate(BaseModel):
    doctor_id: int
    appointment_date: datetime
    reason: Optional[str] = None


class AppointmentUpdateStatus(BaseModel):
    status: str
    doctor_notes: Optional[str] = None


class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    appointment_date: datetime
    reason: Optional[str] = None
    status: str
    doctor_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ConsultationNoteCreate(BaseModel):
    appointment_id: int
    note: str
