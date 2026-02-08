import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Messenger from './pages/Messenger';
import ChannelCreatePage from './pages/ChannelCreatePage';
import GroupCreatePage from './pages/GroupCreatePage';
import UserAgreement from './pages/UserAgreement';
import { CallProvider } from './context/CallContext';

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
            <Landing />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route path="/user-agreement" element={<UserAgreement />} />
      <Route path="/messenger" element={<PrivateRoute><CallProvider><div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}><Outlet /></div></CallProvider></PrivateRoute>}>
        <Route index element={<Messenger />} />
        <Route path="new-channel" element={<ChannelCreatePage />} />
        <Route path="new-group" element={<GroupCreatePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
