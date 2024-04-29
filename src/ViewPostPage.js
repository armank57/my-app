import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ViewPostPage = () => {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [userid, setUserid] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/posts/${id}`);
        console.log(response.data);
        setPost(response.data);
      } catch (error) {
        console.error('Error fetching post:', error);
      }
      try {
        const response = await axios.get(`http://127.0.0.1:5000/posts/${id}/comments`);
        setComments(response.data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchPost();
  }, [id]);


  const createComment = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/comments', {
        content: newComment,
        user_id: userid, 
        post_id: id,
      });
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (error) {
      alert('Error creating comment: Post not found');
      navigate('/posts');
    }
  };

  const upvotePost = async () => {
    try {
      await axios.post(`http://127.0.0.1:5000/posts/${id}/upvote`);
      setPost({ ...post, upvotes: post.upvotes + 1 });
    } catch (error) {
      console.error('Error upvoting post:', error);
    }
  }

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <p>Upvotes: {post.upvotes}</p>
      <button onClick={upvotePost}>Upvote</button>
      <input
        type="text"
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="New comment"
      />
      <input 
        type="text" 
        value={userid} 
        onChange={(e) => setUserid(e.target.value)} 
        placeholder="User ID" 
      />
      <button onClick={createComment}>Submit</button>
      {comments.map((comment) => (
        <div key={comment.id}>
          <p>{comment.content}</p>
        </div>
      ))}
    </div>
    
  );
};

export default ViewPostPage;