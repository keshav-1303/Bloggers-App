import React, { useEffect, useState } from 'react';
import './Home.css'; // Make sure this path is correct

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    fetchPosts();
    document.body.style.overflow = selectedPost ? 'hidden' : 'auto';
  }, [selectedPost]);

  const fetchPosts = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/v1/posts');
      const data = await res.json();
      setPosts(data.posts);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    }
  };

  const openModal = (post) => {
    setSelectedPost(post);
    setIsLiked(false);
  };

  const closeModal = () => {
    setSelectedPost(null);
    setComment('');
  };

  const handleLike = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/v1/likes/${isLiked ? 'unlike' : 'like'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post: selectedPost._id, user: 'Anonymous' }),
      });
      const data = await res.json();
      setSelectedPost(data.post);
      setIsLiked(!isLiked);
      fetchPosts();
    } catch (err) {
      console.error('Like/unlike failed', err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:4000/api/v1/comments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post: selectedPost._id, user: 'Anonymous', body: comment }),
      });
      const data = await res.json();
      setSelectedPost(data.post);
      setComment('');
      fetchPosts();
    } catch (err) {
      console.error('Failed to comment', err);
    }
  };

  return (
    <div className="home-container">
      <h1 className="home-title">📘 Blog Posts</h1>

      <div className="post-grid">
        {posts.map((post) => (
          <div
            key={post._id}
            onClick={() => openModal(post)}
            className="post-card"
          >
            <h3 className="post-title">{post.title}</h3>
            <p className="post-body">{post.body.slice(0, 80)}...</p>
          </div>
        ))}
      </div>

      {selectedPost && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={closeModal}>&times;</button>

            <h2 className="modal-title">{selectedPost.title}</h2>
            <p className="modal-body">{selectedPost.body}</p>

            <button className={`like-button ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
              {isLiked ? 'Unlike' : 'Like'} ({selectedPost.likes?.length || 0})
            </button>

            <div className="comments-section">
              <h4>💬 Comments</h4>
              <div className="comment-list">
                {selectedPost.comments?.map((c) => (
                  <div key={c._id} className="comment-item">{c.body}</div>
                ))}
              </div>
            </div>

            <form onSubmit={handleComment} className="comment-form">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                required
              />
              <button type="submit">Submit Comment</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
