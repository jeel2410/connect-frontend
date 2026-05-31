import React, { useState, useEffect } from 'react';
import Header from '../component/Header';
import Footer from '../component/Footer';
import CreatePost from '../component/CreatePost';
import PostCard from '../component/PostCard';
import API_BASE_URL from '../utils/config';
import { getCookie } from '../utils/auth';
import '../styles/style.css';

const Share = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = getCookie('authToken');
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setPosts(data.data);
      } else {
        setError(data.message || 'Failed to fetch posts');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handleReact = (postId, updatedReactions) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId ? { ...post, reactions: updatedReactions } : post
      )
    );
  };

  return (
    <>
      <Header />
      <div className="dating-profile-wrapper">
        <div className="share-page-wrapper">
          <div className="title-div">
            <h1 className="inner-page-title"><span>Shared</span><span className="title-highlight">Feed</span></h1>
          </div>
          <div className="share-page-card">
            <CreatePost onPostCreated={handlePostCreated} />

            <div className="posts-feed">
              {loading ? (
                <div className="posts-loading">
                  <div className="spinner"></div>
                  <span>Loading posts...</span>
                </div>
              ) : error ? (
                <div className="posts-error">{error}</div>
              ) : posts.length === 0 ? (
                <div className="no-posts">
                  <p>No posts to show. Start by sharing something!</p>
                </div>
              ) : (
                <div className="posts-list">
                  {posts.map((post) => (
                    <PostCard key={post._id} post={post} onReact={handleReact} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Share;
