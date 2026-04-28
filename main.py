from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

jobs = []
job_counter = 0

class Job(BaseModel):
    company: str
    role: str
    status: str

@app.get("/")
def home():
    return {"message": "Job Tracker API is running!"}

@app.get("/jobs")
def get_jobs():
    return {"jobs": jobs}

@app.post("/jobs")
def add_job(job: Job):
    global job_counter
    job_counter += 1
    job_with_id = {"id": job_counter, "company": job.company, "role": job.role, "status": job.status}
    jobs.append(job_with_id)
    return {"message": "Job added!", "job": job_with_id}

@app.get("/jobs/{job_id}")
def get_job(job_id: int):
    for job in jobs:
        if job["id"] == job_id:
            return {"job": job}
    return {"error": "Job not found"}