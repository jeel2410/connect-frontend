import React, { useState, useRef } from 'react';
import { Image as ImageIcon, FileText, File, X, Send, Paperclip, Plus } from 'lucide-react';
import API_BASE_URL from '../utils/config';
import { getCookie, getUserProfile } from '../utils/auth';
import { toast } from 'react-toastify';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef(null);

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
    setIsExpanded(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && attachments.length === 0) {
      toast.error('Please add some content or an attachment');
      return;
    }

    setIsPosting(true);
    const formData = new FormData();
    formData.append('content', content);
    attachments.forEach((file) => {
      formData.append('attachments', file);
    });

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
        setAttachments([]);
        setIsExpanded(false);
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
          <button className="create-btn-main" onClick={() => setIsExpanded(true)}>
            <Plus size={20} />
            <span>Create Post</span>
          </button>
        </div>
      ) : (
        <div className="create-post-form-card">
          <div className="create-post-form-header">
            <h3>New Post</h3>
          </div>

          <textarea
            className="post-textarea-premium"
            placeholder="Share something with your connections..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
          />

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
