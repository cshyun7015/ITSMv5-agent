import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../../../api/client';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tenantId, setTenantId] = useState('ocomp1'); // 기본값으로 ocomp1 설정
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const performLogin = async (tId: string, uName: string, pWord: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/auth/login', {
        tenantId: tId,
        username: uName,
        password: pWord,
      });

      const { accessToken, ...user } = response.data;
      login(accessToken, user);
    } catch (err: any) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(tenantId, username, password);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>MSP Admin</h1>
          <p>Command Center Access</p>
        </div>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Tenant ID</label>
            <input 
              type="text" 
              value={tenantId} 
              onChange={(e) => setTenantId(e.target.value)}
              placeholder="Enter tenant ID (e.g. ocomp1)"
              required
            />
          </div>

          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter administrator ID"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="dev-login-assistance">
          <p>Debug Access</p>
          <div className="dev-buttons">
            <button 
              className="dev-btn admin" 
              onClick={() => performLogin('OPER_MSP', 'msp', 'pwd')}
              disabled={loading}
            >
              Login as ADMIN
            </button>
            <button 
              className="dev-btn oper" 
              onClick={() => performLogin('ocomp1', 'oper1', 'pwd')}
              disabled={loading}
            >
              Login as OPERATOR
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
        }
        .login-card {
          width: 100%;
          max-width: 400px;
          padding: 48px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .login-header h1 {
          font-size: 28px;
          color: #fff;
          margin-bottom: 8px;
        }
        .login-header p {
          color: #94a3b8;
          font-size: 14px;
        }
        .form-group {
          margin-bottom: 24px;
        }
        .form-group label {
          display: block;
          color: #e2e8f0;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .form-group input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #fff;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-group input:focus {
          border-color: #3b82f6;
        }
        .error-message {
          color: #ef4444;
          font-size: 13px;
          margin-bottom: 24px;
          text-align: center;
        }
        .login-btn {
          width: 100%;
          padding: 14px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          margin-bottom: 24px;
        }
        .login-btn:hover {
          background: #2563eb;
        }
        .login-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .dev-login-assistance {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 24px;
          text-align: center;
        }
        .dev-login-assistance p {
          color: #64748b;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
          margin-bottom: 16px;
        }
        .dev-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .dev-btn {
          padding: 10px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(255, 255, 255, 0.02);
          color: #94a3b8;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .dev-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          border-color: rgba(255, 255, 255, 0.1);
        }
        .dev-btn.admin:hover {
          border-color: rgba(59, 130, 246, 0.3);
          color: #60a5fa;
        }
        .dev-btn.oper:hover {
          border-color: rgba(16, 185, 129, 0.3);
          color: #34d399;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
