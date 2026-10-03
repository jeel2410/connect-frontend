import React from 'react';
import { X, Check, Plus } from 'lucide-react';

const ManageInterestsModal = ({
  isOpen,
  onClose,
  allAvailableInterests = [],
  editingInterests = [],
  setEditingInterests,
  handleSaveInterests,
  savingInterests,
  getTopicIcon
}) => {
  if (!isOpen) return null;

  const defaultTopics = [
    'Hospitality & Tourism', 'Restaurants & Food', 'Interior & Architecture',
    'Real Estate', 'Retail & E-commerce', 'Healthcare', 'Technology & IT',
    'Legal & Compliance', 'Finance & Tax', 'Marketing & Media'
  ];

  const topicsList = allAvailableInterests.length > 0 ? allAvailableInterests : defaultTopics;

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
        maxWidth: '560px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0px 20px 50px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid #E8EDF3'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#09122E' }}>Manage Your Interests</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#777E90' }}>
              Select topics to personalize your question feed.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px' }}
          >
            <X size={20} color="#777E90" />
          </button>
        </div>

        {/* Modal Body: Interest Pills */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {topicsList.map((topicName) => {
              const isSelected = editingInterests.some(i => i.toLowerCase() === topicName.toLowerCase());
              const icon = getTopicIcon ? getTopicIcon(topicName) : '📌';

              return (
                <button
                  key={topicName}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setEditingInterests(editingInterests.filter(i => i.toLowerCase() !== topicName.toLowerCase()));
                    } else {
                      setEditingInterests([...editingInterests, topicName]);
                    }
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: isSelected ? '1px solid #0066FF' : '1px solid #E8EDF3',
                    background: isSelected ? '#F0F7FF' : '#FFFFFF',
                    color: isSelected ? '#0066FF' : '#353945',
                    fontSize: '13px',
                    fontWeight: isSelected ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{icon} {topicName}</span>
                  {isSelected ? <Check size={14} color="#0066FF" /> : <Plus size={14} color="#777E90" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          display: 'flex',
          justify: 'flex-end',
          gap: '12px',
          padding: '16px 24px',
          borderTop: '1px solid #E8EDF3',
          background: '#F9FAFC'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid #DDE2EE',
              borderRadius: '10px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#545A69',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveInterests}
            disabled={savingInterests}
            style={{
              background: '#0066FF',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#FFFFFF',
              cursor: savingInterests ? 'not-allowed' : 'pointer',
              opacity: savingInterests ? 0.7 : 1
            }}
          >
            {savingInterests ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageInterestsModal;
