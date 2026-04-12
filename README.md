# Triple Task

A real-time browser game built with **Django + Django REST Framework + vanilla JavaScript**, where players solve **three parallel challenges** under time pressure.

**Live Demo:** https://triple-task.onrender.com/games/

---

## What Triple Task is

Triple Task is a cognitive challenge game where three mini-games run simultaneously:

- **Math Game** → fast multiplication problems  
- **Grid Game** → identify the dominant color in a grid  
- **Pattern Game** → memorize and reproduce sequences  

The player must manage all three at once under a shared global timer, with penalties, per-game timers, and persistent scoring.

---

## Core Features

- Session-based game state management
- Backend validation via REST API
- Real-time frontend loop with synchronized timers
- Restart flow with timer consistency handling
- Match persistence and ranking system
- Custom user model with personal best tracking
- Authentication system (register/login/logout)
- Visual + audio feedback system
- Environment-based configuration (`.env`)
- Deployed to Render

---

## Backend Highlights

- Per-session locking mechanism to prevent race conditions during concurrent updates  
- Multi-layer timer system (global + per-game timers)  
- Server-side enforcement of valid game flow and state transitions  
- Fine-grained timing control with tolerance for network delay  
- Low-level session handling using Django `SessionStore`  
- Real-time state mutation (global timer penalties) with concurrency control  
- Structured API validation layer using Django REST Framework serializers  

---

## Technical Highlights

### Backend (Django / DRF)

- Designed API endpoints for full game lifecycle:
  - `validate`
  - `next-game`
  - `timer`
  - `game-timers`
  - `first-pattern`
  - `match-ended`
  - `server-time`

- Implemented session-driven state:
  - expected answers per mini-game
  - score tracking
  - timer synchronization

- Built concurrency-safe logic using per-session locks  
- Implemented server-client time synchronization using offset calculation  
- Persisted matches and personal records  
- Handled edge cases around:
  - timer desynchronization
  - invalid client flow
  - race conditions

---

### Frontend (Vanilla JavaScript)

- Built fully stateful game flow without frameworks  
- Implemented synchronized timers (global + per-game)  
- Server time sync using midpoint offset strategy  
- Dynamic UI updates per mini-game  
- Audio + visual feedback system  
- Modular structure (`timer.js`, `validate.js`)  
- Restart flow with full state reset  

---

## Architecture Overview

- `accounts/` → authentication, profile, custom user  
- `games/` → API, game logic, ranking, match persistence  
- `games/game_engine/` → isolated mini-game generation logic  
- `games/static/games/js/` → client-side game state and timers  
- `templates/` → UI rendering  
- `settings.py` → environment-based configuration  

---

## Stack

- Python  
- Django  
- Django REST Framework  
- JavaScript (vanilla)  
- HTML/CSS  
- SQLite (development)  
- PostgreSQL (production)  
- Render (deployment)  

---

## Running Locally

```bash
git clone https://github.com/Hernandez-Marcos/Triple-task
cd Triple-task

python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Open: http://127.0.0.1:8000/games/

---

## Environment Variables

Create a `.env` file in the project root:

```env
SECRET_KEY=your_secret_key_here
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
DATABASE_URL=sqlite:///db.sqlite3
```
---

## Current Status

Core gameplay and user flow are fully implemented and deployed.

Next improvements:

- automated tests  
- responsive design  
- accessibility improvements  
- further edge-case hardening  

---

## Why this project matters (backend perspective)

Triple Task goes beyond a typical CRUD application. It required handling:

- stateful session logic  
- concurrent updates and race condition prevention  
- real-time synchronization between client and server  
- multi-timer coordination  
- strict backend validation of client flow  
- persistence and ranking systems  
- debugging real-world timing issues after deployment  

This project reflects practical backend problem-solving under real product constraints.

---

## Author

Marcos Hernández Damaglia  
Backend Developer (Django) | Full Stack Capable

GitHub: https://github.com/Hernandez-Marcos
