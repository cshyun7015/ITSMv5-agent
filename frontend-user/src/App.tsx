import React from 'react';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';
import LoginPage from './features/auth/components/LoginPage';

/**
 * ITSM Service Portal - User Experience
 * Concept: Lite / Clean / Intuitive
 */
const ServicePortal: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="portal">
      <header className="portal-header">
        <div className="portal-container">
          <div className="header-content">
            <h1 className="logo">ITSM<span>Portal</span></h1>
            <nav className="nav">
              <button className="nav-item active">My Requests</button>
              <button className="nav-item">Service Catalog</button>
              <button className="nav-item">Knowledge</button>
            </nav>
            <div className="user-profile">
              <div className="user-info">
                <span className="tenant-tag">{user?.tenantId}</span>
                <span className="username">{user?.username}</span>
              </div>
              <button className="logout-btn-clean" onClick={logout}>Sign Out</button>
            </div>
          </div>
        </div>
      </header>

      <main className="portal-main portal-container">
        <div className="dashboard-header">
          <h2>My Requests</h2>
          <p className="subtitle">Track the status of your active service tickets</p>
        </div>

        <section className="request-overview">
          <div className="empty-state">
            <div className="icon">📝</div>
            <h3>No Active Requests</h3>
            <p>You haven't submitted any service requests yet.</p>
            <button className="btn-primary">Create New Request</button>
          </div>
        </section>
      </main>

      <style>{`
        .portal-header {
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
          padding: 16px 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .logo {
          font-size: 20px;
          font-weight: 600;
          color: var(--color-primary);
        }
        .logo span {
          color: var(--color-text-main);
        }
        .nav {
          display: flex;
          gap: 32px;
        }
        .nav-item {
          background: none;
          color: var(--color-text-dim);
          font-weight: 500;
          padding: 8px 0;
          position: relative;
        }
        .nav-item.active {
          color: var(--color-primary);
        }
        .nav-item.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--color-primary);
          border-radius: 2px;
        }
        .user-profile {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }
        .tenant-tag {
          font-size: 10px;
          font-weight: 700;
          color: var(--color-primary);
          background: #eff6ff;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .username {
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-main);
        }
        .logout-btn-clean {
          background: #f1f5f9;
          color: var(--color-text-dim);
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
        }
        .logout-btn-clean:hover {
          background: #fee2e2;
          color: #ef4444;
        }

        .portal-main {
          margin-top: 48px;
        }
        .dashboard-header {
          margin-bottom: 32px;
        }
        .dashboard-header h2 {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .dashboard-header .subtitle {
          color: var(--color-text-dim);
        }

        .empty-state {
          background: var(--color-surface);
          border: 2px dashed var(--color-border);
          border-radius: var(--radius-lg);
          padding: 80px 40px;
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
        }
        .empty-state .icon {
          font-size: 48px;
          margin-bottom: 24px;
        }
        .empty-state h3 {
          font-size: 20px;
          margin-bottom: 12px;
        }
        .empty-state p {
          color: var(--color-text-dim);
          margin-bottom: 32px;
        }
        .btn-primary {
          background: var(--color-primary);
          color: #fff;
          padding: 12px 24px;
          border-radius: var(--radius-md);
          font-weight: 600;
          box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
        }
        .btn-primary:hover {
          background: var(--color-primary-hover);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

const AuthWrapper: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <ServicePortal /> : <LoginPage />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  );
};

export default App;
