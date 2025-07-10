import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false); // Optional placeholder

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const postResponse = await fetch(`http://localhost:4000/api/v1/posts/${id}`);
        if (!postResponse.ok) {
          throw new Error(`HTTP error! status: ${postResponse.status}`);
        }
        const postData = await postResponse.json();
        setPost(postData.post); // ✅ updated
        setComments(postData.post.comments); // ✅ get from populated field
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:4000/api/v1/comments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post: id, user: "Anonymous", body: newComment }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setComments([...comments, data.post.comments[data.post.comments.length - 1]]);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError(error);
    }
  };

  const handleLikeToggle = async () => {
    try {
      const endpoint = isLiked ? 'unlike' : 'like';
      const response = await fetch(`http://localhost:4000/api/v1/likes/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post: id, user: "Anonymous" }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPost(data.post);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
      setError(error);
    }
  };

  if (loading) return <div className="container mt-4">Loading post...</div>;
  if (error) return <div className="container mt-4">Error: {error.message}</div>;
  if (!post) return <div className="container mt-4">Post not found.</div>;

  return (
    <div className="container mt-4">
      <h1>{post.title}</h1>
      <p>{post.body}</p>
      <button className="btn btn-outline-primary" onClick={handleLikeToggle}>
        {isLiked ? 'Unlike' : 'Like'} ({post.likes?.length || 0})
      </button>

      <h3 className="mt-4">Comments</h3>
      {comments.length === 0 ? (
        <p>No comments yet. Be the first to comment!</p>
      ) : (
        <ul className="list-group">
          {comments.map((comment) => (
            <li key={comment._id} className="list-group-item">
              {comment.body}
            </li>
          ))}
        </ul>
      )}

      <h4 className="mt-4">Add a Comment</h4>
      <form onSubmit={handleCommentSubmit}>
        <div className="mb-3">
          <textarea
            className="form-control"
            rows="3"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment here..."
            required
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary">Submit Comment</button>
      </form>
    </div>
  );
};

export default PostDetail;
