# HFSA-CKD Platform

AI-powered full-stack healthcare platform for **early CKD prediction**, **stage-aware clinical support**, and **multi-role care workflows**.

---

## Project Overview

**HFSA-CKD** is built as a healthcare SaaS-style system (not a basic ML demo) with:
- Patient, Doctor, and Admin workspaces
- CKD risk prediction + stage estimation
- OCR-assisted report upload
- Clinical recommendations
- Records, appointments, notifications, analytics, and reports

---

## Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS
- Recharts / Chart visual components
- Lucide icons

### Backend
- FastAPI
- JWT Authentication
- Role-Based Access Control (RBAC)
- SQLAlchemy ORM

### Database
- SQLite (default local dev)

### AI/ML
- Python
- scikit-learn
- XGBoost
- Random Forest / Ensemble logic
- Pandas, NumPy

---

## Folder Structure

```text
Capstone/
├─ frontend/                 # React + Tailwind app
│  ├─ src/
│  │  ├─ pages/
│  │  ├─ components/
│  │  ├─ services/
│  │  └─ context/
│  └─ package.json
├─ backend/                  # FastAPI app
│  ├─ app/
│  │  ├─ core/
│  │  ├─ models/
│  │  ├─ routes/
│  │  └─ schemas/
│  ├─ main.py
│  ├─ requirements.txt
│  └─ hfsa_ckd.db
└─ dataset/
   └─ ckd_data.csv
```

---

## Implemented Modules

- Authentication (Register/Login/Forgot/Reset)
- Patient Dashboard + AI Assessment + Records
- Appointment Booking/Management
- Notifications
- CKD Education
- Doctor Dashboard + Patient Management
- Admin Dashboard + User Management
- Model Analytics + Audit Logs + System Health + Reports Center
- OCR upload + prediction save flow

---

## Local Setup

## 1) Backend Setup

```powershell
cd E:\Rohan\Capstone\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000
```

Backend URL: `http://127.0.0.1:8000`  
Swagger Docs: `http://127.0.0.1:8000/docs`

## 2) Frontend Setup

```powershell
cd E:\Rohan\Capstone\frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

---

## Demo Seed Accounts

On first clean DB seed:
- **Admin**: `admin1` / `Admin@123`
- **Doctor**: `doctor1` / `Doctor@123`
- **Patient**: `patient1` / `Patient@123`

If DB already has users, create new accounts from Auth/Register or Admin workspace.

---

## Key API Groups

- `/api/auth/*` - auth, profile, password, account actions
- `/api/records/*` - predict-save, list records, upload-predict
- `/api/appointments/*` - doctor list, booking, status updates, notes
- `/api/notifications/*` - fetch/read/read-all/delete
- `/api/dashboards/*` - patient/doctor/admin dashboard data
- `/api/platform/*` - admin users, analytics, audit, health, reports

---

## Role Workflow

### Patient
1. Register/Login
2. Fill AI assessment or upload report
3. View risk/stage result and recommendations
4. Track records and book doctor appointments

### Doctor
1. Login
2. Review patient list and history
3. Manage appointments and notes
4. Monitor risk analytics

### Admin
1. Login
2. Manage users and assignments
3. Review model/system analytics
4. Manage reports and audit visibility

---

## Deployment (Suggested)

- **Frontend**: Vercel
- **Backend**: Render / Railway

Use environment variables for secrets (JWT keys, DB URL, etc.) before production deployment.

---

## Current Status

Project is functional and modular with major requested workflows implemented.  
Recommended final step before submission: run complete role-wise QA pass on a fresh backend restart and database.

