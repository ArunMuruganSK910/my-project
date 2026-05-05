# Job Tracker App

A full-stack web application to track job applications — built with a luxury beach aesthetic.

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
| frontend/src/video.mp4 | Background hero video |
| frontend/src/music.mp3 | Ambient music player |

## Features
- Full CRUD — add, view, update, delete job applications
- Data saved permanently in PostgreSQL
- Ocean wave video background hero
- Glassmorphism UI — frosted glass cards and sidebar
- Animated music visualizer with volume control
- Sidebar with navigation, search, quick stats, filter and sort
- Animated number counters
- Progress bar per application
- Success rate tracker
- Colour coded status badges
- Smooth animations and hover effects

## Status
🚧 In progress — Day 6 complete

## How to run locally

### Backend
cd my-project
venv\Scripts\activate
uvicorn main:app --reload

### Frontend
cd my-project\frontend
npm start

Then open http://localhost:3000