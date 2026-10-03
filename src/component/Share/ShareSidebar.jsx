import React from 'react';
import {
  Settings, TrendingUp, ChevronRight, Users, Building2, Check, Plus, Award
} from 'lucide-react';

const isObjectIdStr = (str) => typeof str === 'string' && /^[0-9a-fA-F]{24}$/.test(str.trim());
const cleanStr = (val, fallback = '') => (!val || typeof val !== 'string' || isObjectIdStr(val)) ? fallback : val.trim();

const ShareSidebar = ({
  selectedQuestionDetail,
  userInterests = [],
  allAvailableInterests = [],
  toggleInterestPill,
  getTopicIcon,
  onOpenManageInterests,
  dynamicTrendingQuestions = [],
  dynamicRelatedQuestions = [],
  topContributors = [],
  onQuestionClick,
  followedUsers = {},
  handleConnectUser,
  handleUserClick,
  resolveImageUrl,
  getAvatar,
  formatTimeAgo = () => 'Recently'
}) => {
  const topicsList = allAvailableInterests.map(t =>
    typeof t === 'string' ? { name: t, icon: getTopicIcon ? getTopicIcon(t) : '📌' } : t
  );

  return (
    <>
      {!selectedQuestionDetail ? (
        <>
          {/* Main Feed Sidebar */}

          {/* Card 1: Your Interests */}
          <div className="share-sidebar-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #E8EDF3', padding: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#09122E' }}>Your Interests</h3>
              <button
                type="button"
                onClick={onOpenManageInterests}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
                title="Settings"
              >
                <Settings size={18} color="#777E90" />
              </button>
            </div>

            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#777E90' }}>
              Select topics to see questions that match your interests.
            </p>

            {topicsList.length === 0 ? (
              <div style={{ fontSize: '12px', color: '#777E90', fontStyle: 'italic', marginBottom: '16px' }}>
                No interest topics loaded.
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {topicsList.map((item) => {
                  const topicName = typeof item === 'string' ? item : item.name;
                  const icon = typeof item === 'object' && item.icon ? item.icon : (getTopicIcon ? getTopicIcon(topicName) : '📌');
                  const isSelected = userInterests.some(i => i.toLowerCase() === topicName.toLowerCase());
                  return (
                    <button
                      key={topicName}
                      type="button"
                      onClick={() => toggleInterestPill(topicName)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        border: isSelected ? '1px solid #0066FF' : '1px solid #E8EDF3',
                        background: isSelected ? '#F0F7FF' : '#FFFFFF',
                        color: isSelected ? '#0066FF' : '#353945',
                        fontSize: '12px',
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
            )}

            <button
              type="button"
              onClick={onOpenManageInterests}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#0066FF',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: 0
              }}
            >
              <span>Manage all interests</span>
              <span>→</span>
            </button>
          </div>

          {/* Card 2: Trending Questions */}
          <div className="share-sidebar-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #E8EDF3', padding: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#09122E', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} color="#0066FF" /> Trending Questions
              </h3>
            </div>

            {dynamicTrendingQuestions.length === 0 ? (
              <div style={{ fontSize: '12px', color: '#777E90', fontStyle: 'italic', padding: '8px 0' }}>
                No trending questions found.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {dynamicTrendingQuestions.map((item, idx) => {
                  const title = item.content || item.title || 'Untitled Question';
                  const answersCount = item.commentsCount || (item.comments ? item.comments.length : 0);
                  const viewsCount = item.views || item.viewsCount || 0;
                  const formattedViews = viewsCount >= 1000 ? `${(viewsCount / 1000).toFixed(1)}K` : viewsCount;
                  return (
                    <div
                      key={item._id || idx}
                      onClick={() => onQuestionClick(item)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'space-between',
                        gap: '12px',
                        cursor: 'pointer',
                        padding: '8px 0',
                        borderBottom: idx < dynamicTrendingQuestions.length - 1 ? '1px solid #F0F4FA' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: 0 }}>
                        <div style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: '#F0F7FF',
                          color: '#0066FF',
                          fontSize: '12px',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {idx + 1}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#09122E',
                            lineHeight: '1.35',
                            marginBottom: '4px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {title}
                          </div>
                          <div style={{ fontSize: '11px', color: '#777E90' }}>
                            {answersCount} answers • {formattedViews} views
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={16} color="#777E90" style={{ flexShrink: 0 }} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card 3: Top Contributors */}
          <div className="share-sidebar-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #E8EDF3', padding: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#09122E', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="#FF4D00" /> Top Contributors
              </h3>
            </div>

            {topContributors.length === 0 ? (
              <div style={{ fontSize: '12px', color: '#777E90', fontStyle: 'italic', padding: '8px 0' }}>
                No top contributors recorded yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {topContributors.map((item, idx) => {
                  const u = item.user || {};
                  const ud = u.userDetailId || {};
                  const name = ud.isBusinessProfile ? (ud.businessName || 'Business User') : (ud.fullName || 'User');
                  const avatar = ud.isBusinessProfile ? resolveImageUrl(ud.businessLogo) : resolveImageUrl(ud.profileImage);
                  const isConnected = followedUsers[u._id];

                  return (
                    <div key={u._id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                      <div
                        onClick={() => handleUserClick(u._id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1, cursor: 'pointer' }}
                      >
                        <img
                          src={avatar || getAvatar(ud.gender, ud.dateOfBirth)}
                          alt={name}
                          style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                          onError={(e) => { e.target.src = getAvatar(ud.gender, null); }}
                        />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#09122E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#777E90' }}>
                            {ud.industry || 'Community Member'} • {item.sharesCount || 1} answers
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleConnectUser(u._id)}
                        style={{
                          border: '1px solid #0066FF',
                          background: isConnected ? '#0066FF' : '#ffffff',
                          color: isConnected ? '#ffffff' : '#0066FF',
                          borderRadius: '8px',
                          padding: '6px 14px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      >
                        {isConnected ? 'Connected' : 'Follow'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Question Detail View Sidebar */}

          {/* Card 1: People who can help */}
          <div className="share-sidebar-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #E8EDF3', padding: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#09122E', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FFF0E6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={16} color="#FF4D00" />
                </div>
                <span>People who can help</span>
              </h3>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#777E90' }}>
              Connect with people on Connect.in who have relevant experience.
            </p>

            {(() => {
              const displayPeople = selectedQuestionDetail.aiRecommendations?.people || [];
              if (displayPeople.length === 0) {
                return (
                  <div style={{ fontSize: '12px', color: '#777E90', fontStyle: 'italic', padding: '8px 0' }}>
                    No recommended people found for this question yet.
                  </div>
                );
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {displayPeople.map((person, idx) => {
                    const targetId = person.user || person._id || idx;
                    const isConnected = followedUsers[targetId];
                    const avatar = person.profileImage ? resolveImageUrl(person.profileImage) : getAvatar(person.gender, person.dateOfBirth);

                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                        <div
                          onClick={() => handleUserClick(targetId)}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1, cursor: 'pointer' }}
                        >
                          <img
                            src={avatar}
                            alt={person.fullName}
                            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                            onError={(e) => { e.target.src = getAvatar(person.gender, null); }}
                          />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#09122E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {cleanStr(person.fullName, 'User')}
                            </div>
                            {cleanStr(person.position) && (
                              <div style={{ fontSize: '11px', color: '#545A69', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {cleanStr(person.position)}
                              </div>
                            )}
                            {cleanStr(person.city) && (
                              <div style={{ fontSize: '11px', color: '#777E90', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {cleanStr(person.city)}
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleConnectUser(targetId)}
                          style={{
                            border: '1px solid #0066FF',
                            background: isConnected ? '#0066FF' : '#ffffff',
                            color: isConnected ? '#ffffff' : '#0066FF',
                            borderRadius: '8px',
                            padding: '6px 14px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                        >
                          {isConnected ? 'Connected' : 'Connect'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Card 3: Businesses that can help */}
          <div className="share-sidebar-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #E8EDF3', padding: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#09122E', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FFF0E6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={16} color="#FF4D00" />
                </div>
                <span>Businesses that can help</span>
              </h3>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#777E90' }}>
              Verified businesses on Connect.in offering relevant services.
            </p>

            {(() => {
              const displayBusinesses = selectedQuestionDetail.aiRecommendations?.businesses || [];
              if (displayBusinesses.length === 0) {
                return (
                  <div style={{ fontSize: '12px', color: '#777E90', fontStyle: 'italic', padding: '8px 0' }}>
                    No recommended businesses found for this question yet.
                  </div>
                );
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {displayBusinesses.map((biz, idx) => {
                    const targetId = biz.user || biz._id || idx;
                    const isFollowing = followedUsers[targetId];
                    const logo = biz.businessLogo ? resolveImageUrl(biz.businessLogo) : null;

                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                        <div
                          onClick={() => handleUserClick(targetId)}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1, cursor: 'pointer' }}
                        >
                          {logo ? (
                            <img
                              src={logo}
                              alt={biz.businessName}
                              style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid #E8EDF3' }}
                            />
                          ) : (
                            <div style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              background: '#F0F4FA',
                              color: '#09122E',
                              fontSize: '11px',
                              fontWeight: '700',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              border: '1px solid #E8EDF3'
                            }}>
                              {(biz.businessName || 'BZ').substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#09122E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {biz.businessName}
                            </div>
                            {biz.businessCategory && (
                              <div style={{ fontSize: '11px', color: '#545A69', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {biz.businessCategory}
                              </div>
                            )}
                            {biz.city && (
                              <div style={{ fontSize: '11px', color: '#777E90', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                📍 {biz.city}
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleConnectUser(targetId)}
                          style={{
                            border: '1px solid #0066FF',
                            background: isFollowing ? '#0066FF' : '#ffffff',
                            color: isFollowing ? '#ffffff' : '#0066FF',
                            borderRadius: '8px',
                            padding: '6px 14px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                        >
                          {isFollowing ? 'Following' : 'Follow'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Card 4: Related Questions */}
          <div className="share-sidebar-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #E8EDF3', padding: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#09122E' }}>Related Questions</h3>
            </div>

            {dynamicRelatedQuestions.length === 0 ? (
              <div style={{ fontSize: '12px', color: '#777E90', fontStyle: 'italic', padding: '8px 0' }}>
                No related questions found.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {dynamicRelatedQuestions.map((item, idx) => {
                  const title = item.content || item.title || 'Untitled Question';
                  const answersCount = item.commentsCount || (item.comments ? item.comments.length : 0);
                  const viewsCount = item.views || item.viewsCount || 0;
                  const formattedViews = viewsCount >= 1000 ? `${(viewsCount / 1000).toFixed(1)}K` : viewsCount;
                  return (
                    <div
                      key={item._id || idx}
                      onClick={() => onQuestionClick(item)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justify: 'space-between',
                        gap: '12px',
                        cursor: 'pointer',
                        padding: '8px 0',
                        borderBottom: idx < dynamicRelatedQuestions.length - 1 ? '1px solid #F0F4FA' : 'none'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#0066FF',
                          lineHeight: '1.35',
                          marginBottom: '4px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {title}
                        </div>
                        <div style={{ fontSize: '11px', color: '#777E90' }}>
                          {answersCount} answers • {formattedViews} views
                        </div>
                      </div>
                      <ChevronRight size={16} color="#777E90" style={{ flexShrink: 0, marginTop: '2px' }} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default ShareSidebar;
