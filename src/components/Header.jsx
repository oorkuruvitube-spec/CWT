import React from 'react';

export default function Header({ 
  employees, 
  currentUser, 
  onUserChange, 
  activeTab = 'home', 
  onTabChange,
  isLoggedIn = false,
  onLoginClick,
  onLogout
}) {
  const activeUser = employees.find(e => e.id === currentUser) || employees[0];

  const handleNavClick = (tabId) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="cs-nav-header">
      <div className="cs-nav-container">
        <div className={`cs-nav-pill ${isLoggedIn ? 'logged-in' : 'logged-out'}`}>
          
          {/* Logo */}
          <div className="cs-brand-wrapper" onClick={() => handleNavClick('home')}>
            <img 
              src="/cwt-logo.png" 
              alt="Creative Web Technology" 
              className="cs-logo-img" 
            />
          </div>

          {/* Navigation Links */}
          <nav className="cs-nav-menu">
            <ul className="cs-nav-links">
              <li>
                <button 
                  className={`cs-nav-link ${activeTab === 'home' ? 'active' : ''}`}
                  id="nav-home" 
                  onClick={() => handleNavClick('home')}
                >
                  Home
                </button>
              </li>

              {/* Internal Protected Pages: Only visible after employee login */}
              {isLoggedIn && (
                <>
                  <li>
                    <button 
                      className={`cs-nav-link ${activeTab === 'tasks' ? 'active' : ''}`}
                      id="nav-tasks" 
                      onClick={() => handleNavClick('tasks')}
                    >
                      Work & Tasks
                    </button>
                  </li>
                  <li>
                    <button 
                      className={`cs-nav-link ${activeTab === 'leaves' ? 'active' : ''}`}
                      id="nav-leaves" 
                      onClick={() => handleNavClick('leaves')}
                    >
                      Leave & Performance
                    </button>
                  </li>
                  {/* CEO Exclusive Navigation: Only visible when logged in as Kolitha De Silva */}
                  {(activeUser.id === 'emp_ceo' || activeUser.email === 'kolitha@gmail.com' || activeUser.level === 1) && (
                    <li>
                      <button 
                        className={`cs-nav-link ceo-nav-pill-btn ${activeTab === 'users' ? 'active' : ''}`}
                        id="nav-users" 
                        onClick={() => handleNavClick('users')}
                        title="User & Position Governance (CEO Authority Only)"
                      >
                        <span className="nav-ceo-badge">CEO</span>
                        <span>User Management</span>
                      </button>
                    </li>
                  )}
                </>
              )}
            </ul>
          </nav>

          {/* Right Side Controls */}
          <div className="cs-nav-right">
            {!isLoggedIn ? (
              /* Public View: Employee Login Icon Button */
              <button 
                className="cs-employee-login-btn"
                id="btn-employee-login"
                onClick={onLoginClick}
                title="Employee Portal Login"
              >
                <svg className="login-btn-icon-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span className="login-btn-text">Employee Login</span>
              </button>
            ) : (
              /* Authenticated View: Only Employee Name and Avatar (No position/role) */
              <div className="cs-logged-user-wrap">
                <div className="cs-user-pill-clean">
                  <img 
                    id="nav-user-avatar" 
                    className="cs-role-avatar" 
                    src={activeUser.avatar} 
                    alt={activeUser.name} 
                  />
                  {/* Mention ONLY the name of the employee as requested */}
                  <span className="cs-user-name-only" id="nav-user-name">
                    {activeUser.name}
                  </span>
                </div>

                {/* Sign Out Button: Natural height with crisp SVG symbol and small lowercase text */}
                <button 
                  className="cs-logout-btn"
                  onClick={onLogout}
                  title="Sign out of Employee Portal"
                  aria-label="Sign out"
                >
                  <svg 
                    className="logout-symbol-svg" 
                    width="15" 
                    height="15" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span className="logout-small-text">exit</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
