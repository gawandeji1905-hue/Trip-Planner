from fastapi import HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Any
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import json
import httpx
from dotenv import load_dotenv
from datetime import date

load_dotenv()

app = FastAPI(title="Travel Planner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ollama Configuration
OLLAMA_API_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "qwen2.5-coder:7b" # Using the model found on your device

@app.get("/")
def home():
    return {"message": "Travel Planner API is running with Ollama"}

@app.post("/api/itinerary")
async def create_itinerary(trip: dict):
    # 1. Receive user input and validate
    destination = trip.get("destination")
    budget = trip.get("budget")
    days = trip.get("days")
    interests = trip.get("interests", "general sightseeing")
    travel_style = trip.get("travel_style", "moderate")
    group_size = trip.get("group_size", 1)

    if not destination or not budget or not days:
        raise HTTPException(status_code=400, detail="Destination, budget, and number of days are required.")

    try:
        budget = float(budget)
        days = int(days)
        group_size = int(group_size)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Budget, days, and group size must be valid numbers.")

    # 2. Build the prompt
    prompt = f"""
You are a travel planning assistant.
Return ONLY a JSON object. Do not include any conversational text, markdown formatting, or backticks.

Create an itinerary using these details:
- Destination: {destination}
- Budget: {budget}
- Number of days: {days}
- Interests: {interests}
- Travel style: {travel_style}
- Group size: {group_size}

Requirements:
1. Organize activities day by day.
2. Include morning, afternoon, and evening plans.
3. Suggest attractions, dining, accommodation, and transport.
4. Estimate costs in Indian rupees.
5. Keep the plan within the stated budget where feasible.
6. Explain any budget limitations.
7. Return structured JSON that follows the expected schema.
8. Do not invent live prices, opening hours, or availability.
9. Clearly mark details that need verification.

Expected JSON Schema:
{{
  "destination": "{destination}",
  "days": [
    {{
      "day": 1,
      "activities": [
        {{
          "time": "Morning",
          "activity": "Activity description",
          "cost": 0
        }},
        {{
          "time": "Afternoon",
          "activity": "Activity description",
          "cost": 0
        }},
        {{
          "time": "Evening",
          "activity": "Activity description",
          "cost": 0
        }}
      ]
    }}
  ],
  "budget_explanation": "explanation here",
  "total_estimated_cost": 0
}}
"""

    # 3. Send to Ollama
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                OLLAMA_API_URL,
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "format": "json"
                },
                timeout=60.0
            )
            response.raise_for_status()
            ai_data = response.json()
            content = ai_data.get("response", "")

            # Clean response and parse JSON
            itinerary = json.loads(content)

            # Basic validation of the JSON structure
            if "days" not in itinerary:
                raise ValueError("AI response missing 'days' field")

            return itinerary

    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"Ollama service error: {e.response.text}")
    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse Ollama response: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

# Removed the problematic update_trip endpoint for now
