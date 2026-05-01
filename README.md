# Job Tracker App

A full-stack web application to track job applications.

## Tech Stack
- Backend: Python, FastAPI
- Database: PostgreSQL ✅
- ORM: SQLAlchemy ✅
- Frontend: React (coming soon)

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

## Status
🚧 In progress — Day 3 complete

## What's built so far
- FastAPI server running locally
- 4 working API endpoints
- Jobs permanently saved in PostgreSQL database
- Data survives server restarts