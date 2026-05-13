from fastapi import FastAPI
from app.core.config import app as fastapi_app
from app.core.config import create_tables
from app.core.config import SessionLocal
from app.core.seed import seed_demo_data
from app.routes.prediction import router as prediction_router
from app.routes.auth import router as auth_router
from app.routes.records import router as records_router
from app.routes.dashboards import router as dashboards_router
from app.routes.analytics import router as analytics_router
from app.routes.recommendations import router as recommendations_router
from app.routes.reports import router as reports_router
from app.routes.notifications import router as notifications_router
from app.routes.ai_tools import router as ai_tools_router
from app.routes.appointments import router as appointments_router
from app.routes.admin_users import router as admin_users_router
from app.routes.platform import router as platform_router

app = fastapi_app
app.include_router(prediction_router)
app.include_router(auth_router)
app.include_router(records_router)
app.include_router(dashboards_router)
app.include_router(analytics_router)
app.include_router(recommendations_router)
app.include_router(reports_router)
app.include_router(notifications_router)
app.include_router(ai_tools_router)
app.include_router(appointments_router)
app.include_router(admin_users_router)
app.include_router(platform_router)
app.add_event_handler("startup", create_tables)


def _seed_on_startup():
    db = SessionLocal()
    try:
        seed_demo_data(db)
    finally:
        db.close()


app.add_event_handler("startup", _seed_on_startup)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
