import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, FileText, File, X, Send, Paperclip, Plus } from 'lucide-react';
import API_BASE_URL from '../utils/config';
import { getCookie, getUserProfile } from '../utils/auth';
import { toast } from 'react-toastify';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [sharingReason, setSharingReason] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [shareType, setShareType] = useState('post'); // 'post' or 'link'
  const [targetConnections, setTargetConnections] = useState(true);
  const [targetCity, setTargetCity] = useState(false);
  const [targetIndustries, setTargetIndustries] = useState([]);
  const [targetAgeGroups, setTargetAgeGroups] = useState([]);
  const [industriesList, setIndustriesList] = useState([]);
  const [linkPreview, setLinkPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const fileInputRef = useRef(null);

  // Connection Groups states
  const [connectionGroups, setConnectionGroups] = useState([]);
  const [shareScope, setShareScope] = useState('all'); // 'all' or 'group'
  const [selectedGroup, setSelectedGroup] = useState('');

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
      if (!shareLink.trim()) {
        toast.error('Please enter a link to share');
        return;
      }
      const urlPattern = /https?:\/\/[^\s]+/i;
      if (!urlPattern.test(shareLink.trim())) {
        toast.error('Please enter a valid link starting with http:// or https://');
        return;
      }
      if (!sharingReason.trim()) {
        toast.error('Please explain why you are sharing this link');
        return;
      }
      finalContent = `${sharingReason.trim()}\n\n${shareLink.trim()}`;
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
          {!showOptions ? (
            <button className="create-btn-main" onClick={() => setShowOptions(true)}>
              <Plus size={20} />
              <span>New Share</span>
            </button>
          ) : (
            <div className="share-options-container" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                className="create-btn-main create-post-option-btn"
                onClick={() => {
                  setShareType('post');
                  setIsExpanded(true);
                }}
              >
                <Plus size={20} />
                <span>Create post</span>
              </button>
              <button
                className="create-btn-main link-btn-variant"
                onClick={() => {
                  setShareType('link');
                  setIsExpanded(true);
                }}
              >
                <Plus size={20} />
                <span>Share Link</span>
              </button>
              <button
                className="close-icon-btn"
                onClick={() => setShowOptions(false)}
                title="Cancel selection"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="create-post-form-card">
          <div className="create-post-form-header">
            <h3>{shareType === 'link' ? 'Share Link' : 'New Post'}</h3>
          </div>

          {shareType === 'link' ? (
            <div className="share-link-fields-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
              <div className="link-input-group">
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#353945', marginBottom: '6px', display: 'block' }}>Destination Link</label>
                <input
                  type="text"
                  className="post-textarea-premium"
                  style={{ width: '100%', padding: '12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #DDE2EE', height: 'auto' }}
                  placeholder="Share an article, video, trend, or discovery with your connections"
                  value={shareLink}
                  onChange={(e) => setShareLink(e.target.value)}
                />
              </div>

              {/* Dynamic Link Preview */}
              {loadingPreview && (
                <div style={{ fontSize: '12px', color: '#777E90', padding: '8px', fontStyle: 'italic' }}>Fetching link preview...</div>
              )}
              {linkPreview && linkPreview.url && (
                <div className="post-link-preview-edit" style={{ display: 'flex', gap: '16px', border: '1px solid #E8EDF3', borderRadius: '8px', overflow: 'hidden', background: '#F8F9FB', marginTop: '-8px' }}>
                  {linkPreview.image && (
                    <img src={linkPreview.image} alt="preview" style={{ width: '150px', height: '100px', objectFit: 'cover', flexShrink: 0 }} />
                  )}
                  <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                    <h5 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 6px 0', color: '#09122E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{linkPreview.title || 'External Link'}</h5>
                    {linkPreview.description && (
                      <p style={{ fontSize: '12px', color: '#777E90', margin: '0 0 8px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{linkPreview.description}</p>
                    )}
                    <a href={linkPreview.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#EA650A', fontWeight: '600', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{linkPreview.url}</a>
                  </div>
                </div>
              )}

              <div className="reason-input-group">
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#353945', marginBottom: '6px', display: 'block' }}>Why are you sharing this? <span style={{ color: '#EA650A' }}>*</span></label>
                <textarea
                  className="post-textarea-premium"
                  rows={4}
                  placeholder="Tell us your thoughts, why this matters, or ask the community a question."
                  value={sharingReason}
                  onChange={(e) => setSharingReason(e.target.value)}
                />
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
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#09122E', marginBottom: '12px', textAlign: 'left' }}>Target Audience</h4>
            
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
                All Connections & Segments
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#353945' }}>
                <input
                  type="radio"
                  name="shareScope"
                  checked={shareScope === 'group'}
                  onChange={() => setShareScope('group')}
                  style={{ accentColor: '#EA650A' }}
                />
                Specific Connection Group
              </label>
            </div>

            {shareScope === 'group' ? (
              <div style={{ border: '1px solid #E8EDF3', borderRadius: '8px', padding: '16px', background: '#F8F9FB', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#353945', marginBottom: '8px', display: 'block' }}>
                  Select Connection Group
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
                  <div className="target-segment-card" style={{ border: '1px solid #E8EDF3', borderRadius: '8px', padding: '12px', background: '#F8F9FB' }}>
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
                  <div className="target-segment-card" style={{ border: '1px solid #E8EDF3', borderRadius: '8px', padding: '12px', background: '#F8F9FB' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#353945' }}>
                      <input
                        type="checkbox"
                        checked={targetCity}
                        onChange={(e) => setTargetCity(e.target.checked)}
                        style={{ accentColor: '#EA650A' }}
                      />
                      People in my City
                    </label>
                    <p style={{ fontSize: '11px', color: '#777E90', margin: '4px 0 0 22px' }}>Share with people in your same city</p>
                  </div>

                </div>

                {/* Industry targeting */}
                <div className="target-collapsible-section" style={{ marginTop: '16px', border: '1px solid #E8EDF3', borderRadius: '8px', padding: '12px', background: '#ffffff', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#353945' }}>Target Specific Industries ({targetIndustries.length} selected)</span>
                  </div>
                  <div className="industries-multi-select" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px', maxHeight: '120px', overflowY: 'auto', padding: '4px' }}>
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
                </div>

                {/* Age bracket targeting */}
                <div className="target-collapsible-section" style={{ marginTop: '16px', border: '1px solid #E8EDF3', borderRadius: '8px', padding: '12px', background: '#ffffff', textAlign: 'left' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#353945' }}>Target Specific Age Groups ({targetAgeGroups.length} selected)</span>
                  <div className="age-bracket-checkboxes" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '10px' }}>
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
                </div>
              </>
            )}

          </div>

          {attachments.length > 0 && (
            <div className="attachment-previews-grid">
              {attachments.map((file, index) => (
                <div key={index} className="att-preview-box">
                  {file.type.startsWith('image/') ? (
                    <img src={URL.createObjectURL(file)} alt="preview" />
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
              <button
                type="button"
                className="attach-trigger-btn"
                onClick={() => fileInputRef.current.click()}
                title="Attach media"
              >
                <Paperclip size={18} />
                <span>Add Media</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept="image/*,.pdf,.doc,.docx"
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
                {isPosting ? 'Posting...' : 'Post'}
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
