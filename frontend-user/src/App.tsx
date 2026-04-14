import React from 'react';

/**
 * ITSM Service Portal - User Experience
 * Concept: Lite / Clean / Intuitive
 */
const App: React.FC = () => {
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
              <div className="avatar">JD</div>
              <span className="username">John Doe</span>
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
          gap: 12px;
        }
        .avatar {
          width: 36px;
          height: 36px;
          background: #e0f2fe;
          color: var(--color-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
        }
        .username {
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-main);
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

export default App;
