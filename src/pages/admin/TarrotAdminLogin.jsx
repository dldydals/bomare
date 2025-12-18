import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TarrotAdminLogin.css';

export default function TarrotAdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();
  const isRarrot = location.pathname.startsWith('/rarrot');

  useEffect(() => {
    document.title = '행운의 별 관리자';
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Login failed');
      localStorage.setItem('admin_token', data.token);
      navigate(isRarrot ? '/rarrot/tarrot-admin' : '/tarrot-admin');
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="admin-login-page">
      <div className="login-card">
        <div className="brand">
          <div className="logo">🔮</div>
          <h1>Tarrot Admin</h1>
          <p className="subtitle">관리자 대시보드에 접근하려면 로그인하세요.</p>
        </div>

        <form onSubmit={submit} className="login-form">
          <label>
            <span className="label">Email</span>
            <input autoFocus autoComplete="username" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>

          <label>
            <span className="label">Password</span>
            <div className="password-row">
              <input autoComplete="current-password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" className="toggle" onClick={() => setShowPassword(s => !s)} aria-label="Toggle password">{showPassword ? '숨기기' : '보기'}</button>
            </div>
          </label>

          {error && <div className="error">{error}</div>}

          <button className="btn primary full" type="submit">Login</button>
        </form>

        <div className="hint">기본 계정: <strong>admin@example.com</strong> / <strong>adminpass</strong> (visit {location.pathname.startsWith('/rarrot') ? '/rarrot/tarrot-admin' : '/tarrot-admin'})</div>
      </div>
    </div>
  );
}
