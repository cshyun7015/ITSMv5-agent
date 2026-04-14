import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../../../api/client';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [tenantId, setTenantId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/login', {
        tenantId,
        username,
        password,
      });

      const { accessToken, ...user } = response.data;
      login(accessToken, user);
    } catch (err: any) {
      setError('Invalid ID, password or Tenant ID');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1 className="logo">ITSM<span>Portal</span></h1>
          <p>Login to your Service Center</p>
        </div>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Tenant ID</label>
            <input 
              type="text" 
              value={tenantId} 
              onChange={(e) => setTenantId(e.target.value)}
              placeholder="e.g. CN_TENANT_01"
              required
            />
          </div>

          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your@email.com"
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

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <a href="#">Contract administrator</a></p>
        </div>
      </div>

      <style>{`
        .login-page {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8fafc;
        }
        .login-card {
          width: 100%;
          max-width: 440px;
          padding: 48px;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04), 0 2px 10px rgba(0, 0, 0, 0.02);
          border: 1px solid #e2e8f0;
        }
        .login-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .logo {
          font-size: 28px;
          font-weight: 700;
          color: #3b82f6;
          margin-bottom: 8px;
        }
        .logo span {
          color: #1e293b;
        }
        .login-header p {
          color: #64748b;
          font-size: 15px;
        }
        .form-group {
          margin-bottom: 24px;
        }
        .form-group label {
          display: block;
          color: #475569;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 10px;
        }
        .form-group input {
          width: 100%;
          padding: 14px 18px;
          background: #fbfcfd;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          color: #1e293b;
          font-size: 15px;
          transition: all 0.2s;
        }
        .form-group input:focus {
          border-color: #3b82f6;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
          outline: none;
        }
        .error-message {
          color: #ef4444;
          font-size: 14px;
          margin-bottom: 24px;
          text-align: center;
          background: #fef2f2;
          padding: 10px;
          border-radius: 8px;
        }
        .btn-primary {
          width: 100%;
          padding: 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: var(--transition);
          box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);
        }
        .btn-primary:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }
        .login-footer {
          margin-top: 32px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }
        .login-footer a {
          color: #3b82f6;
          font-weight: 500;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
