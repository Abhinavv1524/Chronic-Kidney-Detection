import re
import io
import json
import numpy as np
from typing import Dict, Any, Optional

class MedicalReportExtractor:
    FEATURE_PATTERNS = {
        'age': [
            r'(?:age[:\s]+)(\d+)',
            r'(\d+)\s*(?:years?|yrs?)',
        ],
        'bp': [
            r'(?:blood pressure|bp[:\s]+)(\d+)',
            r'(\d+)/(\d+)',
        ],
        'bgr': [
            r'(?:blood glucose|bgr|glucose[:\s]+)(\d+\.?\d*)',
            r'(\d+)\s*(?:mg/dl|mgs/dl)',
        ],
        'bu': [
            r'(?:blood urea|bu|urea[:\s]+)(\d+\.?\d*)',
        ],
        'sc': [
            r'(?:serum creatinine|sc|creatinine[:\s]+)(\d+\.?\d*)',
        ],
        'sod': [
            r'(?:sodium|sod[:\s]+)(\d+\.?\d*)',
        ],
        'pot': [
            r'(?:potassium|pot[:\s]+)(\d+\.?\d*)',
        ],
        'hemo': [
            r'(?:hemoglobin|hemo|hb[:\s]+)(\d+\.?\d*)',
        ],
        'pcv': [
            r'(?:packed cell volume|pcv|hct[:\s]+)(\d+\.?\d*)',
        ],
        'wbcc': [
            r'(?:white blood cell|wbc|wbcc|leukocytes[:\s]+)(\d+\.?\d*)',
        ],
        'rbcc': [
            r'(?:red blood cell|rbc|rbcc|erythrocytes[:\s]+)(\d+\.?\d*)',
        ],
        'sg': [
            r'(?:specific gravity|sg[:\s]+)(1\.0\d+)',
        ],
        'al': [
            r'(?:albumin|al[:\s]+)(\d+)',
        ],
        'su': [
            r'(?:sugar|su|glucose[:\s]+)(\d+)',
        ],
    }

    CATEGORICAL_VALUES = {
        'rbc': ['normal', 'abnormal'],
        'pc': ['normal', 'abnormal'],
        'pcc': ['present', 'not present', 'notpresent', 'absent'],
        'ba': ['present', 'not present', 'notpresent', 'absent'],
        'htn': ['yes', 'no', 'hypertension'],
        'dm': ['yes', 'no', 'diabetes'],
        'cad': ['yes', 'no', 'coronary'],
        'appet': ['good', 'poor'],
        'pe': ['yes', 'no', 'edema'],
        'ane': ['yes', 'no', 'anemia'],
    }

    def extract_from_pdf(self, content: bytes) -> Dict[str, Any]:
        extracted = {}
        text = ""
        
        try:
            import pdfplumber
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                    
                    for img in page.images:
                        pass
        except Exception as e:
            print(f"PDF extraction error: {e}")
        
        return self._extract_features(text)

    def extract_from_image(self, content: bytes) -> Dict[str, Any]:
        text = ""
        try:
            from PIL import Image
            img = Image.open(io.BytesIO(content))
            img_array = np.array(img)
            
            try:
                import pytesseract
                text = pytesseract.image_to_string(img)
            except Exception as e:
                print(f"OCR error: {e}")
                
        except Exception as e:
            print(f"Image extraction error: {e}")
        
        return self._extract_features(text)

    def extract_from_docx(self, content: bytes) -> Dict[str, Any]:
        text = ""
        try:
            from docx import Document
            doc = Document(io.BytesIO(content))
            for para in doc.paragraphs:
                text += para.text + "\n"
        except Exception as e:
            print(f"DOCX extraction error: {e}")
        
        return self._extract_features(text)

    def extract_from_text(self, content: bytes) -> Dict[str, Any]:
        try:
            text = content.decode('utf-8', errors='ignore')
        except:
            text = content.decode('latin-1', errors='ignore')
        
        return self._extract_features(text)

    def _extract_features(self, text: str) -> Dict[str, Any]:
        text = text.lower()
        extracted = {}
        
        for feature, patterns in self.FEATURE_PATTERNS.items():
            for pattern in patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    try:
                        value = match.group(1) if match.lastindex else match.group(0)
                        if feature in ['age', 'bp', 'bgr', 'bu', 'sc', 'sod', 'pot', 'hemo', 'pcv', 'wbcc', 'rbcc', 'sg', 'al', 'su']:
                            extracted[feature] = float(value)
                        else:
                            extracted[feature] = int(value)
                        break
                    except:
                        pass
        
        for feature, values in self.CATEGORICAL_VALUES.items():
            for value in values:
                if value.lower() in text:
                    if feature in ['rbc', 'pc']:
                        extracted[feature] = 'normal' if value.lower() in ['normal'] else 'abnormal'
                    elif feature in ['pcc', 'ba']:
                        extracted[feature] = 'present' if value.lower() in ['present'] else 'notpresent'
                    elif feature in ['htn', 'dm', 'cad', 'pe', 'ane']:
                        extracted[feature] = 'yes' if value.lower() in ['yes', 'hypertension', 'diabetes', 'coronary', 'edema', 'anemia'] else 'no'
                    else:
                        extracted[feature] = value.lower()
                    break
        
        if 'bp' in extracted and '/' in text:
            match = re.search(r'(\d+)/(\d+)', text)
            if match:
                extracted['bp'] = float(match.group(1))
        
        return extracted

    def extract(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        ext = filename.lower().split('.')[-1]
        
        if ext == 'pdf':
            return self.extract_from_pdf(file_content)
        elif ext in ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp']:
            return self.extract_from_image(file_content)
        elif ext == 'docx':
            return self.extract_from_docx(file_content)
        elif ext in ['txt', 'csv']:
            return self.extract_from_text(file_content)
        else:
            return self.extract_from_text(file_content)

extractor = MedicalReportExtractor()

def extract_medical_features(file_content: bytes, filename: str) -> Dict[str, Any]:
    return extractor.extract(file_content, filename)
