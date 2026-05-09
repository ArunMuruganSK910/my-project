from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db, Base
from models import Job as JobModel
from pydantic import BaseModel
from typing import Optional
from googleapiclient.discovery import build
from google.oauth2 import service_account
from datetime import date
import os
import json

# ─── Google Calendar Function ────────────────────────────────────────────────

def add_to_google_calendar(company: str, role: str, interview_date):
    try:
        SCOPES = ['https://www.googleapis.com/auth/calendar']

        # Render stores secret files at /etc/secrets/
        render_path = '/etc/secrets/google_credentials.json'
        local_path  = 'credentials/google_credentials.json'

        if os.path.exists(render_path):
            creds = service_account.Credentials.from_service_account_file(
                render_path, scopes=SCOPES
            )
        else:
            creds = service_account.Credentials.from_service_account_file(
                local_path, scopes=SCOPES
            )

        service = build('calendar', 'v3', credentials=creds)
        CALENDAR_ID = os.getenv("GOOGLE_CALENDAR_ID", "primary")

        event = {
            'summary': f'Interview at {company} — {role}',
            'description': f'Interview for {role} at {company}. Added by Job Tracker.',
            'start': {'date': str(interview_date), 'timeZone': 'Asia/Kolkata'},
            'end':   {'date': str(interview_date), 'timeZone': 'Asia/Kolkata'},
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'email',  'minutes': 24 * 60},
                    {'method': 'popup',  'minutes': 60},
                ],
            },
        }
        created = service.events().insert(calendarId=CALENDAR_ID, body=event).execute()
        print(f"✅ Calendar event created: {created.get('htmlLink')}")
        return True
    except Exception as e:
        print(f"❌ Calendar error: {e}")
        return False

# ─── Database Setup ──────────────────────────────────────────────────────────

Base.metadata.create_all(bind=engine)

from sqlalchemy import text
with engine.connect() as conn:
    conn.execute(text("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS interview_date VARCHAR"))
    conn.commit()

# ─── App & CORS ──────────────────────────────────────────────────────────────

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://jobtracker-frontend-j1u4.onrender.com"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Pydantic Schema ─────────────────────────────────────────────────────────

class Job(BaseModel):
    company: str
    role: str
    status: str
    interview_date: Optional[str] = None

# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/")
def home():
    return {"message": "Job Tracker API is running!"}

@app.get("/jobs")
def get_jobs(db: Session = Depends(get_db)):
    jobs = db.query(JobModel).all()
    return {"jobs": jobs}

@app.post("/jobs")
def add_job(job: Job, db: Session = Depends(get_db)):
    new_job = JobModel(
        company=job.company,
        role=job.role,
        status=job.status,
        interview_date=job.interview_date
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return {"message": "Job added!", "job": new_job}

@app.get("/jobs/{job_id}")
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(JobModel).filter(JobModel.id == job_id).first()
    if job is None:
        return {"error": "Job not found"}
    return {"job": job}

@app.delete("/jobs/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(JobModel).filter(JobModel.id == job_id).first()
    if job is None:
        return {"error": "Job not found"}
    db.delete(job)
    db.commit()
    return {"message": "Job deleted!"}

@app.put("/jobs/{job_id}")
def update_job(job_id: int, job: Job, db: Session = Depends(get_db)):
    existing_job = db.query(JobModel).filter(JobModel.id == job_id).first()
    if existing_job is None:
        return {"error": "Job not found"}

    existing_job.company = job.company
    existing_job.role = job.role
    existing_job.status = job.status

    # Only trigger calendar if interview_date is new or changed
    if job.interview_date and job.interview_date != existing_job.interview_date:
        existing_job.interview_date = job.interview_date
        add_to_google_calendar(
            existing_job.company,
            existing_job.role,
            existing_job.interview_date
        )
    else:
        existing_job.interview_date = job.interview_date

    db.commit()
    db.refresh(existing_job)
    return {"message": "Job updated!", "job": existing_job}