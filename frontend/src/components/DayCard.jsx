import React from 'react';

export function DayCard({ day, updateActivity, regenerateDay }) {
  return (
    <div className="day-card">
      <h3>Day {day.day}</h3>
      <div className="activities-list">
        {day.activities.map((activity, index) => (
          <div key={index} className="activity-editor">
            <label>
              Activity
              <input
                value={activity.activity || activity.name || ""}
                onChange={(e) => updateActivity(day.day, index, "activity", e.target.value)}
              />
            </label>
            <label>
              Time
              <input
                type="time"
                value={activity.time || "09:00"}
                onChange={(e) => updateActivity(day.day, index, "time", e.target.value)}
              />
            </label>
            <label>
              Cost (₹)
              <input
                type="number"
                value={activity.cost || 0}
                onChange={(e) => updateActivity(day.day, index, "cost", e.target.value)}
              />
            </label>
          </div>
        ))}
      </div>
      <button className="regenerate-btn" onClick={() => regenerateDay(day.day)}>
        Regenerate Day
      </button>
    </div>
  );
}
