import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const PostsPage = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/posts');
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

  const handleDelete = async (id) => { // new function to handle post deletion
    try {
      await axios.delete(`http://127.0.0.1:5000/posts/${id}`);
      setPosts(posts.filter((post) => post.id !== id)); // remove the deleted post from the state
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <div>
      <h1>All Posts</h1>
      <Link to="/create-post">
        <button>Create Post</button>
      </Link>
      {posts.map((post) => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <Link to={`/view-post/${post.id}`}>
            <button>View</button>
          </Link>
          <Link to={`/edit-post/${post.id}`}>
            <button>Edit</button>
          </Link>
          <button onClick={() => handleDelete(post.id)}>Delete</button>

        </div>
      ))}
    </div>
  );
};

export default PostsPage;