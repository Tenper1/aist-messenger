import { Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Profile from './pages/Profile';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Register />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;