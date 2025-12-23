import React, { useState } from 'react';
import "../../styles/style.css"

import uploadIcon from "../../assets/image/upload_icon.png"
const Step7 = ({ data, updateData }) => {
  const [preview, setPreview] = useState(data.photo || null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        updateData('photo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        updateData('photo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="step-content active">
      <h2 className="step-title">Upload Your Photo</h2>
      <p className="step-description">Enter your credentials to continue</p>
      
      <div 
        className={`upload-container ${isDragging ? 'dragging' : ''} ${preview ? 'has-image' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          id="photo-upload" 
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        {preview ? (
          <div className="image-preview">
            <img src={preview} alt="Preview" />
            <label htmlFor="photo-upload" className="change-photo-btn">
              Change Photo
            </label>
          </div>
        ) : (
          <label htmlFor="photo-upload" className="upload-label">
          
             <img src={uploadIcon}></img>
           
            <p className="upload-text">Add Image</p>
            <p className="upload-subtext">Maximum 5 MB image</p>
          </label>
        )}
      </div>
    </div>
  );
};

export default Step7;