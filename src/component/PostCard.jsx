import React from 'react';
import { FileText, Image as ImageIcon, File } from 'lucide-react';
import femaleDefault from '../assets/image/userProfile.png';
import maleDefault from '../assets/image/maleProfile.png';

const PostCard = ({ post }) => {
  const { userId, content, attachments, createdAt } = post;
  const userDetail = userId?.userDetailId;
  const displayName = userDetail?.fullName || 'User';
  const displayImage = userDetail?.profileImage || (userDetail?.gender === 'female' ? femaleDefault : maleDefault);
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderAttachment = (att, index) => {
    if (att.type === 'image') {
      return (
        <div key={index} className="post-attachment-image">
          <img src={att.url} alt={att.name || 'attachment'} />
        </div>
      );
    }
    
    return (
      <a key={index} href={att.url} target="_blank" rel="noopener noreferrer" className="post-attachment-file">
        {att.type === 'pdf' ? <FileText size={20} /> : <File size={20} />}
        <span>{att.name || (att.type === 'pdf' ? 'PDF Document' : 'Document')}</span>
      </a>
    );
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <img src={displayImage} alt={displayName} className="post-user-avatar" />
        <div className="post-user-info">
          <h4 className="post-user-name">{displayName}</h4>
          <span className="post-date">{formatDate(createdAt)}</span>
        </div>
      </div>
      <div className="post-content">
        <p>{content}</p>
      </div>
      {attachments && attachments.length > 0 && (
        <div className="post-attachments">
          {attachments.map((att, index) => renderAttachment(att, index))}
        </div>
      )}
    </div>
  );
};

export default PostCard;
