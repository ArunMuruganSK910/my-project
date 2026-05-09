from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db, Base
from models import Job as JobModel
from pydantic import BaseModel

Base.metadata.create_all(bind=engine)

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

class Job(BaseModel):
    company: str
    role: str
    status: str

@app.get("/")
def home():
    return {"message": "Job Tracker API is running!"}

@app.get("/jobs")
def get_jobs(db: Session = Depends(get_db)):
    jobs = db.query(JobModel).all()
    return {"jobs": jobs}

@app.post("/jobs")
def add_job(job: Job, db: Session = Depends(get_db)):
    new_job = JobModel(company=job.company, role=job.role, status=job.status)
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
    db.commit()
    db.refresh(existing_job)
    return {"message": "Job updated!", "job": existing_job}