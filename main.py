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
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# ─── Google Calendar Function ────────────────────────────────────────────────

def add_to_google_calendar(company: str, role: str, interview_date):
    try:
        SCOPES = ['https://www.googleapis.com/auth/calendar']
        render_path = '/etc/secrets/google_credentials.json'
        local_path  = 'credentials/google_credentials.json'
        if os.path.exists(render_path):
            creds = service_account.Credentials.from_service_account_file(render_path, scopes=SCOPES)
        else:
            creds = service_account.Credentials.from_service_account_file(local_path, scopes=SCOPES)
        service = build('calendar', 'v3', credentials=creds)
        CALENDAR_ID = os.getenv("GOOGLE_CALENDAR_ID", "arunmuruganskprof@gmail.com")
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

# ─── Email Notification Function ─────────────────────────────────────────────

def send_interview_reminder(company: str, role: str, interview_date):
    try:
        EMAIL_ADDRESS  = os.getenv("EMAIL_ADDRESS")
        EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
        if not EMAIL_ADDRESS or not EMAIL_PASSWORD:
            print("❌ Email env vars not set")
            return False

        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"🎯 Interview Reminder: {company} — {role}"
        msg["From"]    = EMAIL_ADDRESS
        msg["To"]      = EMAIL_ADDRESS

        html = f"""
        <div style="font-family:'Helvetica Neue',sans-serif;max-width:600px;margin:0 auto;background:linear-gradient(135deg,#c8e8f5,#ddf0f8);border-radius:24px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#03045e,#0096c7);padding:40px;text-align:center;">
            <h1 style="color:#fff;font-size:12px;letter-spacing:8px;margin:0 0 12px;">CAREER TRACKER</h1>
            <p style="color:#90e0ef;font-size:10px;letter-spacing:4px;margin:0;">INTERVIEW REMINDER</p>
          </div>
          <div style="padding:40px;">
            <div style="background:rgba(255,255,255,0.7);border-radius:16px;padding:28px;margin-bottom:20px;border:1px solid rgba(255,255,255,0.9);">
              <p style="font-size:10px;letter-spacing:4px;color:#0096c7;margin:0 0 8px;font-weight:700;">COMPANY</p>
              <p style="font-size:24px;font-weight:900;color:#03045e;margin:0;letter-spacing:2px;">{company.upper()}</p>
            </div>
            <div style="background:rgba(255,255,255,0.7);border-radius:16px;padding:28px;margin-bottom:20px;border:1px solid rgba(255,255,255,0.9);">
              <p style="font-size:10px;letter-spacing:4px;color:#0096c7;margin:0 0 8px;font-weight:700;">ROLE</p>
              <p style="font-size:18px;font-weight:700;color:#03045e;margin:0;">{role}</p>
            </div>
            <div style="background:rgba(244,162,97,0.15);border-radius:16px;padding:28px;border:1px solid rgba(244,162,97,0.4);">
              <p style="font-size:10px;letter-spacing:4px;color:#f4a261;margin:0 0 8px;font-weight:700;">INTERVIEW DATE</p>
              <p style="font-size:22px;font-weight:900;color:#03045e;margin:0;">{interview_date}</p>
              <p style="font-size:12px;color:#f4a261;margin:8px 0 0;font-weight:700;">⏰ TOMORROW — BE PREPARED!</p>
            </div>
            <div style="text-align:center;margin-top:32px;">
              <a href="https://jobtracker-frontend-j1u4.onrender.com" style="background:linear-gradient(135deg,#0096c7,#48cae4);color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:10px;font-weight:800;letter-spacing:3px;">VIEW IN CAREER TRACKER</a>
            </div>
          </div>
          <div style="padding:20px;text-align:center;border-top:1px solid rgba(255,255,255,0.4);">
            <p style="font-size:9px;letter-spacing:3px;color:#4a7a99;margin:0;">CAREER TRACKER · RIDE THE WAVE 2025</p>
          </div>
        </div>
        """

        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            smtp.sendmail(EMAIL_ADDRESS, EMAIL_ADDRESS, msg.as_string())

        print(f"✅ Email reminder sent for {company} interview!")
        return True
    except Exception as e:
        print(f"❌ Email error: {e}")
        return False

# ─── Check & Send Reminders (called on startup + via endpoint) ───────────────

def check_and_send_reminders(db: Session):
    from datetime import date, timedelta
    tomorrow = date.today() + timedelta(days=1)
    jobs = db.query(JobModel).all()
    for job in jobs:
        if job.interview_date:
            interview = job.interview_date
            if isinstance(interview, str):
                from datetime import datetime
                interview = datetime.strptime(interview[:10], "%Y-%m-%d").date()
            if interview == tomorrow:
                print(f"📧 Sending reminder for {job.company} interview tomorrow...")
                send_interview_reminder(job.company, job.role, str(interview))

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

@app.get("/send-reminders")
def trigger_reminders(db: Session = Depends(get_db)):
    """Manually trigger email reminders — call this daily via a cron job"""
    check_and_send_reminders(db)
    return {"message": "Reminders checked and sent!"}

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
    if job.interview_date:
        add_to_google_calendar(job.company, job.role, job.interview_date)
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
    if job.interview_date and job.interview_date != existing_job.interview_date:
        existing_job.interview_date = job.interview_date
        add_to_google_calendar(existing_job.company, existing_job.role, existing_job.interview_date)
    else:
        existing_job.interview_date = job.interview_date
    db.commit()
    db.refresh(existing_job)
    return {"message": "Job updated!", "job": existing_job}