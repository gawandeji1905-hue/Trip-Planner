
from db import supabase

try:
    response = supabase.table("Trip Planner").select("*").limit(1).execute()

    print("SUCCESS! Python connected to Supabase.")
    print("Your trips table is accessible.")
    print("Test result:", response.data)

except Exception as error:
    print("CONNECTION FAILED.")
    print("Error:", error)
