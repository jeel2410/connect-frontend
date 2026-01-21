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
    { id: 'english', name: 'English', flag: flag1 },
    { id: 'spanish', name: 'Spanish', flag: flag2 }
  ];

  const selectedLanguage = data.language || '';

  const selectLanguage = (langId) => {
    // Set language value first, which will trigger validation
    updateData('language', langId);
    // Mark as touched after validation has a chance to run
    setTimeout(() => {
      updateData('_touched_language', true);
    }, 50);
  };

  return (
    <div className="step-content active">
      <h2 className="step-title">What's your Language</h2>
      <p className="step-description">Let others know about your languages</p>
      
      <div className="language-selection">
        {languages.map((lang) => (
          <div
            key={lang.id}
            className={`language-option ${selectedLanguage === lang.id ? 'selected' : ''}`}
            onClick={() => selectLanguage(lang.id)}
          >
            <img src={lang.flag} className="language-flag"></img>
            <span className="language-name">{lang.name}</span>
            <div className="language-radio">
              {selectedLanguage === lang.id && <span className="radio-dot"></span>}
            </div>
          </div>
        ))}
      </div>
      {touched?.language && errors?.language && (
        <div className="field-error-message">{errors.language}</div>
      )}
    </div>
  );
};

export default Step3;