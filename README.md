# HBF Agent

A mock of the [Hubbard Brook Ecosystem Study](https://hubbardbrook.org) landing page with an embedded AI agent, Koda, an ancient Abenaki forest spirit, powered by live sensor data and Claude API.

## Architecture

```
hbf-agent/
├── backend/        Python FastAPI — Claude agent, live weather, tool use
└── frontend/       Next.js — landing page, Koda figure, chat panel
```

**Backend** (`localhost:8000`) — FastAPI server with three Claude tools:
- `get_current_conditions` — fetches live sensor data from Hubbard Brook
- `get_historical_data` — trend summary + sparkline for any metric
- `search_hubbard_brook` — web search via Claude's built-in web_search tool

**Frontend** (`localhost:3000`) — Next.js app:
- Mock landing page (nav, hero, 3-col, welcome, partners, events)
- `KodaFigure` — translucent SVG Abenaki figure with Framer Motion animations driven by live weather state
- `ChatPanel` — slide-up chat UI, calls the FastAPI backend
- `WeatherParticles` — rain/snow particles on the hero
- `useWeatherData` — polls `GET /api/weather` every 5 minutes

## Running the project

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
```

Add your Anthropic API key to `backend/.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Start the server:

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
Check `http://localhost:8000/api/health` to confirm it's running.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

> **Note:** The frontend calls `http://localhost:8000` directly. Both servers must be running for the chat and live weather badge to work.

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/weather` | Live conditions + state label |
| POST | `/api/chat` | Send `{ messages, message }`, receive `{ response }` |

## Weather states

| State | Condition |
|-------|-----------|
| `heavyRain` | precip > 2 mm/hr |
| `rain` | precip > 0.3 mm/hr |
| `wind` | windspeed > 2.5 m/s |
| `cold` | airtemp < −1°C |
| `sunny` | solar radiation > 250 W/m² |
| `idle` | none of the above |

Koda's SVG figure and hero weather particles respond to the current state in real time.
