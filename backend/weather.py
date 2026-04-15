import httpx
from typing import TypedDict

LIVE_DATA_URL = "https://data-jam.replit.app/api/live-data"

COLUMNS = [
    "timestamp",
    "soil_mm",
    "snow_mm",
    "gw_mm",
    "precip_mm_hr",
    "et_mm_hr",
    "airtemp",
    "discharge_mm_hr",
    "date",
    "streamflow_cfs",
    "pressure",
    "RH",
    "windspeed",
    "winddir",
    "solrad",
]


class WeatherRow(TypedDict):
    timestamp: str
    soil_mm: float
    snow_mm: float
    gw_mm: float
    precip_mm_hr: float
    et_mm_hr: float
    airtemp: float
    discharge_mm_hr: float
    date: str
    streamflow_cfs: float
    pressure: float
    RH: float
    windspeed: float
    winddir: float
    solrad: float


def _parse_row(headers: list[str], values: list[str]) -> WeatherRow:
    row: dict = {}
    for col in COLUMNS:
        if col not in headers:
            row[col] = "" if col in ("timestamp", "date") else 0.0
            continue
        idx = headers.index(col)
        raw = values[idx].strip().strip('"') if idx < len(values) else ""
        if col in ("timestamp", "date"):
            row[col] = raw
        else:
            try:
                row[col] = float(raw)
            except (ValueError, TypeError):
                row[col] = 0.0
    return WeatherRow(**row)  # type: ignore[misc]


def _parse_all_rows(text: str) -> list[WeatherRow]:
    lines = [l for l in text.strip().splitlines() if l.strip()]
    if len(lines) < 2:
        return []
    # Strip whitespace AND surrounding quotes — the live CSV uses quoted headers e.g. "airtemp"
    headers = [h.strip().strip('"') for h in lines[0].split(",")]
    rows = []
    for line in lines[1:]:
        values = line.split(",")
        rows.append(_parse_row(headers, values))
    return rows


async def fetch_live_data() -> WeatherRow:
    """Fetch the live CSV and return the last row as a typed dict."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(LIVE_DATA_URL)
        resp.raise_for_status()
    rows = _parse_all_rows(resp.text)
    if not rows:
        raise ValueError("No data rows returned from live-data endpoint")
    return rows[-1]


async def fetch_all_rows() -> list[WeatherRow]:
    """Fetch the live CSV and return all data rows."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(LIVE_DATA_URL)
        resp.raise_for_status()
    return _parse_all_rows(resp.text)


def get_weather_state(data: WeatherRow | dict) -> str:
    """Map a weather row to a named state string."""
    precip = float(data.get("precip_mm_hr", 0))
    wind = float(data.get("windspeed", 0))
    temp = float(data.get("airtemp", 0))
    sol = float(data.get("solrad", 0))

    if precip > 2:
        return "heavyRain"
    if precip > 0.3:
        return "rain"
    if wind > 2.5:
        return "wind"
    if temp < -1:
        return "cold"
    if sol > 250:
        return "sunny"
    return "idle"
