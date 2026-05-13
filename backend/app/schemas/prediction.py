from pydantic import BaseModel
from typing import Optional

class CKDInput(BaseModel):
    age: float
    bp: float
    sg: float
    al: float
    su: float
    rbc: str
    pc: str
    pcc: str
    ba: str
    bgr: float
    bu: float
    sc: float
    sod: float
    pot: float
    hemo: float
    pcv: float
    wbcc: float
    rbcc: float
    htn: str
    dm: str
    cad: str
    appet: str
    pe: str
    ane: str

class PredictionResult(BaseModel):
    binary_prediction: str
    binary_probability: float
    stage_prediction: Optional[int]
    stage_probability: Optional[float]
    confidence_score: str
    confidence_value: float
    risk_level: str
    feature_importance: dict

class ModelInfo(BaseModel):
    model: str
    description: str
    features: dict

class FeaturesInfo(BaseModel):
    numeric_features: list
    categorical_features: list
    input_format: str