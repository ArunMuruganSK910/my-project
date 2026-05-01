# Job Tracker App

A full-stack web application to track job applications.

## Tech Stack
- Backend: Python, FastAPI ✅
- Database: PostgreSQL ✅
- ORM: SQLAlchemy ✅
- Frontend: React ✅

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | Health check |
| GET | /jobs | Get all jobs |
| POST | /jobs | Add a new job |
| GET | /jobs/{id} | Get a specific job |

## Project Structure
| File | What it does |
|------|-------------|
| main.py | API endpoints live here |
| models.py | Defines what a Job looks like in the database |
| database.py | Handles the connection to PostgreSQL |
| frontend/src/App.js | React frontend UI |

## Status
✅ Week 1 complete — Full stack app working!

## What's built so far
- FastAPI backend with 4 working API endpoints
- PostgreSQL database — data saved permanently
- React frontend with a form to add jobs
- Full stack connected — frontend talks to backend talks to database
- Deployed locally and fully functional

## How to run locally

### Backend
cd my-project
venv\Scripts\activate
uvicorn main:app --reload

### Frontend
cd my-project\frontend
npm start

Then open http://localhost:3000