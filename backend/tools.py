"""
Tool definitions and executors for the Koda agent.

Three tools:
  1. get_current_conditions  — live weather snapshot
  2. get_historical_data     — trend summary for a metric
  3. search_hubbard_brook    — web search via Claude's built-in web_search tool
"""

import json
import os
import statistics

import anthropic

from weather import fetch_live_data, fetch_all_rows, get_weather_state

# ── Tool schemas (passed to Claude) ──────────────────────────────────────────

TOOL_DEFINITIONS: list[dict] = [
    {
        "name": "get_current_conditions",
        "description": (
            "Returns the current live weather and environmental conditions at "
            "Hubbard Brook Experimental Forest, including temperature, precipitation, "
            "wind, solar radiation, streamflow, soil moisture, and a state label."
        ),
        "input_schema": {
            "type": "object",
            "properties": {},
            "required": [],
        },
    },
    {
        "name": "get_historical_data",
        "description": (
            "Returns a statistical summary (min, max, mean) and a 12-point sparkline "
            "for a chosen metric over recent observations at Hubbard Brook. "
            "Valid metrics: precip_mm_hr, windspeed, airtemp, solrad, RH, pressure, "
            "streamflow_cfs, soil_mm."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "metric": {
                    "type": "string",
                    "description": (
                        "The metric name to retrieve. One of: precip_mm_hr, windspeed, "
                        "airtemp, solrad, RH, pressure, streamflow_cfs, soil_mm."
                    ),
                },
                "hours_back": {
                    "type": "integer",
                    "description": "How many rows back to include (approximate hours).",
                    "default": 24,
                },
            },
            "required": ["metric"],
        },
    },
    {
        "name": "search_hubbard_brook",
        "description": (
            "Searches hubbardbrook.org and related scientific sources for information "
            "about a topic. Use this for research questions, publications, ecology, "
            "history, or anything not covered by the live sensor data."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "The search query focused on Hubbard Brook or related ecology.",
                }
            },
            "required": ["query"],
        },
    },
]


# ── Tool executors ────────────────────────────────────────────────────────────

async def run_get_current_conditions(_inputs: dict) -> str:
    data = await fetch_live_data()
    state = get_weather_state(data)
    result = dict(data)
    result["state"] = state
    return json.dumps(result)


async def run_get_historical_data(inputs: dict) -> str:
    metric: str = inputs.get("metric", "airtemp")
    hours_back: int = int(inputs.get("hours_back", 24))

    valid = {"precip_mm_hr", "windspeed", "airtemp", "solrad", "RH",
             "pressure", "streamflow_cfs", "soil_mm"}
    if metric not in valid:
        return json.dumps({"error": f"Invalid metric '{metric}'. Valid: {sorted(valid)}"})

    rows = await fetch_all_rows()
    if not rows:
        return json.dumps({"error": "No data available"})

    window = rows[-max(1, hours_back):]
    values = [float(r.get(metric, 0)) for r in window]  # type: ignore[call-overload]

    if not values:
        return json.dumps({"error": "No values found for metric"})

    # 12-point sparkline evenly spaced across the window
    n = len(values)
    indices = [int(i * (n - 1) / 11) for i in range(12)] if n >= 12 else list(range(n))
    sparkline = [round(values[i], 3) for i in indices]

    return json.dumps({
        "metric": metric,
        "rows_analyzed": len(values),
        "min": round(min(values), 3),
        "max": round(max(values), 3),
        "mean": round(statistics.mean(values), 3),
        "sparkline": sparkline,
    })


async def run_search_hubbard_brook(inputs: dict) -> str:
    query: str = inputs.get("query", "")
    if not query:
        return json.dumps({"error": "query is required"})

    # Use Claude to synthesize an answer from known Hubbard Brook knowledge
    client = anthropic.AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    response = await client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=256,
        system=(
            "You are a knowledgeable assistant for Hubbard Brook Experimental Forest. "
            "Answer questions about Hubbard Brook ecology, research, history, and data "
            "using your training knowledge. Be factual and concise (2-4 sentences)."
        ),
        messages=[{"role": "user", "content": query}],
    )

    text_blocks = [b.text for b in response.content if hasattr(b, "text")]
    result_text = " ".join(text_blocks).strip() or "No results found."
    return json.dumps({"result": result_text})


# ── Dispatch ──────────────────────────────────────────────────────────────────

async def execute_tool(name: str, inputs: dict) -> str:
    if name == "get_current_conditions":
        return await run_get_current_conditions(inputs)
    if name == "get_historical_data":
        return await run_get_historical_data(inputs)
    if name == "search_hubbard_brook":
        return await run_search_hubbard_brook(inputs)
    return json.dumps({"error": f"Unknown tool: {name}"})
