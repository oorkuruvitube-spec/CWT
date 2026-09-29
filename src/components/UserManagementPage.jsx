import React, { useState, useEffect } from 'react';
import { 
  fetchDepartmentsFromBackend, 
  saveDepartmentToBackend, 
  fetchTiersFromBackend, 
  saveTierToBackend 
} from '../api';

const DEFAULT_DEPARTMENTS = [
  "Web Technologies & Data",
  "Cloud & Data Engineering",
  "Creative Studio & Frontend",
  "Quality Engineering",
  "Executive Leadership",
  "Enterprise AI & Research",
  "Cybersecurity & Governance"
];

const DEFAULT_TIERS = [
  { level: 1, name: "Executive / C-Suite" },
  { level: 2, name: "Lead Architect / Tech Lead" },
  { level: 3, name: "Senior Engineer" },
  { level: 4, name: "Specialist Engineer" },
  { level: 4, name: "Associate Engineer" }
];

const PRESET_AVATARS = [
  { label: "Male Executive", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" },
  { label: "Female Architect", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" },
  { label: "Lead Engineer", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" },
  { label: "Senior Specialist", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" },
  { label: "Female Lead", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
  { label: "DevOps Engineer", url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80" }
];

const DEPARTMENTS_STORAGE_KEY = 'CWT_DEPARTMENTS_v2';
const TIERS_STORAGE_KEY = 'CWT_HIERARCHY_TIERS_v2';

export default function UserManagementPage({ 
  employees, 
  currentUser, 
  onCreateEmployee,
  onNavigateToTasks
}) {
  const activeUser = employees.find(e => e.id === currentUser) || employees[0];
  const isCeo = activeUser.id === 'emp_ceo' || activeUser.email === 'kolitha@gmail.com' || activeUser.level === 1;

  // View Tab: 'directory' | 'add_user'
  const [activeMgmtTab, setActiveMgmtTab] = useState('directory');

  // Dynamic Departments State (from localStorage & backend database)
  const [departments, setDepartments] = useState(() => {
    try {
      const saved = localStorage.getItem(DEPARTMENTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return Array.from(new Set([...DEFAULT_DEPARTMENTS, ...parsed]));
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_DEPARTMENTS;
  });

  // Dynamic Hierarchy Tiers State (from localStorage & backend database)
  const [hierarchyTiers, setHierarchyTiers] = useState(() => {
    try {
      const saved = localStorage.getItem(TIERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map();
          [...DEFAULT_TIERS, ...parsed].forEach(t => {
            const key = `${t.level}__${(t.name || '').trim().toLowerCase()}`;
            if (!map.has(key)) map.set(key, { level: t.level, name: (t.name || '').trim() });
          });
          return Array.from(map.values());
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_TIERS;
  });

  // Fetch departments & tiers from backend on mount to synchronize with database
  useEffect(() => {
    fetchDepartmentsFromBackend().then(backendDepts => {
      if (Array.isArray(backendDepts) && backendDepts.length > 0) {
        setDepartments(prev => {
          const merged = Array.from(new Set([...prev, ...backendDepts]));
          localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(merged));
          return merged;
        });
      }
    }).catch(() => {});

    fetchTiersFromBackend().then(backendTiers => {
      if (Array.isArray(backendTiers) && backendTiers.length > 0) {
        setHierarchyTiers(prev => {
          const map = new Map();
          [...prev, ...backendTiers].forEach(t => {
            const key = `${t.level}__${(t.name || '').trim().toLowerCase()}`;
            if (!map.has(key)) map.set(key, { level: t.level, name: (t.name || '').trim() });
          });
          const merged = Array.from(map.values());
          localStorage.setItem(TIERS_STORAGE_KEY, JSON.stringify(merged));
          return merged;
        });
      }
    }).catch(() => {});
  }, []);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('1234');
  const [role, setRole] = useState('');

  // Hierarchy Selection & Custom Mode
  const [selectedTierKey, setSelectedTierKey] = useState('3|Senior Engineer');
  const [level, setLevel] = useState(3);
  const [isCustomTier, setIsCustomTier] = useState(false);
  const [customTierLevel, setCustomTierLevel] = useState(4);
  const [customTierName, setCustomTierName] = useState('');

  // Department Selection & Custom Mode
  const [department, setDepartment] = useState('Web Technologies & Data');
  const [isCustomDept, setIsCustomDept] = useState(false);
  const [customDept, setCustomDept] = useState('');

  const [avatar, setAvatar] = useState(PRESET_AVATARS[0].url);
  const [canAssign, setCanAssign] = useState(true);
  
  // UI State
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');

  // Hierarchy Dropdown Handler
  const handleTierSelect = (val) => {
    if (val === '__custom__') {
      setIsCustomTier(true);
      setCustomTierName('');
    } else {
      setIsCustomTier(false);
      setSelectedTierKey(val);
      const [lvlStr] = val.split('|');
      const lvlNum = parseInt(lvlStr, 10);
      setLevel(lvlNum);
      setCanAssign(lvlNum <= 3);
    }
  };

  // Custom Tier Level Handler
  const handleCustomTierLevelChange = (lvlNum) => {
    setCustomTierLevel(lvlNum);
    setCanAssign(lvlNum <= 3);
  };

  // Department Dropdown Handler
  const handleDeptSelect = (val) => {
    if (val === '__custom__') {
      setIsCustomDept(true);
      setCustomDept('');
    } else {
      setIsCustomDept(false);
      setDepartment(val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !role.trim()) {
      alert("Please enter full name, corporate email, and position.");
      return;
    }

    // Resolve Final Department
    const finalDept = isCustomDept ? customDept.trim() : department.trim();
    if (!finalDept) {
      alert("Please specify or select a department.");
      return;
    }

    // Resolve Final Tier Level and Tier Name
    let finalLevel = level;
    let finalTierName = "Specialist Engineer";

    if (isCustomTier) {
      if (!customTierName.trim()) {
        alert("Please enter a custom hierarchy tier name.");
        return;
      }
      finalLevel = parseInt(customTierLevel, 10);
      finalTierName = customTierName.trim();
    } else {
      const [lvlStr, nameStr] = selectedTierKey.split('|');
      finalLevel = parseInt(lvlStr, 10);
      finalTierName = nameStr || "Specialist Engineer";
    }

    setSubmitting(true);
    setSuccessMessage('');

    // 1. If custom department was typed, persist to state, localStorage & backend
    if (!departments.some(d => d.toLowerCase() === finalDept.toLowerCase())) {
      const updatedDepts = [...departments, finalDept];
      setDepartments(updatedDepts);
      localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(updatedDepts));
      saveDepartmentToBackend(finalDept).catch(() => {});
    }

    // 2. If custom hierarchy tier was typed, persist to state, localStorage & backend
    const tierExists = hierarchyTiers.some(
      t => t.level === finalLevel && t.name.toLowerCase() === finalTierName.toLowerCase()
    );
    if (!tierExists) {
      const updatedTiers = [...hierarchyTiers, { level: finalLevel, name: finalTierName }];
      setHierarchyTiers(updatedTiers);
      localStorage.setItem(TIERS_STORAGE_KEY, JSON.stringify(updatedTiers));
      saveTierToBackend(finalLevel, finalTierName).catch(() => {});
    }

    const newEmployee = {
      id: `emp_${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim() || '1234',
      role: role.trim(),
      level: finalLevel,
      levelName: finalTierName,
      department: finalDept,
      avatar: avatar,
      canAssign: canAssign,
      bio: `${role.trim()} at Creative Web Technology.`
    };

    try {
      if (onCreateEmployee) {
        await onCreateEmployee(newEmployee);
      }
      setSuccessMessage(`Account created for ${newEmployee.name} (${newEmployee.role}) in ${finalDept} (Tier L${finalLevel} — ${finalTierName}).`);
      setName('');
      setEmail('');
      setPassword('1234');
      setRole('');
      setIsCustomDept(false);
      setDepartment(finalDept);
      setCustomDept('');
      setIsCustomTier(false);
      setSelectedTierKey(`${finalLevel}|${finalTierName}`);
      setLevel(finalLevel);
      setCustomTierName('');
      setActiveMgmtTab('directory');
    } catch (err) {
      alert("Error creating user: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered employees for directory view
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDepartment === 'All' || emp.department === filterDepartment;
    return matchesSearch && matchesDept;
  });

  if (!isCeo) {
    return (
      <div className="user-mgmt-restricted-container">
        <div className="user-mgmt-restricted-card">
          <svg className="restricted-icon-svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <h2>Access Restricted</h2>
          <p>User management is restricted to CEO administrative authority.</p>
          <button className="btn-cwt-primary" onClick={onNavigateToTasks}>
            Return to Work & Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-mgmt-page">
      {/* Sleek Minimal Header */}
      <div className="user-mgmt-header">
        <div className="user-mgmt-header-left">
          <div className="executive-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>CEO Console</span>
          </div>
          <h1 className="user-mgmt-title">User Management</h1>
        </div>
      </div>

      {/* Segmented Pill Tabs */}
      <div className="mgmt-tabs-wrapper">
        <div className="mgmt-tabs-pill">
          <button
            type="button"
            className={`mgmt-tab-btn ${activeMgmtTab === 'directory' ? 'active' : ''}`}
            onClick={() => setActiveMgmtTab('directory')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Directory ({employees.length})</span>
          </button>

          <button
            type="button"
            className={`mgmt-tab-btn ${activeMgmtTab === 'add_user' ? 'active' : ''}`}
            onClick={() => setActiveMgmtTab('add_user')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="user-mgmt-success-toast">
          <div className="success-icon-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#057a55" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <span className="success-msg-text">{successMessage}</span>
          <button className="close-toast-btn" onClick={() => setSuccessMessage('')}>✕</button>
        </div>
      )}

      {/* TAB 1: DIRECTORY */}
      {activeMgmtTab === 'directory' && (
        <div className="user-tab-pane directory-pane">
          <div className="directory-toolbar">
            <div className="directory-search-wrap">
              <svg className="roster-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                className="directory-search-input"
                placeholder="Search by name, role or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select 
              className="directory-dept-select"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="All">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="posh-directory-grid">
            {filteredEmployees.map(emp => (
              <div key={emp.id} className="posh-emp-card">
                <div className="posh-emp-header">
                  <div className="posh-avatar-container">
                    <img src={emp.avatar} alt={emp.name} className="posh-avatar-img" />
                    <span className={`posh-lvl-badge tier-${emp.level}`}>
                      L{emp.level}
                    </span>
                  </div>

                  <div className="posh-emp-headline">
                    <div className="posh-name-line">
                      <span className="posh-emp-name">{emp.name}</span>
                      {emp.id === 'emp_ceo' && (
                        <span className="posh-ceo-badge">CEO</span>
                      )}
                    </div>
                    <div className="posh-emp-role">{emp.role}</div>
                    <div className="posh-emp-dept">{emp.department}</div>
                  </div>
                </div>

                <div className="posh-emp-footer">
                  <span className="posh-emp-email">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <span>{emp.email}</span>
                  </span>

                  <span className={`posh-delegation-pill ${emp.canAssign ? 'can-delegate' : 'executor'}`}>
                    {emp.canAssign ? 'Can Delegate' : 'Executor'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredEmployees.length === 0 && (
            <div className="roster-empty-state">
              <p>No employees match your search.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROVISION NEW EMPLOYEE */}
      {activeMgmtTab === 'add_user' && (
        <div className="user-tab-pane add-user-pane">
          <div className="posh-form-card">
            <div className="posh-form-header">
              <h2>New Employee Profile</h2>
            </div>

            <form onSubmit={handleSubmit} className="posh-emp-form">
              <div className="posh-form-row">
                <div className="posh-field">
                  <label htmlFor="user-name">Full Name</label>
                  <input 
                    id="user-name"
                    type="text" 
                    placeholder="e.g. Dilshan Senanayake"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="posh-field">
                  <label htmlFor="user-email">Corporate Email</label>
                  <input 
                    id="user-email"
                    type="email" 
                    placeholder="e.g. dilshan@creativewebtechnology.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="posh-form-row">
                <div className="posh-field">
                  <label htmlFor="user-role">Position / Designation</label>
                  <input 
                    id="user-role"
                    type="text" 
                    placeholder="e.g. Senior Data Architect"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                  />
                </div>

                <div className="posh-field">
                  <label htmlFor="user-password">Initial Password</label>
                  <input 
                    id="user-password"
                    type="text" 
                    placeholder="1234"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="posh-form-row">
                {/* Hierarchy Tier Field */}
                <div className="posh-field">
                  <div className="posh-field-header">
                    <label htmlFor={isCustomTier ? "user-custom-tier-name" : "user-tier-select"}>
                      Hierarchy Tier
                    </label>
                    <button 
                      type="button" 
                      className="posh-field-toggle-btn"
                      onClick={() => {
                        setIsCustomTier(!isCustomTier);
                        if (!isCustomTier) setCustomTierName('');
                      }}
                      title={isCustomTier ? "Use preset hierarchy dropdown" : "Create custom hierarchy tier"}
                    >
                      {isCustomTier ? "Preset List" : "+ Custom"}
                    </button>
                  </div>

                  {!isCustomTier ? (
                    <select 
                      id="user-tier-select"
                      value={selectedTierKey}
                      onChange={(e) => handleTierSelect(e.target.value)}
                    >
                      {hierarchyTiers.map(t => (
                        <option key={`${t.level}-${t.name}`} value={`${t.level}|${t.name}`}>
                          Tier L{t.level} — {t.name}
                        </option>
                      ))}
                      <option value="__custom__">+ Custom Hierarchy Tier...</option>
                    </select>
                  ) : (
                    <div className="posh-custom-tier-box">
                      <div className="posh-custom-subgroup">
                        <span className="posh-sub-label">Authority Tier Level</span>
                        <select 
                          className="posh-custom-lvl-select"
                          value={customTierLevel}
                          onChange={(e) => handleCustomTierLevelChange(parseInt(e.target.value, 10))}
                        >
                          <option value={1}>Tier L1 — Executive / C-Suite</option>
                          <option value={2}>Tier L2 — Lead Architect / Tech Lead</option>
                          <option value={3}>Tier L3 — Senior Engineer</option>
                          <option value={4}>Tier L4 — Specialist Engineer</option>
                        </select>
                      </div>

                      <div className="posh-custom-subgroup">
                        <span className="posh-sub-label">Custom Hierarchy Title</span>
                        <input 
                          id="user-custom-tier-name"
                          type="text"
                          placeholder="e.g. Associate Data Engineer"
                          value={customTierName}
                          onChange={(e) => setCustomTierName(e.target.value)}
                          required
                          autoFocus
                        />
                      </div>
                      <span className="posh-field-hint">Auto-saves to database & dropdown list for future use.</span>
                    </div>
                  )}
                </div>

                {/* Department Field */}
                <div className="posh-field">
                  <div className="posh-field-header">
                    <label htmlFor={isCustomDept ? "user-dept-custom" : "user-dept-select"}>
                      Department
                    </label>
                    <button 
                      type="button" 
                      className="posh-field-toggle-btn"
                      onClick={() => {
                        setIsCustomDept(!isCustomDept);
                        if (!isCustomDept) setCustomDept('');
                      }}
                      title={isCustomDept ? "Use preset department dropdown" : "Type custom department"}
                    >
                      {isCustomDept ? "Preset List" : "+ Custom"}
                    </button>
                  </div>

                  {!isCustomDept ? (
                    <select 
                      id="user-dept-select"
                      value={department}
                      onChange={(e) => handleDeptSelect(e.target.value)}
                    >
                      {departments.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                      <option value="__custom__">+ Custom Department...</option>
                    </select>
                  ) : (
                    <div className="posh-custom-tier-box">
                      <div className="posh-custom-subgroup">
                        <span className="posh-sub-label">Custom Department Name</span>
                        <input 
                          id="user-dept-custom"
                          type="text" 
                          placeholder="e.g. Quantitative FinTech Systems"
                          value={customDept}
                          onChange={(e) => setCustomDept(e.target.value)}
                          required
                          autoFocus
                        />
                      </div>
                      <span className="posh-field-hint">Auto-saves to database & dropdown list for future use.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Avatar Selector */}
              <div className="posh-field">
                <label>Profile Avatar</label>
                <div className="posh-avatar-row">
                  {PRESET_AVATARS.map((p, idx) => (
                    <button 
                      key={idx}
                      type="button" 
                      className={`posh-avatar-btn ${avatar === p.url ? 'active' : ''}`}
                      onClick={() => setAvatar(p.url)}
                      title={p.label}
                    >
                      <img src={p.url} alt={p.label} />
                      {avatar === p.url && <span className="posh-avatar-dot"></span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delegation Toggle */}
              <div className="posh-toggle-wrap">
                <label className="posh-toggle-label">
                  <input 
                    type="checkbox" 
                    checked={canAssign}
                    onChange={(e) => setCanAssign(e.target.checked)}
                  />
                  <span className="posh-toggle-box"></span>
                  <span className="posh-toggle-text">Enable Task Delegation Authority</span>
                </label>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn-posh-create"
                disabled={submitting}
              >
                {submitting ? 'Creating Employee Profile...' : 'Create Employee Profile →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
