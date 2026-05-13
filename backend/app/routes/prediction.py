from fastapi import APIRouter, HTTPException
from app.schemas.prediction import CKDInput, PredictionResult, ModelInfo, FeaturesInfo
from app.models.ckd_model import CKDModel

router = APIRouter()

hfsa_model = CKDModel()

@router.on_event("startup")
async def startup_event():
    result = hfsa_model.fit()

@router.get("/", tags=["Health"])
def read_root():
    return {"message": "HFSA-CKD API is running", "status": "active"}

@router.get("/model-info", tags=["Model"], response_model=ModelInfo)
def model_info():
    return {
        "model": "HFSA-CKD",
        "description": "Hybrid Feature-Selection Architecture with Stage-Aware Ensemble Learning",
        "cv_accuracy": getattr(hfsa_model, "cv_accuracy", None),
        "features": {
            "binary_classification": "CKD vs Not CKD",
            "multi_stage_classification": "CKD Stages 1-5",
            "confidence_scoring": "High/Medium/Low",
            "feature_selection": "Pearson -> Chi-Square -> RFECV",
            "ensemble": "Random Forest + XGBoost + AdaBoost"
        }
    }

@router.post("/predict", tags=["Prediction"], response_model=PredictionResult)
def predict(input_data: CKDInput):
    try:
        result = hfsa_model.predict(input_data.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/features", tags=["Model"], response_model=FeaturesInfo)
def get_features():
    return {
        "numeric_features": ["age", "bp", "sg", "al", "su", "bgr", "bu", "sc", "sod", "pot", "hemo", "pcv", "wbcc", "rbcc"],
        "categorical_features": ["rbc", "pc", "pcc", "ba", "htn", "dm", "cad", "appet", "pe", "ane"],
        "input_format": "JSON with all 24 features"
    }
