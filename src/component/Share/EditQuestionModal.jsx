import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, AlertCircle } from 'lucide-react';
import API_BASE_URL from '../../utils/config';
import { getCookie } from '../../utils/auth';
import { toast } from 'react-toastify';

const EditQuestionModal = ({
  isOpen,
  onClose,
  post,
  onPostUpdated,
  onPostDeleted
}) => {
  const [question, setQuestion] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (post) {
      setQuestion(post.question || post.title || '');
      setContent(post.content || '');
    }
  }, [post]);

  if (!isOpen || !post) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!question.trim() && !content.trim()) {
      toast.error('Question text or description is required');
      return;
    }

    try {
      setIsSaving(true);
      const token = getCookie('authToken');
      if (!token) {
        toast.error('You must be logged in to edit this question');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/posts/${post._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: question.trim(),
          title: question.trim(),
          content: content.trim()
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Question updated successfully!');
        if (onPostUpdated && data.data?.post) {
          onPostUpdated(data.data.post);
        }
        onClose();
      } else {
        toast.error(data.message || 'Failed to update question');
      }
    } catch (err) {
      console.error('Error updating question:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this pending question?');
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const token = getCookie('authToken');
      if (!token) {
        toast.error('You must be logged in to delete this question');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/posts/${post._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Question deleted successfully');
        if (onPostDeleted) {
          onPostDeleted(post._id);
        }
        onClose();
      } else {
        toast.error(data.message || 'Failed to delete question');
      }
    } catch (err) {
      console.error('Error deleting question:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(9, 18, 46, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0px 20px 50px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid #E8EDF3'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#09122E' }}>Edit Pending Question</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#777E90' }}>
              Update your question details before it is reviewed by admins
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving || isDeleting}
            style={{
              background: '#F4F5F6',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#777E90'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Notice Banner */}
        <div style={{
          background: '#FFF8E6',
          borderLeft: '4px solid #F59E0B',
          padding: '12px 18px',
          margin: '16px 24px 0 24px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#8A5300',
          fontSize: '13px',
          lineHeight: '1.4'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>
            This question is waiting for admin approval. Once approved, question editing is locked.
          </span>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#09122E', marginBottom: '6px' }}>
              Question / Title <span style={{ color: '#FF3B30' }}>*</span>
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What innovative trends in SaaS are you most excited about?"
              required
              disabled={isSaving || isDeleting}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #D6DFE8',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#09122E', marginBottom: '6px' }}>
              Description / Additional Details
            </label>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide more details, context, or requirements for your question..."
              disabled={isSaving || isDeleting}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #D6DFE8',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '12px',
            borderTop: '1px solid #E8EDF3'
          }}>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSaving || isDeleting}
              style={{
                background: '#FFF0F0',
                border: '1px solid #FFD1D1',
                color: '#FF3B30',
                padding: '10px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: (isSaving || isDeleting) ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Trash2 size={16} />
              <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving || isDeleting}
                style={{
                  background: '#F4F5F6',
                  border: 'none',
                  color: '#545A69',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: (isSaving || isDeleting) ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || isDeleting}
                style={{
                  background: '#FF4D00',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: (isSaving || isDeleting) ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Save size={16} />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuestionModal;
