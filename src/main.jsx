import { Component, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import App from './App.jsx';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red' }}>
          <h1>Something went wrong.</h1>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#fff', background: '#3f1a60', padding: 12, borderRadius: 8 }}>{this.state.error ? this.state.error.toString() : ''}</pre>
          <div style={{ marginTop: 12 }}>
            <button onClick={() => window.location.reload()} style={{ marginRight: 8, padding: '8px 12px', borderRadius: 6, background: '#fcd34d', border: 'none' }}>Reload</button>
            <button onClick={() => this.setState({ hasError: false, error: null })} style={{ padding: '8px 12px', borderRadius: 6 }}>Dismiss</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

console.log('Main.jsx running');
// Global client error reporter (sends errors to server for easier debugging)
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    try {
      fetch('/api/client-errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: e.message, filename: e.filename, lineno: e.lineno, colno: e.colno, error: (e.error && e.error.stack) ? e.error.stack : null, url: window.location.href })
      });
    } catch (err) { console.error('Failed to report client error', err); }
  });

  window.addEventListener('unhandledrejection', (evt) => {
    try {
      const reason = evt.reason ? (evt.reason.stack || evt.reason.message || String(evt.reason)) : 'unknown';
      fetch('/api/client-errors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'UnhandledRejection', reason, url: window.location.href }) });
    } catch (err) { console.error('Failed to report unhandled rejection', err); }
  });
}
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
