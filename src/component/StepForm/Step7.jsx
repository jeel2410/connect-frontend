import React, { useState, useEffect } from 'react';
import "../../styles/style.css"

import uploadIcon from "../../assets/image/upload_icon.png"
const Step7 = ({ data, updateData, errors, touched }) => {
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // If photo is already set (from formik), create preview
    if (data.photo && typeof data.photo === 'string' && data.photo.startsWith('data:')) {
      setPreview(data.photo);
    } else if (data.photo instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(data.photo);
    }
  }, [data.photo]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      
      // Store the file object for FormData
      updateData('photo', file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
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
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      
      // Store the file object for FormData
      updateData('photo', file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="step-content active">
      <h2 className="step-title">Upload Your Photo</h2>
      <p className="step-description">Enter your credentials to continue</p>
      
      <div 
        className={`upload-container ${isDragging ? 'dragging' : ''} ${preview ? 'has-image' : ''} ${touched?.photo && errors?.photo ? 'upload-error' : ''}`}
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
            <img src={uploadIcon} alt="Upload"></img>
            <p className="upload-text">Add Image</p>
            <p className="upload-subtext">Maximum 5 MB image</p>
          </label>
        )}
      </div>
      {touched?.photo && errors?.photo && (
        <div className="field-error-message">{errors.photo}</div>
      )}
    </div>
  );
};

export default Step7;