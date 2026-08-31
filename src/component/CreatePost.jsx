import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, FileText, File, X, Send, Paperclip, Plus, Briefcase, Users, ChevronDown, ChevronUp } from 'lucide-react';
import API_BASE_URL from '../utils/config';
import { getCookie, getUserProfile } from '../utils/auth';
import { toast } from 'react-toastify';

const CreatePost = ({ onPostCreated, isExpanded: propIsExpanded, setIsExpanded: propSetIsExpanded }) => {
  const [content, setContent] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [sharingReason, setSharingReason] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const [localIsExpanded, setLocalIsExpanded] = useState(false);
  const isExpanded = propIsExpanded !== undefined ? propIsExpanded : localIsExpanded;
  const setIsExpanded = propSetIsExpanded !== undefined ? propSetIsExpanded : setLocalIsExpanded;
  const [showOptions, setShowOptions] = useState(false);
  const [shareType, setShareType] = useState('link'); // 'post' or 'link'
  const [targetConnections, setTargetConnections] = useState(true);
  const [targetCity, setTargetCity] = useState(false);
  const [targetIndustries, setTargetIndustries] = useState([]);
  const [targetAgeGroups, setTargetAgeGroups] = useState([]);
  const [industriesList, setIndustriesList] = useState([]);
  const [linkPreview, setLinkPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [isIndustriesOpen, setIsIndustriesOpen] = useState(false);
  const [isAgeGroupsOpen, setIsAgeGroupsOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Connection Groups states
  const [connectionGroups, setConnectionGroups] = useState([]);
  const [shareScope, setShareScope] = useState('all'); // 'all' or 'group'
  const [selectedGroup, setSelectedGroup] = useState('');
  const [previewUrls, setPreviewUrls] = useState([]);

  useEffect(() => {
    const urls = attachments.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [attachments]);

  useEffect(() => {
    if (!shareLink) {
      setLinkPreview(null);
      return;
    }

    const urlPattern = /https?:\/\/[^\s]+/i;
    if (!urlPattern.test(shareLink.trim())) {
      setLinkPreview(null);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        setLoadingPreview(true);
        const token = getCookie('authToken');
        const response = await fetch(`${API_BASE_URL}/api/posts/link-preview?url=${encodeURIComponent(shareLink.trim())}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setLinkPreview(result.data);
          } else {
            setLinkPreview(null);
          }
        } else {
          setLinkPreview(null);
        }
      } catch (err) {
        console.error('Error fetching preview:', err);
        setLinkPreview(null);
      } finally {
        setLoadingPreview(false);
      }
    }, 1000); // 1s debounce

    return () => clearTimeout(delayDebounceFn);
  }, [shareLink]);

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

    const fetchConnectionGroups = async () => {
      try {
        const token = getCookie('authToken');
        const response = await fetch(`${API_BASE_URL}/api/connection/groups`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.groups) {
            setConnectionGroups(result.data.groups);
          }
        }
      } catch (err) {
        console.error('Error fetching connection groups:', err);
      }
    };

    fetchIndustries();
    fetchConnectionGroups();
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (shareType === 'link') {
      const mp4Files = files.filter(file => file.type === 'video/mp4' || file.name.toLowerCase().endsWith('.mp4'));
      if (mp4Files.length === 0) {
        toast.error('Only .mp4 video files are allowed');
        return;
      }
      setAttachments([mp4Files[0]]);
    } else {
      if (attachments.length + files.length > 5) {
        toast.error('Maximum 5 attachments allowed');
        return;
      }
      setAttachments([...attachments, ...files]);
    }
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    setContent('');
    setShareLink('');
    setSharingReason('');
    setAttachments([]);
    setTargetConnections(true);
    setTargetCity(false);
    setTargetIndustries([]);
    setTargetAgeGroups([]);
    setLinkPreview(null);
    setLoadingPreview(false);
    setIsExpanded(false);
    setShowOptions(false);
    setShareScope('all');
    setSelectedGroup('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let finalContent = '';
    if (shareType === 'link') {
      if (attachments.length === 0 && !sharingReason.trim()) {
        toast.error('Please attach a reel (.mp4) or write a description');
        return;
      }
      finalContent = sharingReason.trim();
    } else {
      if (!content.trim() && attachments.length === 0) {
        toast.error('Please add some content or an attachment');
        return;
      }
      finalContent = content;
    }

    setIsPosting(true);
    const formData = new FormData();
    formData.append('content', finalContent);
    attachments.forEach((file) => {
      formData.append('attachments', file);
    });

    const targetSegments = {
      connections: targetConnections,
      city: targetCity,
      industries: targetIndustries,
      ageGroups: targetAgeGroups
    };
    formData.append('targetSegments', JSON.stringify(targetSegments));

    if (shareScope === 'group' && selectedGroup) {
      formData.append('connectionGroupId', selectedGroup);
    }

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
        toast.success('Post shared successfully');
        setContent('');
        setShareLink('');
        setSharingReason('');
        setAttachments([]);
        setTargetConnections(true);
        setTargetCity(false);
        setTargetIndustries([]);
        setTargetAgeGroups([]);
        setLinkPreview(null);
        setLoadingPreview(false);
        setIsExpanded(false);
        setShowOptions(false);
        setShareScope('all');
        setSelectedGroup('');
        if (onPostCreated) onPostCreated(data.data);
      } else {
        toast.error(data.message || 'Failed to share post');
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
              setShareType('link');
              setIsExpanded(true);
            }}
          >
            <Plus size={20} />
            <span>New Share</span>
          </button>
        </div>
      ) : (
        <div className="create-post-form-card">
          <div className="create-post-form-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#09122E' }}>Create Share</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#777E90', textAlign: 'left' }}>
              Share a <span style={{ color: '#EA650A', fontWeight: '600' }}>reel</span> or <span style={{ color: '#EA650A', fontWeight: '600' }}>ask a question</span> with your network and communities.
            </p>
          </div>

          {shareType === 'link' ? (
            <div className="share-link-fields-wrapper" style={{ display: 'flex', gap: '20px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {/* Left Side: Upload Box & Preview */}
              <div style={{ flex: '1', minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="link-input-group">
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#353945', marginBottom: '6px', display: 'block', textAlign: 'left' }}>Reel Video (MP4)</label>
                  <div
                    className="video-upload-area"
                    onClick={() => fileInputRef.current.click()}
                    style={{
                      border: '2px dashed #DDE2EE',
                      borderRadius: '8px',
                      padding: '24px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: '#F8F9FB',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Plus size={24} color="#EA650A" />
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#353945' }}>
                      {attachments.length > 0 ? attachments[0].name : "Choose Video"}
                    </span>
                    <span style={{ fontSize: '12px', color: '#777E90' }}>MP4 · Max file size 50MB</span>
                  </div>
                </div>

                {/* Video Preview if selected */}
                {attachments.length > 0 && previewUrls.length > 0 && (attachments[0].type.startsWith('video/') || attachments[0].name.toLowerCase().endsWith('.mp4')) && (
                  <div style={{ width: '100%', borderRadius: '8px', overflow: 'hidden', background: '#000', maxHeight: '180px' }}>
                    <video
                      src={previewUrls[0]}
                      controls
                      autoPlay
                      muted
                      playsInline
                      loop
                      style={{ width: '100%', maxHeight: '180px', display: 'block' }}
                    />
                  </div>
                )}
              </div>

              {/* Right Side: Caption */}
              <div style={{ flex: '1', minWidth: '240px', display: 'flex', flexDirection: 'column' }}>
                <div className="reason-input-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', height: '100%' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#353945', display: 'block' }}>Caption (Optional)</label>
                  <textarea
                    className="post-textarea-premium"
                    rows={6}
                    maxLength={2000}
                    placeholder="Add a caption, thought, or question..."
                    value={sharingReason}
                    onChange={(e) => setSharingReason(e.target.value)}
                    style={{ marginBottom: '4px', flex: '1', resize: 'none' }}
                  />
                  <div style={{ textAlign: 'right', fontSize: '12px', color: '#777E90' }}>
                    {sharingReason.length}/2000
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <textarea
              className="post-textarea-premium"
              placeholder="Share something with your connections..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
            />
          )}

          {/* Target Audience Segment Selection */}
          <div className="target-audience-section" style={{ borderTop: '1px solid #E8EDF3', paddingTop: '16px', marginTop: '16px', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#09122E', marginBottom: '12px', textAlign: 'left' }}>Audience</h4>

            {/* Share Scope Selector */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#353945' }}>
                <input
                  type="radio"
                  name="shareScope"
                  checked={shareScope === 'all'}
                  onChange={() => setShareScope('all')}
                  style={{ accentColor: '#EA650A' }}
                />
                All Available Audiences
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#353945' }}>
                <input
                  type="radio"
                  name="shareScope"
                  checked={shareScope === 'group'}
                  onChange={() => setShareScope('group')}
                  style={{ accentColor: '#EA650A' }}
                />
                Specific Group
              </label>
            </div>

            {shareScope === 'group' ? (
              <div style={{ border: '1px solid #E8EDF3', borderRadius: '8px', padding: '16px', background: '#F8F9FB', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#353945', marginBottom: '8px', display: 'block' }}>
                  Select Group
                </label>
                {connectionGroups.length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#777E90', margin: 0 }}>
                    You haven't created any connection groups yet. You can create groups under the "Groups" tab on your <a href="/connections" style={{ color: '#EA650A', textDecoration: 'none', fontWeight: '600' }}>Connections page</a>.
                  </p>
                ) : (
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #DDE2EE',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#09122E',
                      outline: 'none',
                      background: '#fff'
                    }}
                  >
                    <option value="">-- Choose a group --</option>
                    {connectionGroups.map(g => (
                      <option key={g._id} value={g._id}>{g.name} ({g.connections?.length || 0} members)</option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <>
                <div className="target-segments-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>

                  {/* Connections Target */}
                  <div className="target-segment-card" style={{ border: '1px solid #E8EDF3', borderRadius: '8px', padding: '12px', background: '#F8F9FB', textAlign: 'left' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#353945' }}>
                      <input
                        type="checkbox"
                        checked={targetConnections}
                        onChange={(e) => setTargetConnections(e.target.checked)}
                        style={{ accentColor: '#EA650A' }}
                      />
                      My Connections
                    </label>
                    <p style={{ fontSize: '11px', color: '#777E90', margin: '4px 0 0 22px' }}>Share with your direct connections</p>
                  </div>

                  {/* Same City Target */}
                  <div className="target-segment-card" style={{ border: '1px solid #E8EDF3', borderRadius: '8px', padding: '12px', background: '#F8F9FB', textAlign: 'left' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#353945' }}>
                      <input
                        type="checkbox"
                        checked={targetCity}
                        onChange={(e) => setTargetCity(e.target.checked)}
                        style={{ accentColor: '#EA650A' }}
                      />
                      People in My City
                    </label>
                    <p style={{ fontSize: '11px', color: '#777E90', margin: '4px 0 0 22px' }}>Share with people in your same city</p>
                  </div>

                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
                  {/* Industry targeting */}
                  <div className="target-collapsible-section" style={{ flex: '1', minWidth: '240px', border: '1px solid #E8EDF3', borderRadius: '8px', padding: '12px', background: '#ffffff', textAlign: 'left' }}>
                    <div
                      onClick={() => setIsIndustriesOpen(!isIndustriesOpen)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Briefcase size={18} color="#EA650A" />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#353945' }}>Industries ({targetIndustries.length} selected)</span>
                          <span style={{ fontSize: '11px', color: '#777E90' }}>Select industries to refine your audience</span>
                        </div>
                      </div>
                      {isIndustriesOpen ? <ChevronUp size={18} color="#777E90" /> : <ChevronDown size={18} color="#777E90" />}
                    </div>
                    {isIndustriesOpen && (
                      <div className="industries-multi-select" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px', maxHeight: '120px', overflowY: 'auto', padding: '4px' }}>
                        {industriesList.map((ind) => {
                          const isSelected = targetIndustries.includes(ind.name);
                          return (
                            <button
                              key={ind._id}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setTargetIndustries(targetIndustries.filter(name => name !== ind.name));
                                } else {
                                  setTargetIndustries([...targetIndustries, ind.name]);
                                }
                              }}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '20px',
                                border: '1px solid',
                                borderColor: isSelected ? '#EA650A' : '#E8EDF3',
                                background: isSelected ? '#FFF1E6' : '#F8F9FB',
                                color: isSelected ? '#EA650A' : '#353945',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {ind.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Age bracket targeting */}
                  <div className="target-collapsible-section" style={{ flex: '1', minWidth: '240px', border: '1px solid #E8EDF3', borderRadius: '8px', padding: '12px', background: '#ffffff', textAlign: 'left' }}>
                    <div
                      onClick={() => setIsAgeGroupsOpen(!isAgeGroupsOpen)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Users size={18} color="#EA650A" />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#353945' }}>Age Groups ({targetAgeGroups.length} selected)</span>
                          <span style={{ fontSize: '11px', color: '#777E90' }}>Select age groups to refine your audience</span>
                        </div>
                      </div>
                      {isAgeGroupsOpen ? <ChevronUp size={18} color="#777E90" /> : <ChevronDown size={18} color="#777E90" />}
                    </div>
                    {isAgeGroupsOpen && (
                      <div className="age-bracket-checkboxes" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '14px' }}>
                        {['20-25', '26-35', '36-50', '51-65', '65+'].map((bracket) => {
                          const isSelected = targetAgeGroups.includes(bracket);
                          return (
                            <label key={bracket} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: '#353945' }}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  if (isSelected) {
                                    setTargetAgeGroups(targetAgeGroups.filter(b => b !== bracket));
                                  } else {
                                    setTargetAgeGroups([...targetAgeGroups, bracket]);
                                  }
                                }}
                                style={{ accentColor: '#EA650A' }}
                              />
                              {bracket}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

          </div>

          {attachments.length > 0 && previewUrls.length > 0 && shareType !== 'link' && (
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

          <div className="create-post-footer-actions">
            <div className="footer-left">
              {shareType !== 'link' && (
                <button
                  type="button"
                  className="attach-trigger-btn"
                  onClick={() => fileInputRef.current.click()}
                  title="Attach media"
                >
                  <Paperclip size={18} />
                  <span>Add Media</span>
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={shareType === 'link' ? "video/mp4" : "image/*,.pdf,.doc,.docx"}
                style={{ display: 'none' }}
              />
            </div>

            <div className="footer-right">
              <button type="button" className="cancel-post-btn" onClick={handleCancel} disabled={isPosting}>
                Cancel
              </button>
              <button
                type="button"
                className="submit-post-btn"
                onClick={handleSubmit}
                disabled={isPosting}
              >
                {isPosting ? 'Sharing...' : 'Share'}
                {!isPosting && <Send size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePost;
