import React, { useState, useRef, useEffect } from 'react';
import {
  FileText, X, Send, Paperclip, Plus,
  Users, ChevronDown, ChevronUp, Info, MapPin, Target, Tag, Building2
} from 'lucide-react';
import API_BASE_URL from '../utils/config';
import { getCookie } from '../utils/auth';
import { toast } from 'react-toastify';

const CreatePost = ({ onPostCreated, isExpanded: propIsExpanded, setIsExpanded: propSetIsExpanded }) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const [localIsExpanded, setLocalIsExpanded] = useState(false);
  const isExpanded = propIsExpanded !== undefined ? propIsExpanded : localIsExpanded;
  const setIsExpanded = propSetIsExpanded !== undefined ? propSetIsExpanded : setLocalIsExpanded;
  
  // Note: default to 'post' (Ask Question) and hide Reel Video tab per user request
  const [shareType, setShareType] = useState('post'); // 'post' or 'link'
  const [getAiResponses, setGetAiResponses] = useState(true);
  const [selectedAudienceCard, setSelectedAudienceCard] = useState('help'); // 'help' | 'connections' | 'city' | 'custom'
  const [isAudienceDetailsOpen, setIsAudienceDetailsOpen] = useState(false);

  // Target segments
  const [targetConnections, setTargetConnections] = useState(true);
  const [targetCity, setTargetCity] = useState(false);
  const [targetCityLocation, setTargetCityLocation] = useState('');
  const [targetIndustries, setTargetIndustries] = useState([]);
  const [targetInterests, setTargetInterests] = useState([]);
  const [targetAgeGroups, setTargetAgeGroups] = useState([]);

  // Dynamic dropdown lists
  const [industriesList, setIndustriesList] = useState([]);
  const [interestsList, setInterestsList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);
  const audienceDetailsRef = useRef(null);

  useEffect(() => {
    const urls = attachments.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [attachments]);

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const token = getCookie('authToken');
        const response = await fetch(`${API_BASE_URL}/api/list/industries`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.industries) {
            setIndustriesList(result.data.industries);
          }
        }
      } catch (err) {
        console.error('Error fetching industries:', err);
      }
    };

    const fetchInterests = async () => {
      try {
        const token = getCookie('authToken');
        const response = await fetch(`${API_BASE_URL}/api/list/interest`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.interests) {
            setInterestsList(result.data.interests);
          }
        }
      } catch (err) {
        console.error('Error fetching interests:', err);
      }
    };

    const fetchCities = async () => {
      try {
        const token = getCookie('authToken');
        const response = await fetch(`${API_BASE_URL}/api/list/city`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.city) {
            setCitiesList(result.data.city);
          }
        }
      } catch (err) {
        console.error('Error fetching cities:', err);
      }
    };

    fetchIndustries();
    fetchInterests();
    fetchCities();
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (attachments.length + files.length > 5) {
      toast.error('Maximum 5 attachments allowed');
      return;
    }
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    setContent('');
    setAttachments([]);
    setGetAiResponses(true);
    setSelectedAudienceCard('help');
    setTargetConnections(true);
    setTargetCity(false);
    setTargetCityLocation('');
    setTargetIndustries([]);
    setTargetInterests([]);
    setTargetAgeGroups([]);
    setIsAudienceDetailsOpen(false);
    setIsExpanded(false);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!content.trim() && attachments.length === 0) {
      toast.error('Please add a question before submitting');
      return;
    }

    setIsPosting(true);
    const formData = new FormData();
    formData.append('content', content.trim());
    attachments.forEach((file) => {
      formData.append('attachments', file);
    });

    const targetSegments = {
      getAiResponses,
      audienceType: selectedAudienceCard,
      connections: targetConnections,
      city: targetCity,
      cityLocation: targetCityLocation,
      industries: targetIndustries,
      interests: targetInterests,
      ageGroups: targetAgeGroups
    };
    formData.append('targetSegments', JSON.stringify(targetSegments));

    try {
      const token = getCookie('authToken');
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Question asked successfully');
        handleCancel();
        if (onPostCreated) onPostCreated(data.data);
      } else {
        toast.error(data.message || 'Failed to submit question');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="create-post-section">
      {!isExpanded ? (
        <div className="create-post-trigger">
          <button
            className="create-btn-main"
            onClick={() => {
              setShareType('post');
              setIsExpanded(true);
            }}
          >
            <Plus size={20} />
            <span>Ask</span>
          </button>
        </div>
      ) : (
        <div className="create-post-form-card">
          {/* Header */}
          <div className="create-post-form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#09122E' }}>Ask a question</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#777E90' }}>
                Ask anything or describe what you need help with.
              </p>
            </div>

            {/* Hidden Reel Video tab for now - code structure preserved */}
            <div style={{ display: 'none' }}>
              <button type="button" onClick={() => setShareType('link')}>Reel Video</button>
              <button type="button" onClick={() => setShareType('post')}>Ask Question</button>
            </div>
          </div>

          {/* Ask Question Input Box */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <textarea
              className="post-textarea-premium"
              placeholder="What would you like to ask?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              maxLength={2000}
              style={{
                width: '100%',
                minHeight: '120px',
                borderRadius: '12px',
                border: '1px solid #E8EDF3',
                background: '#FFFFFF',
                padding: '16px',
                fontSize: '15px',
                color: '#09122E',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: '4px'
              }}
            />
            <div style={{ textAlign: 'right', fontSize: '13px', color: '#B0B7C3', fontWeight: '500' }}>
              {content.length}/2000
            </div>
          </div>

          {/* Get responses from AI Checkbox */}
          <div style={{ marginBottom: '24px', textAlign: 'left' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', color: '#09122E' }}>
              <input
                type="checkbox"
                checked={getAiResponses}
                onChange={(e) => setGetAiResponses(e.target.checked)}
                style={{
                  accentColor: '#EA650A',
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer'
                }}
              />
              <span>Get responses from AI</span>
              <Info size={16} color="#777E90" style={{ cursor: 'pointer' }} />
            </label>
            <p style={{ margin: '4px 0 0 26px', fontSize: '13px', color: '#777E90' }}>
              AI will answer and also find relevant people and businesses.
            </p>
          </div>

          {/* Section: Who would you like to ask? */}
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#09122E', margin: 0 }}>
                Who would you like to ask?
              </h4>
              <Info size={16} color="#777E90" style={{ cursor: 'pointer' }} />
            </div>

            {/* 4 Audience Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px'
            }}>
              {/* Card 1: People who can help */}
              <div
                onClick={() => {
                  setSelectedAudienceCard('help');
                  setTargetConnections(true);
                  setTargetCity(false);
                }}
                style={{
                  border: selectedAudienceCard === 'help' ? '1.5px solid #EA650A' : '1px solid #E8EDF3',
                  background: selectedAudienceCard === 'help' ? '#FFF8F4' : '#FFFFFF',
                  borderRadius: '12px',
                  padding: '16px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  textAlign: 'left'
                }}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: selectedAudienceCard === 'help' ? '5px solid #EA650A' : '1.5px solid #B0B7C3',
                  background: '#ffffff',
                  boxSizing: 'border-box'
                }} />
                <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
                  <Users size={32} color={selectedAudienceCard === 'help' ? '#EA650A' : '#09122E'} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#09122E', marginBottom: '4px' }}>
                    People who can help
                  </div>
                  <div style={{ fontSize: '11px', color: '#777E90', lineHeight: '1.3' }}>
                    Let AI find relevant people on Connect
                  </div>
                </div>
              </div>

              {/* Card 2: My Connections */}
              <div
                onClick={() => {
                  setSelectedAudienceCard('connections');
                  setTargetConnections(true);
                  setTargetCity(false);
                }}
                style={{
                  border: selectedAudienceCard === 'connections' ? '1.5px solid #EA650A' : '1px solid #E8EDF3',
                  background: selectedAudienceCard === 'connections' ? '#FFF8F4' : '#FFFFFF',
                  borderRadius: '12px',
                  padding: '16px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  textAlign: 'left'
                }}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: selectedAudienceCard === 'connections' ? '5px solid #EA650A' : '1.5px solid #B0B7C3',
                  background: '#ffffff',
                  boxSizing: 'border-box'
                }} />
                <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
                  <Users size={32} color={selectedAudienceCard === 'connections' ? '#EA650A' : '#09122E'} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#09122E', marginBottom: '4px' }}>
                    My Connections
                  </div>
                  <div style={{ fontSize: '11px', color: '#777E90', lineHeight: '1.3' }}>
                    Ask people you already know
                  </div>
                </div>
              </div>

              {/* Card 3: People in My City */}
              <div
                onClick={() => {
                  setSelectedAudienceCard('city');
                  setTargetConnections(false);
                  setTargetCity(true);
                }}
                style={{
                  border: selectedAudienceCard === 'city' ? '1.5px solid #EA650A' : '1px solid #E8EDF3',
                  background: selectedAudienceCard === 'city' ? '#FFF8F4' : '#FFFFFF',
                  borderRadius: '12px',
                  padding: '16px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  textAlign: 'left'
                }}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: selectedAudienceCard === 'city' ? '5px solid #EA650A' : '1.5px solid #B0B7C3',
                  background: '#ffffff',
                  boxSizing: 'border-box'
                }} />
                <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
                  <MapPin size={32} color={selectedAudienceCard === 'city' ? '#EA650A' : '#09122E'} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#09122E', marginBottom: '4px' }}>
                    People in My City
                  </div>
                  <div style={{ fontSize: '11px', color: '#777E90', lineHeight: '1.3' }}>
                    Ask people in your city
                  </div>
                </div>
              </div>

              {/* Card 4: Choose an Audience */}
              <div
                onClick={() => {
                  setSelectedAudienceCard('custom');
                  setIsAudienceDetailsOpen(true);
                  setTimeout(() => {
                    if (audienceDetailsRef.current) {
                      audienceDetailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                  }, 100);
                }}
                style={{
                  border: selectedAudienceCard === 'custom' ? '1.5px solid #EA650A' : '1px solid #E8EDF3',
                  background: selectedAudienceCard === 'custom' ? '#FFF8F4' : '#FFFFFF',
                  borderRadius: '12px',
                  padding: '16px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  textAlign: 'left'
                }}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: selectedAudienceCard === 'custom' ? '5px solid #EA650A' : '1.5px solid #B0B7C3',
                  background: '#ffffff',
                  boxSizing: 'border-box'
                }} />
                <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
                  <Target size={32} color={selectedAudienceCard === 'custom' ? '#EA650A' : '#09122E'} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#09122E', marginBottom: '4px' }}>
                    Choose an Audience
                  </div>
                  <div style={{ fontSize: '11px', color: '#777E90', lineHeight: '1.3' }}>
                    Select by interests, industry, age group etc.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Accordion: Audience Details (Displayed ONLY when Choose an Audience is selected) */}
          {selectedAudienceCard === 'custom' && (
            <div
              ref={audienceDetailsRef}
              style={{
                borderRadius: '12px',
                border: '1px solid #FFE4D6',
                background: '#FFF8F4',
                overflow: 'hidden',
                marginBottom: '24px'
              }}
            >
              <div
                onClick={() => setIsAudienceDetailsOpen(!isAudienceDetailsOpen)}
                style={{
                  padding: '14px 18px',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#09122E' }}>Audience Details</span>
                  <span style={{ fontSize: '15px', color: '#545A69', fontWeight: '400' }}>(Optional)</span>
                </div>
                {isAudienceDetailsOpen ? <ChevronUp size={20} color="#EA650A" /> : <ChevronDown size={20} color="#EA650A" />}
              </div>

              {isAudienceDetailsOpen && (
                <div style={{ padding: '0 18px 18px 18px', background: '#FFFFFF', borderTop: '1px solid #FFE4D6' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginTop: '16px',
                    textAlign: 'left'
                  }}>
                    {/* Interests */}
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: '700', color: '#09122E', marginBottom: '6px', display: 'block' }}>
                        Interests
                      </label>
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                          <Tag size={16} color="#777E90" />
                        </div>
                        <select
                          value={targetInterests.length > 0 ? targetInterests[0] : ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val) setTargetInterests([val]);
                            else setTargetInterests([]);
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 36px 10px 36px',
                            borderRadius: '8px',
                            border: '1px solid #DDE2EE',
                            background: '#FFFFFF',
                            fontSize: '13px',
                            color: targetInterests.length > 0 ? '#09122E' : '#777E90',
                            outline: 'none',
                            cursor: 'pointer',
                            appearance: 'none'
                          }}
                        >
                          <option value="">Select interests</option>
                          {interestsList.map(item => (
                            <option key={item._id || item.name} value={item.name}>{item.name}</option>
                          ))}
                        </select>
                        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                          <ChevronDown size={16} color="#777E90" />
                        </div>
                      </div>
                    </div>

                    {/* Industries */}
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: '700', color: '#09122E', marginBottom: '6px', display: 'block' }}>
                        Industries
                      </label>
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                          <Building2 size={16} color="#777E90" />
                        </div>
                        <select
                          value={targetIndustries.length > 0 ? targetIndustries[0] : ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val) setTargetIndustries([val]);
                            else setTargetIndustries([]);
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 36px 10px 36px',
                            borderRadius: '8px',
                            border: '1px solid #DDE2EE',
                            background: '#FFFFFF',
                            fontSize: '13px',
                            color: targetIndustries.length > 0 ? '#09122E' : '#777E90',
                            outline: 'none',
                            cursor: 'pointer',
                            appearance: 'none'
                          }}
                        >
                          <option value="">Select industries</option>
                          {industriesList.map(ind => (
                            <option key={ind._id || ind.name} value={ind.name}>{ind.name}</option>
                          ))}
                        </select>
                        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                          <ChevronDown size={16} color="#777E90" />
                        </div>
                      </div>
                    </div>

                    {/* Age Group */}
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: '700', color: '#09122E', marginBottom: '6px', display: 'block' }}>
                        Age Group
                      </label>
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                          <Users size={16} color="#777E90" />
                        </div>
                        <select
                          value={targetAgeGroups.length > 0 ? targetAgeGroups[0] : ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val) setTargetAgeGroups([val]);
                            else setTargetAgeGroups([]);
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 36px 10px 36px',
                            borderRadius: '8px',
                            border: '1px solid #DDE2EE',
                            background: '#FFFFFF',
                            fontSize: '13px',
                            color: targetAgeGroups.length > 0 ? '#09122E' : '#777E90',
                            outline: 'none',
                            cursor: 'pointer',
                            appearance: 'none'
                          }}
                        >
                          <option value="">Select age group</option>
                          {['20-25', '26-35', '36-50', '51-65', '65+'].map(bracket => (
                            <option key={bracket} value={bracket}>{bracket}</option>
                          ))}
                        </select>
                        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                          <ChevronDown size={16} color="#777E90" />
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: '700', color: '#09122E', marginBottom: '6px', display: 'block' }}>
                        Location
                      </label>
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                          <MapPin size={16} color="#777E90" />
                        </div>
                        <select
                          value={targetCityLocation}
                          onChange={(e) => {
                            setTargetCityLocation(e.target.value);
                            if (e.target.value) setTargetCity(true);
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 36px 10px 36px',
                            borderRadius: '8px',
                            border: '1px solid #DDE2EE',
                            background: '#FFFFFF',
                            fontSize: '13px',
                            color: targetCityLocation ? '#09122E' : '#777E90',
                            outline: 'none',
                            cursor: 'pointer',
                            appearance: 'none'
                          }}
                        >
                          <option value="">Select city</option>
                          {citiesList.map(city => (
                            <option key={city._id || city.name || city} value={typeof city === 'string' ? city : city.name}>
                              {typeof city === 'string' ? city : city.name}
                            </option>
                          ))}
                        </select>
                        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                          <ChevronDown size={16} color="#777E90" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Attachments preview */}
          {attachments.length > 0 && previewUrls.length > 0 && (
            <div className="attachment-previews-grid">
              {attachments.map((file, index) => (
                <div key={index} className="att-preview-box">
                  {file.type.startsWith('image/') ? (
                    <img src={previewUrls[index]} alt="preview" />
                  ) : (
                    <div className="att-file-placeholder">
                      <FileText size={24} color="#EA650A" />
                      <span className="att-file-name">{file.name}</span>
                    </div>
                  )}
                  <button type="button" className="att-remove-btn" onClick={() => removeAttachment(index)}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Footer actions */}
          <div className="create-post-footer-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px' }}>
            <div className="footer-left">
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#777E90',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: '8px 0'
                }}
              >
                Clear
              </button>
            </div>

            <div className="footer-right">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPosting}
                style={{
                  background: '#EA650A',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 32px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 12px rgba(234, 101, 10, 0.2)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Send size={18} color="#ffffff" style={{ transform: 'rotate(-45deg)' }} />
                <span>{isPosting ? 'Asking...' : 'Ask'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePost;
