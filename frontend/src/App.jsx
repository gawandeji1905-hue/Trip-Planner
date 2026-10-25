import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import { supabase } from "./supabaseClient";
import Auth from "./Auth";
import { generateItinerary } from "./services/api";
import { TripForm } from "./components/TripForm";
import { ItineraryView } from "./components/ItineraryView";

function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    destination: "",
    budget: "",
    startDate: "",
    endDate: "",
    interests: "Sightseeing",
    travelStyle: "Budget-friendly",
    groupSize: "2",
  });

  const [itinerary, setItinerary] = useState(null);
  const [dailyPlans, setDailyPlans] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();
      if (mounted) {
        if (error) console.error("Session check failed:", error.message);
        setUser(data?.session?.user ?? null);
        setCheckingSession(false);
      }
    }
    checkSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = useCallback((loggedInUser) => {
    setUser(loggedInUser);
  }, []);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Logout failed:", error.message);
    else setUser(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    const start = new Date(`${formData.startDate}T00:00:00`);
    const end = new Date(`${formData.endDate}T00:00:00`);
    if (end < start) {
      alert("End date must be on or after the start date.");
      return;
    }

    const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    setLoading(true);
    try {
      const tripData = { ...formData, days };
      const aiResponse = await generateItinerary(tripData);
      setItinerary({ ...tripData, ...aiResponse });
      const formattedDays = aiResponse.days.map(day => ({
        ...day,
        activities: day.activities.map((act, idx) => ({ ...act, id: `${day.day}-${idx}` }))
      }));
      setDailyPlans(formattedDays);
    } catch (err) {
      console.error("Generation failed:", err);
      setError("Failed to generate itinerary. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function updateActivity(dayNumber, activityIndex, field, value) {
    setDailyPlans((previousPlans) =>
      previousPlans.map((day) => {
        if (day.day !== dayNumber) return day;
        const newActivities = [...day.activities];
        newActivities[activityIndex] = { ...newActivities[activityIndex], [field]: value };
        return { ...day, activities: newActivities };
      })
    );
  }

  async function regenerateDay(dayNumber) {
    setLoading(true);
    try {
      alert(`Regenerating day ${dayNumber}...`);
      setDailyPlans((prev) => prev.map(day =>
        day.day === dayNumber ? { ...day, activities: [{ time: "10:00", activity: "New AI Suggestion", cost: 200 }] } : day
      ));
    } catch (err) {
      setError("Regeneration failed.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) return <p>Checking your login...</p>;
  if (!user) return <Auth onLogin={handleLogin} />;

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-logo">Trip Planner ✈️</div>
        <div className="nav-links">
          <span>{user.email}</span>
          <button onClick={handleLogout}>Log Out</button>
        </div>
      </nav>

      <main className="app">
        <header className="hero">
          <p className="hero-eyebrow">YOUR NEXT ADVENTURE STARTS HERE</p>
          <h1>Plan journeys worth <em>remembering</em></h1>
          <p className="hero-sub">Describe your dream trip. Wandr builds a detailed day-by-day plan tailored to your budget and style.</p>
        </header>

        {error && <div className="error-message">{error}</div>}

        <TripForm formData={formData} setFormData={setFormData} onSubmit={handleSubmit} />

        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Plotting your adventure…</p>
          </div>
        )}

        <ItineraryView itinerary={itinerary} dailyPlans={dailyPlans} updateActivity={updateActivity} regenerateDay={regenerateDay} />
      </main>
    </div>
  );
}

export default App;
