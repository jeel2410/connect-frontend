import React, { useState, useEffect } from 'react';
import "../../styles/style.css"
import API_BASE_URL from "../../utils/config";
import { getCookie } from "../../utils/auth";

const Step4 = ({ data, updateData, errors, touched }) => {
  const [habits, setHabits] = useState([]);
  const [loadingHabits, setLoadingHabits] = useState(false);
  const [habitsError, setHabitsError] = useState("");

  // Fetch habits from API
  useEffect(() => {
    const fetchHabits = async () => {
      try {
        setLoadingHabits(true);
        setHabitsError("");
        const token = getCookie("authToken");
        const response = await fetch(`${API_BASE_URL}/api/list/habits`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch habits");
        }

        const result = await response.json();
        
        if (result.success && result.data && result.data.habits) {
          setHabits(result.data.habits);
        } else {
          setHabits([]);
        }
      } catch (err) {
        console.error("Error fetching habits:", err);
        setHabitsError("Failed to load habits");
        setHabits([]);
      } finally {
        setLoadingHabits(false);
      }
    };

    fetchHabits();
  }, []);

  const toggleHabit = (habitName) => {
    const currentHabits = data.habits || [];
    const newHabits = currentHabits.includes(habitName)
      ? currentHabits.filter(h => h !== habitName)
      : [...currentHabits, habitName];
    updateData('habits', newHabits);
    updateData('_touched_habits', true);
  };

  return ( 
    <div className="step-content active"> 
      <h2 className="step-title">What's your habits?</h2> 
      <p className="step-description">Let others know about your habits</p> 
       
      <div className="form-group">
        <div className="habits-container">
          {loadingHabits ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
              Loading habits...
            </div>
          ) : habitsError ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#dc2626" }}>
              {habitsError}
            </div>
          ) : habits.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
              No habits available
            </div>
          ) : (
            habits.map((habit) => (
              <button
                key={habit._id}
                type="button"
                className={`habit-tag ${(data.habits || []).includes(habit.name) ? 'selected' : ''}`}
                onClick={() => toggleHabit(habit.name)}
              >
                {habit.name.charAt(0).toUpperCase() + habit.name.slice(1)}
              </button>
            ))
          )}
        </div>
      </div>
      {touched?.habits && errors?.habits && (
        <div className="field-error-message">{errors.habits}</div>
      )}
    </div> 
  ); 
};

export default Step4;