import React, { useEffect, useState } from 'react';
import './Public.css';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
// API abstraction functions
import { createPost, getAllPosts, getPostStatus, likePost, addComment as addCommentApi, sharePost } from '../../api';
import Leftsidebar from '../../Component/Leftsidebar/Leftsidebar';

const Public = ({ slidein, handleslidein }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  const checkAuth = () => {
    const profile = localStorage.getItem('Profile');
    if (profile) {
      try {
        const parsedProfile = JSON.parse(profile);
        if (parsedProfile && parsedProfile.token) {
          setIsAuthenticated(true);
          return true;
        }
      } catch (error) {
        console.error('Error parsing profile:', error);
        localStorage.removeItem('Profile');
      }
    }
    setIsAuthenticated(false);
    return false;
  };

  // Fetch posts (public endpoint, no auth required)
  const fetchPosts = async () => {
    try {
      setError('');
      const { data } = await getAllPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      if (error.response?.status === 401) {
        setError(t('common.authentication_required') || 'Please log in to view posts');
      } else {
        setError(t('common.error_loading_posts') || 'Error loading posts');
      }
    }
  };

  // Fetch user post status (requires authentication)
  const fetchStatus = async () => {
    if (!isAuthenticated) {
      setStatus({
        canPost: false,
        reason: t('common.login_to_post') || 'Please log in to create posts',
        friendCount: 0,
        postsToday: 0,
        limit: 0
      });
      return;
    }

    try {
      const { data } = await getPostStatus();
      setStatus(data);
    } catch (error) {
      console.error('Error fetching status:', error);
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('Profile');
        setIsAuthenticated(false);
        setStatus({
          canPost: false,
          reason: t('common.session_expired') || 'Session expired. Please log in again.',
          friendCount: 0,
          postsToday: 0,
          limit: 0
        });
      } else {
        setStatus({
          canPost: false,
          reason: t('common.error_loading_status') || 'Error loading post status',
          friendCount: 0,
          postsToday: 0,
          limit: 0
        });
      }
    }
  };

  useEffect(() => {
    const authStatus = checkAuth();
    fetchPosts();
    fetchStatus();
    // eslint-disable-next-line
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Validate file size (50MB limit)
      if (selectedFile.size > 50 * 1024 * 1024) {
        alert(t('common.file_too_large') || 'File size must be less than 50MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  // Create new post
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert(t('common.login_required') || 'Please log in to create posts');
      navigate('/Auth');
      return;
    }

    if (!content.trim() && !file) {
      alert(t('common.content_required') || 'Please add some content or select a file');
      return;
    }

    if (status && !status.canPost) {
      alert(status.reason || t('common.posting_limit_reached') || 'Posting limit reached');
      return;
    }

    setLoading(true);
    setError('');
    let mediaUrl = '';
    let mediaType = 'none';

    if (file) {
      try {
        // Convert file to base64 (simple demo approach)
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
        mediaUrl = base64;
        mediaType = file.type.startsWith('video') ? 'video' : 'image';
      } catch (error) {
        console.error('Error processing file:', error);
        alert(t('common.file_processing_error') || 'Error processing file');
        setLoading(false);
        return;
      }
    }

    try {
      await createPost({ content: content.trim(), mediaUrl, mediaType });
      setContent('');
      setFile(null);
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
      fetchPosts();
      fetchStatus();
    } catch (error) {
      console.error('Error creating post:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('Profile');
        setIsAuthenticated(false);
        alert(t('common.session_expired_login') || 'Session expired. Please log in again.');
        navigate('/Auth');
      } else {
        alert(error.response?.data?.message || t('common.failed_to_create_post') || 'Failed to create post');
      }
    } finally {
      setLoading(false);
    }
  };

  // Like post
  const toggleLike = async (id) => {
    if (!isAuthenticated) {
      alert(t('common.login_to_like') || 'Please log in to like posts');
      navigate('/Auth');
      return;
    }

    try {
      const { data } = await likePost(id);
      setPosts((prev) => prev.map((p) => (p._id === id ? data : p)));
    } catch (error) {
      console.error('Error toggling like:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('Profile');
        setIsAuthenticated(false);
        alert(t('common.session_expired_login') || 'Session expired. Please log in again.');
        navigate('/Auth');
      }
    }
  };

  // Share post
  const handleShare = async (id) => {
    if (!isAuthenticated) {
      alert(t('common.login_to_share') || 'Please log in to share posts');
      navigate('/Auth');
      return;
    }

    try {
      const { data } = await sharePost(id);
      setPosts((prev) => prev.map((p) => (p._id === id ? data : p)));
    } catch (error) {
      console.error('Error sharing post:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('Profile');
        setIsAuthenticated(false);
        alert(t('common.session_expired_login') || 'Session expired. Please log in again.');
        navigate('/Auth');
      }
    }
  };

  // Add comment
  const addComment = async (id, comment) => {
    if (!comment.trim()) return;
    
    if (!isAuthenticated) {
      alert(t('common.login_to_comment') || 'Please log in to add comments');
      navigate('/Auth');
      return;
    }

    try {
      const { data } = await addCommentApi(id, comment.trim());
      setPosts((prev) => prev.map((p) => (p._id === id ? data : p)));
    } catch (error) {
      console.error('Error adding comment:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('Profile');
        setIsAuthenticated(false);
        alert(t('common.session_expired_login') || 'Session expired. Please log in again.');
        navigate('/Auth');
      }
    }
  };

  const handleLoginRedirect = () => {
    navigate('/Auth');
  };

  const currentUserId = JSON.parse(localStorage.getItem('Profile'))?.result?._id;

  return (
    <div className="public-page">
      <Leftsidebar slidein={slidein} />
      <div className="public-container" onClick={handleslidein}>
        <h2>{t('sidebar.public') || 'Public'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        {!isAuthenticated && (
          <div className="auth-notice">
            <p>{t('common.login_notice') || 'Please log in to create posts and interact with content.'}</p>
            <button onClick={handleLoginRedirect} className="login-button">
              {t('auth.login') || 'Log In'}
            </button>
          </div>
        )}
        
        {isAuthenticated && (
          <form className="post-form" onSubmit={handleSubmit}>
            <textarea
              placeholder={t('posts.whats_on_mind') || "What's on your mind?"}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              maxLength={1000}
            />
            <div className="file-input-container">
              <input 
                type="file" 
                accept="image/*,video/*" 
                onChange={handleFileChange}
                id="file-input"
              />
              <label htmlFor="file-input" className="file-input-label">
                {file ? file.name : (t('posts.choose_file') || 'Choose Image/Video')}
              </label>
            </div>
            <button type="submit" disabled={loading} className="post-button">
              {loading ? (t('posts.posting') || 'Posting...') : (t('posts.post') || 'Post')}
            </button>
            {status && (
              <p className="post-status">
                {t('posts.friends') || 'Friends'}: {status.friendCount} | {t('posts.posts_today') || 'Posts today'}: {status.postsToday || 0}
                {status.limit && status.limit !== Infinity && ` / ${status.limit}`}
              </p>
            )}
          </form>
        )}

        <div className="posts-feed">
          {posts.length === 0 && !loading ? (
            <div className="no-posts">
              {t('posts.no_posts') || 'No posts yet. Be the first to share something!'}
            </div>
          ) : (
            posts.map((post) => (
              <div className="post-card" key={post._id}>
                <div className="post-header">
                  <strong>{post.username}</strong> •{' '}
                  {new Date(post.createdAt).toLocaleString()}
                </div>
                {post.content && <p className="post-content">{post.content}</p>}
                {post.mediaUrl && post.mediaType === 'image' && (
                  <img src={post.mediaUrl} alt="post_media" className="post-media" />
                )}
                {post.mediaUrl && post.mediaType === 'video' && (
                  <video src={post.mediaUrl} controls className="post-media" />
                )}
                <div className="post-actions">
                  <button 
                    onClick={() => toggleLike(post._id)}
                    className={post.likes.includes(currentUserId) ? 'liked' : ''}
                    disabled={!isAuthenticated}
                  >
                    {post.likes.includes(currentUserId)
                      ? (t('posts.unlike') || 'Unlike')
                      : (t('posts.like') || 'Like')}{' '}
                    ({post.likes.length})
                  </button>
                  <button 
                    onClick={() => handleShare(post._id)}
                    disabled={!isAuthenticated}
                  >
                    {t('posts.share') || 'Share'} ({post.shares.length})
                  </button>
                </div>
                
                <div className="comments-section">
                  {post.comments.map((c, idx) => (
                    <div key={idx} className="comment-item">
                      <strong>{c.username}: </strong>
                      {c.comment}
                    </div>
                  ))}
                  <CommentBox 
                    onAdd={(comment) => addComment(post._id, comment)} 
                    isAuthenticated={isAuthenticated}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Comment input component
const CommentBox = ({ onAdd, isAuthenticated }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  
  const handleAdd = () => {
    if (!isAuthenticated) {
      alert(t('common.login_to_comment') || 'Please log in to add comments');
      navigate('/Auth');
      return;
    }
    
    if (value.trim()) {
      onAdd(value);
      setValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="comment-box">
      <input
        type="text"
        placeholder={t('posts.add_comment') || 'Add a comment...'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyPress={handleKeyPress}
        maxLength={500}
        disabled={!isAuthenticated}
      />
      <button onClick={handleAdd} disabled={!value.trim() || !isAuthenticated}>
        {t('posts.add') || 'Add'}
      </button>
    </div>
  );
};

export default Public;
