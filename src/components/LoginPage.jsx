import React, { useState } from 'react';
import { loginEmployee } from '../api';

export default function LoginPage({ employees = [], onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage("Please enter your corporate email or employee ID.");
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const result = await loginEmployee(email, password, employees);
      setLoading(false);
      onLoginSuccess(result.employee);
    } catch (err) {
      setLoading(false);
      setErrorMessage(err.message || "Authentication failed. Please verify credentials.");
    }
  };

  return (
    <div className="cwt-login-viewport">
      {/* Background Ambient Glows */}
      <div className="login-ambient-glow glow-top"></div>
      <div className="login-ambient-glow glow-bottom"></div>

      <div className="login-container">
        {/* Main Login Card */}
        <div className="cwt-login-card">
          <div className="login-card-header">
            <div className="login-portal-badge">
              <span className="cs-badge-item">
                <span className="cs-badge-dot-wrap">
                  <span className="cs-badge-dot"></span>
                </span>
                <span>Together Across the World</span>
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="login-error-banner">
              <svg className="error-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field-group">
              <label className="login-label" htmlFor="login-email">Email</label>
              <div className="login-input-wrap">
                <svg className="login-input-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input 
                  id="login-email"
                  type="text" 
                  className="login-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="login-field-group">
              <label className="login-label" htmlFor="login-password">Password</label>
              <div className="login-input-wrap">
                <svg className="login-input-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input 
                  id="login-password"
                  type={showPassword ? "text" : "password"} 
                  className="login-input password-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-login-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-loading-text">
                  <svg className="spinner-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12"></circle>
                  </svg>
                  Authenticating with CWT Directory...
                </span>
              ) : (
                <span>Sign In to Workspace →</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
