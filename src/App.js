import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AddUserForm from './AddUserForm';
import PostsPage from './PostsPage';
import CreatePostPage from './CreatePostPage';
import EditPostPage from './EditPostPage';
import ViewPostPage from './ViewPostPage';
import Reports from './Reports';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" exact element={<AddUserForm />} />
        <Route path="/posts" element={<PostsPage />} />
        <Route path="/create-post" element={<CreatePostPage />} />
        <Route path="/edit-post/:id" element={<EditPostPage />} /> 
        <Route path="/view-post/:id" element={<ViewPostPage />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Router>
  );
}

export default App;
