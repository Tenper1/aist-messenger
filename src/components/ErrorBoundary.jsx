import React from 'react';

export default class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            background: '#f5f5f7',
            color: '#1d1d1f',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
            Не удалось загрузить приложение
          </h1>
          <p style={{ fontSize: 15, color: '#6e6e73', marginBottom: 24, maxWidth: 320 }}>
            Проверьте интернет и попробуйте обновить страницу.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              borderRadius: 12,
              border: 'none',
              background: '#0071e3',
              color: '#fff',
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Обновить
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
