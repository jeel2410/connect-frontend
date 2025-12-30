import React from 'react';
import "../../styles/style.css"

const Step4 = ({ data, updateData, errors, touched }) => {
  const habitOptions = [
    'Regular Smoker',
    'Non Smoker',
     'Orbiting',
    'Regular Drinker',
    'Love-Rambling',
    'Benishing',
    'Breadcrumbing',
    'Submarining'
  ];

  const toggleHabit = (habit) => {
    const currentHabits = data.habits || [];
    const newHabits = currentHabits.includes(habit)
      ? currentHabits.filter(h => h !== habit)
      : [...currentHabits, habit];
    updateData('habits', newHabits);
    updateData('_touched_habits', true);
  };

  return ( 
    <div className="step-content active"> 
      <h2 className="step-title">What's your habits?</h2> 
      <p className="step-description">Let others know about your habits</p> 
       
      <div className="form-group">
        <div className="habits-container">
          {habitOptions.map((habit, index) => (
            <button
              key={index}
              type="button"
              className={`habit-tag ${(data.habits || []).includes(habit) ? 'selected' : ''}`}
              onClick={() => toggleHabit(habit)}
            >
              {habit}
            </button>
          ))}
        </div>
      </div>
      {touched?.habits && errors?.habits && (
        <div className="field-error-message">{errors.habits}</div>
      )}
    </div> 
  ); 
};

export default Step4;