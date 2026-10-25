import React from 'react';
import { DayCard } from './DayCard';

export function ItineraryView({ itinerary, dailyPlans, updateActivity, regenerateDay }) {
  if (!itinerary) return null;

  return (
    <section className="results">
      <h2>Your Trip to {itinerary.destination}</h2>
      <div className="trip-meta">
        <p>
          {itinerary.days} day(s) · ₹ {itinerary.budget.toLocaleString("en-IN")} total budget
        </p>
        <p>Interests: {itinerary.interests} | Style: {itinerary.travelStyle} | Group: {itinerary.groupSize}</p>
        <p>Dates: {itinerary.startDate} to {itinerary.endDate}</p>
      </div>

      <div className="itinerary-days">
        {dailyPlans.map((day) => (
          <DayCard
            key={day.day}
            day={day}
            updateActivity={updateActivity}
            regenerateDay={regenerateDay}
          />
        ))}
      </div>

      {itinerary.budget_explanation && (
        <div className="budget-note">
          <strong>Budget Note:</strong> {itinerary.budget_explanation}
        </div>
      )}

      <p className="total-cost">
        <strong>Estimated Total Cost:</strong> ₹ {itinerary.total_estimated_cost || "N/A"}
      </p>
    </section>
  );
}
