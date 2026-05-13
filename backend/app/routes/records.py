from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List
import json
from app.core.config import get_db, create_tables
from app.core.file_extractor import extract_medical_features
from app.models.database import PatientRecord
from app.models.auth import get_current_user
from app.models.database import User
from app.models.ckd_model import CKDModel
from app.schemas.auth import RecordCreate, RecordResponse, RecordBase

router = APIRouter(prefix="/api/records", tags=["Patient Records"])

hfsa_model = None

def get_model():
    global hfsa_model
    if hfsa_model is None:
        hfsa_model = CKDModel()
        hfsa_model.fit()
    return hfsa_model

@router.post("/predict-and-save", response_model=RecordResponse)
def predict_and_save(
    record: RecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    create_tables()
    
    model = get_model()
    input_dict = record.dict(exclude_none=True)
    
    result = model.predict(input_dict)
    
    db_record = PatientRecord(
        user_id=current_user.id,
        **record.dict(),
        binary_prediction=result["binary_prediction"],
        binary_probability=result["binary_probability"],
        stage_prediction=result.get("stage_prediction"),
        confidence_score=result["confidence_score"],
        risk_level=result["risk_level"],
        prediction_result=json.dumps(result)
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.get("/", response_model=List[RecordResponse])
def get_records(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = db.query(PatientRecord).filter(
        PatientRecord.user_id == current_user.id
    ).order_by(PatientRecord.created_at.desc()).all()
    return records

@router.get("/{record_id}", response_model=RecordResponse)
def get_record(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(PatientRecord).filter(
        PatientRecord.id == record_id,
        PatientRecord.user_id == current_user.id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    
    return record

@router.delete("/{record_id}")
def delete_record(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(PatientRecord).filter(
        PatientRecord.id == record_id,
        PatientRecord.user_id == current_user.id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    
    db.delete(record)
    db.commit()
    return {"message": "Record deleted"}

@router.post("/extract-from-file")
async def extract_from_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    ALLOWED_TYPES = {
        'pdf': ['application/pdf', 'application/x-pdf'],
        'png': ['image/png'],
        'jpg': ['image/jpeg'],
        'jpeg': ['image/jpeg'],
        'gif': ['image/gif'],
        'bmp': ['image/bmp'],
        'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        'txt': ['text/plain', 'text/csv'],
    }
    
    content = await file.read()
    filename = file.filename.lower()
    
    extracted = extract_medical_features(content, filename)
    
    return {
        "file_name": file.filename,
        "extracted_values": extracted,
        "file_type": filename.split('.')[-1],
        "message": f"Extracted {len(extracted)} values from {filename}"
    }

@router.post("/upload-and-predict")
async def upload_and_predict(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    create_tables()
    
    content = await file.read()
    filename = file.filename.lower()
    
    extracted = extract_medical_features(content, filename)
    
    if not extracted:
        if filename.endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail="Could not parse PDF report. Ensure pdfplumber is installed (`pip install pdfplumber`) and upload a text-based medical PDF."
            )
        raise HTTPException(
            status_code=400,
            detail="Could not extract medical features from file. Please upload a clearer report or enter values manually."
        )
    
    model = get_model()
    result = model.predict(extracted)
    
    db_record = PatientRecord(
        user_id=current_user.id,
        file_name=file.filename,
        **extracted,
        binary_prediction=result["binary_prediction"],
        binary_probability=result["binary_probability"],
        stage_prediction=result.get("stage_prediction"),
        confidence_score=result["confidence_score"],
        risk_level=result["risk_level"],
        prediction_result=json.dumps(result)
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    
    return {
        "record": db_record,
        "extracted_values": extracted,
        "prediction": result,
        "message": "File processed and prediction saved successfully"
    }
