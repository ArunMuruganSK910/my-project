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
| PUT | /jobs/{id} | Update a job |
| DELETE | /jobs/{id} | Delete a job |

## Project Structure
| File | What it does |
|------|-------------|
| main.py | All API endpoints |
| models.py | Defines the Job table in PostgreSQL |
| database.py | Handles PostgreSQL connection |
| frontend/src/App.js | React frontend UI |

## Features
- Add a new job application
- View all applications in a table
- Update application status (Applied, Interview, Rejected, Offer)
- Delete an application
- Data saved permanently in PostgreSQL

## Status
🚧 In progress — Day 5 complete

## How to run locally

### Backend
cd my-project
venv\Scripts\activate
uvicorn main:app --reload

### Frontend
cd my-project\frontend
npm start

Then open http://localhost:3000