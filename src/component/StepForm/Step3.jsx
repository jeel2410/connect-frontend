import React from 'react';
import flag1 from "../../assets/image/flag1.png"
import flag2 from "../../assets/image/flag2.png"
import "../../styles/style.css"

// const Step3 = ({ data, updateData }) => {
//   return (
//     <div className="step-content active">
//       <h2 className="step-title">What's your Language</h2>
//       <p className="step-description">Let others know about your languages</p>
      
//       <div className="form-group">
//         <label>Occupation</label>
//         <input
//           type="text"
//           value={data.occupation || ''}
//           onChange={(e) => updateData('occupation', e.target.value)}
//           placeholder="Software Engineer"
//         />
//       </div>
//     </div>
//   );
// };
const Step3 = ({ data, updateData, errors, touched }) => {
  const languages = [
    { id: 'English', name: 'English' },
    { id: 'Spanish', name: 'Spanish' }
  ];

  const selectedLanguages = Array.isArray(data.language) ? data.language : (data.language ? [data.language] : []);

  const toggleLanguage = (langName) => {
    const currentLanguages = Array.isArray(data.language) ? data.language : (data.language ? [data.language] : []);
    
    if (currentLanguages.includes(langName)) {
      // Remove language if already selected
      const updated = currentLanguages.filter(lang => lang !== langName);
      updateData('language', updated);
    } else {
      // Add language if not selected
      const updated = [...currentLanguages, langName];
      updateData('language', updated);
    }
    
    // Mark as touched after validation has a chance to run
    setTimeout(() => {
      updateData('_touched_language', true);
    }, 50);
  };

  return (
    <div className="step-content active">
      <h2 className="step-title">Languages Spoken</h2>
      <p className="step-description">Let others know about your languages</p>
      
      <div className="form-group">
        <div className="habits-container">
          {languages.map((lang) => (
            <button
              key={lang.id}
              type="button"
              className={`habit-tag ${selectedLanguages.includes(lang.name) ? 'selected' : ''}`}
              onClick={() => toggleLanguage(lang.name)}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>
      {touched?.language && errors?.language && (
        <div className="field-error-message">{errors.language}</div>
      )}
    </div>
  );
};

export default Step3;