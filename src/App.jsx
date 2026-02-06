import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Register from './pages/Register';
import Messenger from './pages/Messenger';

function PrivateRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('aist_token');
    setIsAuthenticated(!!token);
  }, []);

  if (isAuthenticated === null) {
    return <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      color: 'rgba(255,255,255,.9)'
    }}>Загрузка...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
}

function PublicRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('aist_token');
    setIsAuthenticated(!!token);
  }, []);

  if (isAuthenticated === null) {
    return <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      color: 'rgba(255,255,255,.9)'
    }}>Загрузка...</div>;
  }

  return !isAuthenticated ? children : <Navigate to="/messenger" replace />;
}

function App() {
  useEffect(() => {
    // Убираем стандартные стили браузера
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
  }, []);

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />
      <Route 
        path="/messenger" 
        element={
          <PrivateRoute>
            <Messenger />
          </PrivateRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
