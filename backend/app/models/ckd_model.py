import numpy as np
import pandas as pd
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.impute import SimpleImputer
from sklearn.feature_selection import SelectKBest, chi2, RFE
from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE
import joblib
import os

class CKDModel:
    def __init__(self):
        self.models = {}
        self.feature_cols = None
        self.label_encoders = {}
        self.imputer_num = SimpleImputer(strategy='mean')
        self.imputer_cat = SimpleImputer(strategy='most_frequent')
        self.scaler = MinMaxScaler()
        self.selected_features = None
        self.smote = SMOTE(random_state=42)
        self.is_fitted = False
        self.cv_accuracy = None
        self.numeric_cols = ['age', 'bp', 'sg', 'al', 'su', 'bgr', 'bu', 'sc', 'sod', 'pot', 'hemo', 'pcv', 'wbcc', 'rbcc']
        self.categorical_cols = ['rbc', 'pc', 'pcc', 'ba', 'htn', 'dm', 'cad', 'appet', 'pe', 'ane']
        
    def load_data(self):
        dataset_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "..", "..", "dataset", "ckd_data.csv")
        )
        if os.path.exists(dataset_path):
            return pd.read_csv(dataset_path)

        from ucimlrepo import fetch_ucirepo
        ckd = fetch_ucirepo(id=336)
        return pd.concat([ckd.data.features, ckd.data.targets], axis=1)
    
    def preprocess(self, df):
        df = df.copy()
        
        for col in self.numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
        
        df[self.numeric_cols] = self.imputer_num.fit_transform(df[self.numeric_cols])
        
        for col in self.categorical_cols:
            if col in df.columns:
                df[col] = df[col].fillna(df[col].mode()[0] if len(df[col].mode()) > 0 else 'normal')
        
        for col in self.categorical_cols:
            if col not in self.label_encoders:
                self.label_encoders[col] = LabelEncoder()
                df[col] = self.label_encoders[col].fit_transform(df[col].astype(str))
            else:
                df[col] = df[col].astype(str).apply(lambda x: self.label_encoders[col].transform([x])[0] if x in self.label_encoders[col].classes_ else 0)
        
        df['class'] = df['class'].map({'ckd': 1, 'notckd': 0})
        
        return df
    
    def hybrid_feature_selection(self, X, y, feature_names):
        if len(np.unique(y)) < 2:
            return list(range(X.shape[1]))
        
        X_sel = X.copy()
        pearson_corr = np.array([abs(np.corrcoef(X[:, i], y)[0, 1] if not np.isnan(np.corrcoef(X[:, i], y)[0, 1]) else 0) for i in range(X.shape[1])])
        
        threshold = np.percentile(pearson_corr, 50)
        pearson_selected = np.where(pearson_corr >= threshold)[0].tolist()
        
        if len(pearson_selected) < 2:
            pearson_selected = list(range(X.shape[1]))
        
        X_pearson = X_sel[:, pearson_selected]
        
        chi2_selector = SelectKBest(chi2, k=min(15, X_pearson.shape[1]))
        X_chi2 = chi2_selector.fit_transform(X_pearson, y)
        chi2_selected_mask = chi2_selector.get_support()
        chi2_selected = [pearson_selected[i] for i in range(len(pearson_selected)) if chi2_selected_mask[i]]
        
        if len(chi2_selected) < 2:
            return list(range(X.shape[1]))
        
        rf = RandomForestClassifier(n_estimators=10, random_state=42, n_jobs=-1)
        rfe = RFE(estimator=rf, n_features_to_select=min(12, len(chi2_selected)), step=1)
        rfe.fit(X[:, chi2_selected], y)
        rfe_mask = rfe.support_
        final_selected = [chi2_selected[i] for i in range(len(chi2_selected)) if rfe_mask[i]]
        
        if len(final_selected) < 3:
            return chi2_selected[:min(10, len(chi2_selected))]
        
        return final_selected
    
    def create_multi_stage_labels(self, y, X):
        stages = np.zeros(len(y))
        for i in range(len(y)):
            if y[i] == 0:
                stages[i] = 0
            elif y[i] == 1:
                risk_score = 0
                try:
                    hemo_idx = self.numeric_cols.index('hemo')
                    if X[i, hemo_idx] < 10:
                        risk_score += 2
                    elif X[i, hemo_idx] < 13:
                        risk_score += 1
                except: pass
                try:
                    sc_idx = self.numeric_cols.index('sc')
                    if X[i, sc_idx] > 3:
                        risk_score += 2
                    elif X[i, sc_idx] > 1.5:
                        risk_score += 1
                except: pass
                try:
                    bu_idx = self.numeric_cols.index('bu')
                    if X[i, bu_idx] > 100:
                        risk_score += 2
                    elif X[i, bu_idx] > 50:
                        risk_score += 1
                except: pass
                
                if risk_score >= 4:
                    stages[i] = 5
                elif risk_score >= 3:
                    stages[i] = 4
                elif risk_score >= 2:
                    stages[i] = 3
                elif risk_score >= 1:
                    stages[i] = 2
                else:
                    stages[i] = 1
        return stages.astype(int)
    
    def fit(self):
        print("Loading data...")
        df = self.load_data()
        
        df = self.preprocess(df)
        
        self.feature_cols = self.numeric_cols + self.categorical_cols
        df = df.dropna(subset=['class'])
        X = df[self.feature_cols].values
        y = df['class'].values
        
        mask = ~(np.isnan(X).any(axis=1) | np.isnan(y))
        X = X[mask]
        y = y[mask]
        
        X_scaled = self.scaler.fit_transform(X)
        
        print("Performing hybrid feature selection...")
        self.selected_features = self.hybrid_feature_selection(X_scaled, y, self.feature_cols)
        print(f"Selected {len(self.selected_features)} features")
        
        X_selected = X_scaled[:, self.selected_features]
        
        print("Creating multi-stage labels...")
        stage_labels = self.create_multi_stage_labels(y, X)
        
        print("Applying SMOTE for class balancing...")
        try:
            X_balanced, y_balanced = self.smote.fit_resample(X_selected, y)
            smote_indices = self.smote.sample_indices_
            stage_labels = stage_labels[smote_indices]
        except:
            X_balanced, y_balanced = X_selected, y
        
        print("Training ensemble models...")
        
        rf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
        xgb = XGBClassifier(n_estimators=100, max_depth=5, learning_rate=0.1, random_state=42, use_label_encoder=False, eval_metric='logloss')
        ada = AdaBoostClassifier(n_estimators=100, learning_rate=0.1, random_state=42)
        
        rf.fit(X_balanced, y_balanced)
        xgb.fit(X_balanced, y_balanced)
        ada.fit(X_balanced, y_balanced)
        
        self.models['rf'] = rf
        self.models['xgb'] = xgb
        self.models['ada'] = ada
        
        rf_stage = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
        xgb_stage = XGBClassifier(n_estimators=100, max_depth=5, learning_rate=0.1, random_state=42, use_label_encoder=False, eval_metric='logloss')
        
        rf_stage.fit(X_balanced, stage_labels)
        xgb_stage.fit(X_balanced, stage_labels)
        
        self.models['rf_stage'] = rf_stage
        self.models['xgb_stage'] = xgb_stage
        
        self.is_fitted = True
        
        print("Calculating feature importance...")
        self.feature_importance = dict(zip([self.feature_cols[i] for i in self.selected_features], 
                                       self.models['rf'].feature_importances_.tolist()))
        
        print("Training complete!")
        
        scores = cross_val_score(self.models['rf'], X_balanced, y_balanced, cv=5, scoring='accuracy')
        self.cv_accuracy = float(scores.mean())
        print(f"Cross-validation accuracy: {scores.mean():.4f} (+/- {scores.std()*2:.4f})")
        
        return {"status": "Training complete!", "cv_accuracy": scores.mean()}
    
    def predict(self, input_data: dict):
        if not self.is_fitted:
            raise Exception("Model not trained yet")
        
        df = pd.DataFrame([input_data])

        # Ensure all expected model columns exist even when OCR extracts partial data.
        for col in self.numeric_cols:
            if col not in df.columns:
                df[col] = np.nan
        for col in self.categorical_cols:
            if col not in df.columns:
                df[col] = "unknown"
        
        for col in self.numeric_cols:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        
        df[self.numeric_cols] = self.imputer_num.transform(df[self.numeric_cols])
        
        for col in self.categorical_cols:
            df[col] = df[col].astype(str)
            df[col] = df[col].apply(lambda x: self.label_encoders[col].transform([x])[0] if x in self.label_encoders[col].classes_ else 0)
        
        X = df[self.feature_cols].values
        X_scaled = self.scaler.transform(X)
        X_selected = X_scaled[:, self.selected_features]
        
        rf_pred = self.models['rf'].predict_proba(X_selected)[0]
        xgb_pred = self.models['xgb'].predict_proba(X_selected)[0]
        ada_pred = self.models['ada'].predict_proba(X_selected)[0]
        
        binary_proba = (rf_pred[1] + xgb_pred[1] + ada_pred[1]) / 3
        binary_pred = 1 if binary_proba >= 0.5 else 0
        
        rf_stage_pred = self.models['rf_stage'].predict_proba(X_selected)[0]
        xgb_stage_pred = self.models['xgb_stage'].predict_proba(X_selected)[0]
        stage_proba = (rf_stage_pred + xgb_stage_pred) / 2
        stage_pred = np.argmax(stage_proba) if binary_pred == 1 else 0
        
        binary_agreement = 1 - (abs(rf_pred[1] - xgb_pred[1]) + abs(rf_pred[1] - ada_pred[1]) + abs(xgb_pred[1] - ada_pred[1])) / 3
        confidence_value = (binary_proba * 0.6 + binary_agreement * 0.4)
        
        if confidence_value >= 0.8:
            confidence_score = "High"
        elif confidence_value >= 0.6:
            confidence_score = "Medium"
        else:
            confidence_score = "Low"
        
        if binary_pred == 1:
            if stage_pred >= 4:
                risk_level = "Critical"
            elif stage_pred >= 3:
                risk_level = "High"
            elif stage_pred >= 2:
                risk_level = "Moderate"
            else:
                risk_level = "Low"
        else:
            risk_level = "Minimal"
        
        return {
            "binary_prediction": "CKD" if binary_pred == 1 else "Not CKD",
            "binary_probability": float(binary_proba),
            "stage_prediction": int(stage_pred) if binary_pred == 1 else None,
            "stage_probability": float(max(stage_proba)) if binary_pred == 1 else None,
            "confidence_score": confidence_score,
            "confidence_value": float(confidence_value),
            "risk_level": risk_level,
            "feature_importance": dict(sorted(self.feature_importance.items(), key=lambda x: x[1], reverse=True)[:10])
        }
    
    def save(self, path: str):
        os.makedirs(path, exist_ok=True)
        joblib.dump(self, os.path.join(path, 'model.pkl'))
    
    @staticmethod
    def load(path: str):
        return joblib.load(os.path.join(path, 'model.pkl'))
