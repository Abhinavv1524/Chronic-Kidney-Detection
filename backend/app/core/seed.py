from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.database import User, DoctorProfile, Appointment, PatientRecord
from app.models.auth import get_password_hash


def seed_demo_data(db: Session):
    if db.query(User).count() > 0:
        return

    admin = User(
        email="admin@hfsa.local",
        username="admin1",
        full_name="System Admin",
        role="admin",
        hashed_password=get_password_hash("Admin@123"),
    )
    doctor1 = User(
        email="doctor1@hfsa.local",
        username="doctor1",
        full_name="Dr. Meera Sharma",
        role="doctor",
        hashed_password=get_password_hash("Doctor@123"),
    )
    doctor2 = User(
        email="doctor2@hfsa.local",
        username="doctor2",
        full_name="Dr. Arjun Rao",
        role="doctor",
        hashed_password=get_password_hash("Doctor@123"),
    )
    patient1 = User(
        email="patient1@hfsa.local",
        username="patient1",
        full_name="Rahul Verma",
        role="patient",
        hashed_password=get_password_hash("Patient@123"),
    )
    patient2 = User(
        email="patient2@hfsa.local",
        username="patient2",
        full_name="Anita Singh",
        role="patient",
        hashed_password=get_password_hash("Patient@123"),
    )
    db.add_all([admin, doctor1, doctor2, patient1, patient2])
    db.commit()
    db.refresh(doctor1)
    db.refresh(doctor2)
    db.refresh(patient1)
    db.refresh(patient2)

    dp1 = DoctorProfile(
        user_id=doctor1.id, specialization="Nephrology", experience_years=12, qualification="MD", hospital="City Care Hospital"
    )
    dp2 = DoctorProfile(
        user_id=doctor2.id, specialization="Internal Medicine", experience_years=9, qualification="MD", hospital="Sunrise Medical Center"
    )
    db.add_all([dp1, dp2])

    ap1 = Appointment(
        patient_id=patient1.id,
        doctor_id=doctor1.id,
        appointment_date=datetime.utcnow() + timedelta(days=1),
        reason="CKD follow-up",
        status="pending",
    )
    ap2 = Appointment(
        patient_id=patient2.id,
        doctor_id=doctor2.id,
        appointment_date=datetime.utcnow() + timedelta(days=2),
        reason="Lab report review",
        status="accepted",
    )
    db.add_all([ap1, ap2])

    rec1 = PatientRecord(
        user_id=patient1.id,
        age=49, bp=86, sg=1.02, al=1, su=0, rbc="normal", pc="normal", pcc="notpresent", ba="notpresent",
        bgr=128, bu=42, sc=1.5, sod=137, pot=4.4, hemo=13.1, pcv=40, wbcc=7600, rbcc=4.7,
        htn="yes", dm="no", cad="no", appet="good", pe="no", ane="no",
        binary_prediction="CKD", binary_probability=0.67, stage_prediction=2, confidence_score="Medium", risk_level="Moderate",
    )
    rec2 = PatientRecord(
        user_id=patient2.id,
        age=56, bp=92, sg=1.01, al=2, su=1, rbc="abnormal", pc="abnormal", pcc="present", ba="present",
        bgr=165, bu=58, sc=2.3, sod=134, pot=4.9, hemo=11.2, pcv=34, wbcc=9800, rbcc=3.9,
        htn="yes", dm="yes", cad="no", appet="poor", pe="yes", ane="yes",
        binary_prediction="CKD", binary_probability=0.86, stage_prediction=4, confidence_score="High", risk_level="High",
    )
    db.add_all([rec1, rec2])
    db.commit()
