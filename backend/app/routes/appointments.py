from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.config import get_db
from app.models.auth import get_current_user, require_roles
from app.models.database import Appointment, ConsultationNote, DoctorProfile, Notification, PatientRecord, User
from app.schemas.appointments import (
    AppointmentCreate,
    AppointmentResponse,
    AppointmentUpdateStatus,
    ConsultationNoteCreate,
    DoctorProfileResponse,
)

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])


@router.get("/doctors", response_model=list[DoctorProfileResponse])
def list_doctors(_: User = Depends(require_roles("patient", "doctor", "admin")), db: Session = Depends(get_db)):
    rows = (
        db.query(User, DoctorProfile)
        .join(DoctorProfile, DoctorProfile.user_id == User.id)
        .filter(User.role == "doctor", DoctorProfile.is_active == 1)
        .all()
    )
    return [
        DoctorProfileResponse(
            doctor_id=u.id,
            full_name=u.full_name or u.username,
            email=u.email,
            specialization=p.specialization,
            experience_years=p.experience_years,
            qualification=p.qualification,
            hospital=p.hospital,
        )
        for u, p in rows
    ]


@router.post("/", response_model=AppointmentResponse)
def book_appointment(payload: AppointmentCreate, current_user: User = Depends(require_roles("patient")), db: Session = Depends(get_db)):
    doctor = db.query(User).filter(User.id == payload.doctor_id, User.role == "doctor").first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    row = Appointment(
        patient_id=current_user.id,
        doctor_id=payload.doctor_id,
        appointment_date=payload.appointment_date,
        reason=payload.reason,
        status="pending",
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    db.add(
        Notification(
            user_id=doctor.id,
            title="New Appointment Request",
            message=f"Appointment #{row.id}: {current_user.full_name or current_user.username} requested {row.appointment_date.strftime('%d %b %Y %I:%M %p')}",
            type="appointment",
        )
    )
    db.commit()
    return row


@router.get("/mine", response_model=list[AppointmentResponse])
def my_appointments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "patient":
        rows = db.query(Appointment).filter(Appointment.patient_id == current_user.id).order_by(Appointment.appointment_date.desc()).all()
    elif current_user.role == "doctor":
        rows = db.query(Appointment).filter(Appointment.doctor_id == current_user.id).order_by(Appointment.appointment_date.desc()).all()
    else:
        rows = db.query(Appointment).order_by(Appointment.appointment_date.desc()).limit(100).all()
    return rows


@router.get("/today", response_model=list[AppointmentResponse])
def today_appointments(current_user: User = Depends(require_roles("doctor", "admin")), db: Session = Depends(get_db)):
    q = db.query(Appointment).filter(Appointment.appointment_date >= datetime.combine(date.today(), datetime.min.time()))
    if current_user.role == "doctor":
        q = q.filter(Appointment.doctor_id == current_user.id)
    return q.order_by(Appointment.appointment_date.asc()).all()


@router.get("/doctor", response_model=list[AppointmentResponse])
def doctor_appointments(current_user: User = Depends(require_roles("doctor", "admin")), db: Session = Depends(get_db)):
    if current_user.role == "doctor":
        return db.query(Appointment).filter(Appointment.doctor_id == current_user.id).order_by(Appointment.appointment_date.desc()).all()
    return db.query(Appointment).order_by(Appointment.appointment_date.desc()).all()


@router.patch("/{appointment_id}/status", response_model=AppointmentResponse)
def update_status(
    appointment_id: int,
    payload: AppointmentUpdateStatus,
    current_user: User = Depends(require_roles("doctor", "admin")),
    db: Session = Depends(get_db),
):
    row = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if current_user.role == "doctor" and row.doctor_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can update only your appointments")
    if payload.status not in ("pending", "accepted", "rejected", "completed"):
        raise HTTPException(status_code=400, detail="Invalid status")
    current = (row.status or "").lower()
    target = (payload.status or "").lower()
    if current in ("rejected", "cancelled", "completed"):
        raise HTTPException(status_code=400, detail="Finalized appointment cannot be changed")
    if current == "accepted" and target in ("accepted", "rejected"):
        raise HTTPException(status_code=400, detail="Accepted appointment cannot be accepted/rejected again")
    if current == "pending" and target == "completed":
        raise HTTPException(status_code=400, detail="Pending appointment must be accepted before completion")
    row.status = payload.status
    row.doctor_notes = payload.doctor_notes
    db.commit()
    db.refresh(row)
    db.add(
        Notification(
            user_id=row.patient_id,
            title="Appointment Updated",
            message=f"Your appointment on {row.appointment_date.strftime('%d %b %Y %I:%M %p')} is now {row.status}.",
            type="appointment",
        )
    )
    db.commit()
    return row


@router.patch("/update/{appointment_id}", response_model=AppointmentResponse)
def update_status_alias(
    appointment_id: int,
    payload: AppointmentUpdateStatus,
    current_user: User = Depends(require_roles("doctor", "admin")),
    db: Session = Depends(get_db),
):
    return update_status(appointment_id, payload, current_user, db)


@router.patch("/cancel/{appointment_id}", response_model=AppointmentResponse)
def cancel_appointment(
    appointment_id: int,
    current_user: User = Depends(require_roles("patient")),
    db: Session = Depends(get_db),
):
    row = db.query(Appointment).filter(Appointment.id == appointment_id, Appointment.patient_id == current_user.id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if row.status in ("completed", "rejected"):
        raise HTTPException(status_code=400, detail="Cannot cancel finalized appointment")
    row.status = "cancelled"
    db.commit()
    db.refresh(row)
    db.add(
        Notification(
            user_id=row.doctor_id,
            title="Appointment Cancelled",
            message=f"Patient cancelled appointment on {row.appointment_date.strftime('%d %b %Y %I:%M %p')}.",
            type="appointment",
        )
    )
    db.commit()
    return row


@router.post("/notes")
def add_note(payload: ConsultationNoteCreate, current_user: User = Depends(require_roles("doctor", "admin")), db: Session = Depends(get_db)):
    appt = db.query(Appointment).filter(Appointment.id == payload.appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if current_user.role == "doctor" and appt.doctor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    row = ConsultationNote(
        appointment_id=appt.id,
        doctor_id=appt.doctor_id,
        patient_id=appt.patient_id,
        note=payload.note,
    )
    db.add(row)
    db.commit()
    return {"message": "Note added"}


@router.post("/notes/{appointment_id}")
def add_note_alias(appointment_id: int, payload: dict, current_user: User = Depends(require_roles("doctor", "admin")), db: Session = Depends(get_db)):
    return add_note(ConsultationNoteCreate(appointment_id=appointment_id, note=payload.get("note", "")), current_user, db)


@router.get("/patient-history/{patient_id}")
def patient_history(patient_id: int, current_user: User = Depends(require_roles("doctor", "admin")), db: Session = Depends(get_db)):
    if current_user.role == "doctor":
        has_access = (
            db.query(Appointment)
            .filter(Appointment.patient_id == patient_id, Appointment.doctor_id == current_user.id)
            .first()
            is not None
        )
        if not has_access:
            raise HTTPException(status_code=403, detail="No access to this patient")
    records = (
        db.query(PatientRecord)
        .filter(PatientRecord.user_id == patient_id)
        .order_by(PatientRecord.created_at.desc())
        .limit(50)
        .all()
    )
    return records


@router.post("/followup")
def followup(payload: dict, current_user: User = Depends(require_roles("doctor", "admin")), db: Session = Depends(get_db)):
    appointment_id = payload.get("appointment_id")
    action = payload.get("action", "Return in 1 month")
    row = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if current_user.role == "doctor" and row.doctor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    row.doctor_notes = (row.doctor_notes or "") + f"\nFollow-up: {action}"
    db.commit()
    return {"message": "Follow-up saved"}
