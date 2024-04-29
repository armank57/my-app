import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AddUserForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [responseData, setResponseData] = useState(null);


  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://127.0.0.1:5000/users', { username, email });
      console.log(response.data);
      setResponseData(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
      <div>
          <form onSubmit={handleSubmit}>
              <label>
                  Username:
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
              </label>
              <label>
                  Email:
                  <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
              <button type="submit">Add User</button>
          </form>
          <Link to="/posts">View Posts</Link>
          <Link to="/reports">View Reports</Link>
          {responseData && <div><h3>Response:</h3><pre>{JSON.stringify(responseData, null, 2)}</pre></div>}
      </div>
  );
};

export default AddUserForm;