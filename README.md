# 🎨 Job Tracker App
A full-stack web application to track job applications — built with a watercolor painter's sketchbook theme.



## 🌐 Live Demo
| Service | URL |
|---------|-----|
| Frontend | https://jobtracker-frontend-j1u4.onrender.com |
| Backend API | https://jobtracker-backend-qg6u.onrender.com |
| API Docs | https://jobtracker-backend-qg6u.onrender.com/docs |

## 🛠 Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React, Framer Motion |
| Backend | Python, FastAPI |
| Database | PostgreSQL (Supabase) |
| ORM | SQLAlchemy |
| Deployment | Render (free tier) |

## ✨ Features
- ✅ Full CRUD — add, edit, delete job applications
- ✅ Permanent data storage via Supabase PostgreSQL
- ✅ Interview date field with live countdown timer
- ✅ Colour coded status badges (Applied, Interviewing, Offer, Rejected, Saved)
- ✅ Progress bar per application
- ✅ Success/offer rate tracker
- ✅ Search by company or role
- ✅ Filter by status
- ✅ Sort by newest, oldest, company A-Z, interview date
- ✅ Animated number counters
- ✅ Email notifications for upcoming interviews (Resend)
- ✅ Watercolor painter's sketchbook UI theme
- ✅ Framer Motion animations throughout
- ✅ Fully deployed and live

## 🎨 UI Theme
- SVG watercolor blob background with turbulence filter
- Paper grain texture overlay
- Handwritten Caveat font + elegant Lora serif font
- Ink splatter decorations and hand-drawn wavy lines
- Torn paper edge on each job card

## 📡 API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | Health check |
| GET | /jobs | Get all jobs |
| POST | /jobs | Add a new job |
| GET | /jobs/{id} | Get a specific job |
| PUT | /jobs/{id} | Update a job |
| DELETE | /jobs/{id} | Delete a job |

## 📁 Project Structure
| File | What it does |
|------|-------------|
| `main.py` | All FastAPI endpoints |
| `models.py` | Job table schema (id, company, role, status, interview_date) |
| `database.py` | PostgreSQL connection via DATABASE_URL |
| `frontend/src/App.js` | Full React UI with watercolor theme |

## 🚀 How to Run Locally

### Backend
```bash
cd my-project
venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd my-project\frontend
npm start
```

Then open http://localhost:3001

## 📌 Environment Variables
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `RESEND_API_KEY` | Resend API key for email notifications |
