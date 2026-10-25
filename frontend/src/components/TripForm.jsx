import React from 'react';

export function TripForm({
  formData,
  setFormData,
  onSubmit
}) {
  return (
    <section className="planner">
      <h2>Plan Your Trip</h2>
      <form onSubmit={onSubmit}>
        <label>
          Destination
          <input
            type="text"
            placeholder="e.g. Manali"
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            required
          />
        </label>

        <label>
          Total Budget (₹)
          <input
            type="number"
            min="1"
            placeholder="e.g. 10000"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            required
          />
        </label>

        <div className="form-row">
          <label>
            Start Date
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </label>
          <label>
            End Date
            <input
              type="date"
              min={formData.startDate || undefined}
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </label>
        </div>

        <label>
          Interests
          <select
            value={formData.interests}
            onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
          >
            <option>Sightseeing</option>
            <option>Adventure</option>
            <option>Food</option>
            <option>Nature</option>
            <option>History and Culture</option>
          </select>
        </label>

        <label>
          Travel Style
          <select
            value={formData.travelStyle}
            onChange={(e) => setFormData({ ...formData, travelStyle: e.target.value })}
          >
            <option>Budget-friendly</option>
            <option>Comfort</option>
            <option>Luxury</option>
          </select>
        </label>

        <label>
          Group Size
          <input
            type="number"
            min="1"
            max="100"
            value={formData.groupSize}
            onChange={(e) => setFormData({ ...formData, groupSize: e.target.value })}
            required
          />
        </label>

        <button type="submit">Generate My Itinerary</button>
      </form>
    </section>
  );
}
