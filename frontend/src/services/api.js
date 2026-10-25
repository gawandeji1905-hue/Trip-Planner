
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    || "http://127.0.0.1:8000",
  timeout: 300000 // Set timeout to 5 minutes for local AI processing
});

export async function generateItinerary(trip) {
  const response = await api.post(
    "/api/itinerary",
    trip
  );

  return response.data;
}
