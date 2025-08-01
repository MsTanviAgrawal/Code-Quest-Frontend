import React, { useEffect, useState } from 'react';
import './Public.css';
// API abstraction functions
import { createPost, getAllPosts, getPostStatus, likePost, addComment as addCommentApi, sharePost } from '../../api';
import Leftsidebar from '../../Component/Leftsidebar/Leftsidebar';

// Base API instance




const Public = ({ slidein, handleslidein }) => {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch posts
  const fetchPosts = async () => {
    try {
      const { data } = await getAllPosts();
      setPosts(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch user post status (limits)
  const fetchStatus = async () => {
    try {
      const { data } = await getPostStatus();
      setStatus(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchStatus();
    // eslint-disable-next-line
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Create new post
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content && !file) return;

    if (status && !status.canPost) {
      alert(status.reason || 'Posting limit reached');
      return;
    }

    setLoading(true);
    let mediaUrl = '';
    let mediaType = 'none';

    if (file) {
      // Convert file to base64 (simple demo approach)
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
      mediaUrl = base64;
      mediaType = file.type.startsWith('video') ? 'video' : 'image';
    }

    try {
      await createPost({ content, mediaUrl, mediaType });
      setContent('');
      setFile(null);
      fetchPosts();
      fetchStatus();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  // Like post
  const toggleLike = async (id) => {
    try {
      const { data } = await likePost(id);
      setPosts((prev) => prev.map((p) => (p._id === id ? data : p)));
    } catch (error) {
      console.error(error);
    }
  };

  // Share post
  const handleShare = async (id) => {
    try {
      const { data } = await sharePost(id);
      setPosts((prev) => prev.map((p) => (p._id === id ? data : p)));
    } catch (error) {
      console.error(error);
    }
  };

  // Add comment
  const addComment = async (id, comment) => {
    if (!comment) return;
    try {
      const { data } = await addCommentApi(id, comment);
      setPosts((prev) => prev.map((p) => (p._id === id ? data : p)));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="public-page">
      <Leftsidebar slidein={slidein} />
      <div className="public-container" onClick={handleslidein}>
        <h2>Public</h2>
        {/* Post Form */}
        <form className="post-form" onSubmit={handleSubmit}>
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
          <input type="file" accept="image/*,video/*" onChange={handleFileChange} />
          <button type="submit" disabled={loading}>
            {loading ? 'Posting...' : 'Post'}
          </button>
          {status && (
            <p className="post-status">
              Friends: {status.friendCount} | Posts today: {status.postsToday || 0}
              {status.limit && status.limit !== Infinity && ` / ${status.limit}`}
            </p>
          )}
        </form>

        {/* Posts Feed */}
        <div className="posts-feed">
          {posts.map((post) => (
            <div className="post-card" key={post._id}>
              <div className="post-header">
                <strong>{post.username}</strong> •{' '}
                {new Date(post.createdAt).toLocaleString()}
              </div>
              <p className="post-content">{post.content}</p>
              {post.mediaUrl && post.mediaType === 'image' && (
                <img src={post.mediaUrl} alt="post_media" className="post-media" />
              )}
              {post.mediaUrl && post.mediaType === 'video' && (
                <video src={post.mediaUrl} controls className="post-media" />
              )}
              <div className="post-actions">
                <button onClick={() => toggleLike(post._id)}>
                  {post.likes.includes(JSON.parse(localStorage.getItem('Profile'))?.result?._id)
                    ? 'Unlike'
                    : 'Like'}{' '}
                  ({post.likes.length})
                </button>
                <button onClick={() => handleShare(post._id)}>Share ({post.shares.length})</button>
              </div>
              {/* Comments */}
              <div className="comments-section">
                {post.comments.map((c, idx) => (
                  <div key={idx} className="comment-item">
                    <strong>{c.username}: </strong>
                    {c.comment}
                  </div>
                ))}
                <CommentBox onAdd={(comment) => addComment(post._id, comment)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Comment input component
const CommentBox = ({ onAdd }) => {
  const [value, setValue] = useState('');
  const handleAdd = () => {
    onAdd(value);
    setValue('');
  };
  return (
    <div className="comment-box">
      <input
        type="text"
        placeholder="Add a comment..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button onClick={handleAdd}>Add</button>
    </div>
  );
};

export default Public;
