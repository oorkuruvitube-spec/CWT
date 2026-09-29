import React, { useState, useEffect } from 'react';
import { INITIAL_DATA } from './data';
import Header from './components/Header';
import Hero from './components/Hero';
import TrustSection from './components/TrustSection';
import DataSpecializationSection from './components/DataSpecializationSection';
import LeadershipSection from './components/LeadershipSection';
import ConsultationSection from './components/ConsultationSection';
import WorkTasksPage from './components/WorkTasksPage';
import LoginPage from './components/LoginPage';
import UserManagementPage from './components/UserManagementPage';
import Footer from './components/Footer';
import { 
  createEmployeeOnBackend, 
  fetchTasksFromBackend, 
  fetchEmployeesFromBackend, 
  normalizeTask, 
  normalizeEmployee 
} from './api';

const FAKE_TASK_IDS = new Set([
  'TSK-290', 'TSK-295', 'TSK-300', 'TSK-300B', 'TSK-300C',
  'TSK-301', 'TSK-302', 'TSK-303', 'TSK-304', 'TSK-305',
  'TSK-306', 'TSK-307', 'TSK-308'
]);

const TASKS_STORAGE_KEY = 'CWT_TASKS_DATA_v6';
const LOGS_STORAGE_KEY = 'CWT_DAILY_LOGS_v2';
const AUTH_STORAGE_KEY = 'CWT_AUTH_USER_v1';
const EMPLOYEES_STORAGE_KEY = 'CWT_EMPLOYEES_DATA_v2';

export default function App() {
  // Persistent Employees State (Only Real Accounts: Kolitha De Silva + dynamically created real users)
  const [employees, setEmployees] = useState(() => {
    try {
      localStorage.removeItem('CWT_EMPLOYEES_DATA_v1');
      const saved = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
      if (saved) {
        let parsed = JSON.parse(saved);
        parsed = parsed
          .filter(e => !['emp_1', 'emp_2', 'emp_3', 'emp_4', 'emp_5'].includes(e.id))
          .map(normalizeEmployee);

        const ceoIdx = parsed.findIndex(e => e.id === 'emp_ceo');
        if (ceoIdx >= 0) {
          parsed[ceoIdx] = {
            ...parsed[ceoIdx],
            email: 'kolitha@gmail.com',
            password: '1234'
          };
        } else {
          parsed.unshift(normalizeEmployee(INITIAL_DATA.employees[0]));
        }
        localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(parsed));
        return parsed;
      }
      const initial = INITIAL_DATA.employees.map(normalizeEmployee);
      localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    } catch {
      return INITIAL_DATA.employees.map(normalizeEmployee);
    }
  });

  const companyMetrics = INITIAL_DATA.companyMetrics;
  const clientSectors = INITIAL_DATA.clientSectors;
  const trustItems = INITIAL_DATA.trustItems;
  const featuredProjects = INITIAL_DATA.featuredProjects;
  const projects = INITIAL_DATA.projects;
  const performanceHistory = INITIAL_DATA.performanceHistory;

  // Session & Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      return !!savedAuth;
    } catch {
      return false;
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        if (['emp_1', 'emp_2', 'emp_3', 'emp_4', 'emp_5'].includes(parsed.id)) {
          return 'emp_ceo';
        }
        return parsed.id || INITIAL_DATA.currentUser;
      }
    } catch {
      // fallback
    }
    return INITIAL_DATA.currentUser;
  });

  // Active View Tab: 'home' | 'tasks' | 'leaves' | 'login' | 'users'
  const [activeTab, setActiveTab] = useState('home');

  // Persistent Tasks State (Only Real Assigned Tasks, No Mock Placeholders)
  const [tasks, setTasks] = useState(() => {
    try {
      ['CWT_TASKS_DATA_v1', 'CWT_TASKS_DATA_v2', 'CWT_TASKS_DATA_v3', 'CWT_TASKS_DATA_v4', 'CWT_TASKS_DATA_v5'].forEach(k => {
        try { localStorage.removeItem(k); } catch {}
      });
      const saved = localStorage.getItem(TASKS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed
            .filter(t => !FAKE_TASK_IDS.has(t.id))
            .map(normalizeTask);
          localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(cleaned));
          return cleaned;
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // Persistent Daily Updates State (Real Worklogs Only)
  const [dailyUpdates, setDailyUpdates] = useState(() => {
    try {
      localStorage.removeItem('CWT_DAILY_LOGS_v1');
      const saved = localStorage.getItem(LOGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(l => !l.id?.startsWith('log-10') && !l.id?.startsWith('log-09'));
          localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(cleaned));
          return cleaned;
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // Fetch real persistent tasks and employees from backend database on mount
  useEffect(() => {
    fetchTasksFromBackend().then(backendTasks => {
      if (Array.isArray(backendTasks)) {
        const cleanedBackend = backendTasks
          .filter(t => !FAKE_TASK_IDS.has(t.id))
          .map(normalizeTask);
        setTasks(prev => {
          const map = new Map();
          cleanedBackend.forEach(t => map.set(t.id, t));
          prev.filter(t => !FAKE_TASK_IDS.has(t.id)).forEach(t => {
            if (!map.has(t.id)) map.set(t.id, t);
          });
          const merged = Array.from(map.values());
          localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(merged));
          return merged;
        });
      }
    }).catch(err => console.info("Backend loading tasks:", err));

    fetchEmployeesFromBackend().then(backendEmployees => {
      if (Array.isArray(backendEmployees) && backendEmployees.length > 0) {
        setEmployees(prev => {
          const map = new Map();
          prev.forEach(e => map.set(e.id, e));
          backendEmployees.forEach(e => {
            if (!['emp_1', 'emp_2', 'emp_3', 'emp_4', 'emp_5'].includes(e.id)) {
              map.set(e.id, normalizeEmployee(e));
            }
          });
          const merged = Array.from(map.values());
          localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(merged));
          return merged;
        });
      }
    }).catch(err => console.info("Backend loading employees:", err));
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(dailyUpdates));
  }, [dailyUpdates]);

  const handleUpdateTasks = (newTasks) => {
    const cleaned = (Array.isArray(newTasks) ? newTasks : [])
      .filter(t => !FAKE_TASK_IDS.has(t.id))
      .map(normalizeTask);
    setTasks(cleaned);
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(cleaned));
  };

  const handleUpdateDailyUpdates = (newLogs) => {
    const cleaned = (Array.isArray(newLogs) ? newLogs : [])
      .filter(l => !l.id?.startsWith('log-10') && !l.id?.startsWith('log-09'));
    setDailyUpdates(cleaned);
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(cleaned));
  };

  // Determine Active User and CEO Authority Status
  const activeUser = employees.find(e => e.id === currentUser) || employees[0];
  const isCeo = activeUser.id === 'emp_ceo' || activeUser.email === 'kolitha@gmail.com' || activeUser.level === 1;

  // CEO Handler: Create New Employee & Position
  const handleCreateEmployee = async (newEmployee) => {
    setEmployees(prev => {
      const exists = prev.some(e => e.id === newEmployee.id || e.email.toLowerCase() === newEmployee.email.toLowerCase());
      if (exists) {
        return prev.map(e => (e.id === newEmployee.id || e.email.toLowerCase() === newEmployee.email.toLowerCase()) ? newEmployee : e);
      }
      const updated = [...prev, newEmployee];
      localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    // Also persist to FastAPI backend database if available
    try {
      await createEmployeeOnBackend({
        name: newEmployee.name,
        email: newEmployee.email,
        password: newEmployee.password || "1234",
        role: newEmployee.role,
        level: newEmployee.level,
        level_name: newEmployee.levelName,
        department: newEmployee.department,
        avatar: newEmployee.avatar,
        can_assign: newEmployee.canAssign,
        bio: newEmployee.bio
      });
    } catch (err) {
      console.warn("Backend offline or local persistence active:", err.message);
    }
  };

  // Auth Handlers
  const handleLoginSuccess = (employee) => {
    setIsLoggedIn(true);
    setCurrentUser(employee.id);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(employee));
    
    // If CEO logs in, redirect to user management or tasks
    const isCeoLogin = employee.id === 'emp_ceo' || employee.email === 'kolitha@gmail.com' || employee.level === 1;
    if (isCeoLogin) {
      setActiveTab('users');
    } else {
      setActiveTab('tasks');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUserChange = (newUserId) => {
    setCurrentUser(newUserId);
    const targetUser = employees.find(e => e.id === newUserId);
    const targetIsCeo = targetUser && (targetUser.id === 'emp_ceo' || targetUser.email === 'kolitha@gmail.com' || targetUser.level === 1);
    
    // If switched away from CEO while on users page, gracefully navigate back to tasks
    if (!targetIsCeo && activeTab === 'users') {
      setActiveTab('tasks');
    }
  };

  return (
    <div className={`app-container ${activeTab === 'login' ? 'login-view-active' : ''}`}>
      {/* Navigation Header */}
      <Header 
        employees={employees} 
        currentUser={currentUser} 
        onUserChange={handleUserChange}
        activeTab={activeTab}
        onTabChange={(tab) => {
          // If trying to access internal pages while not logged in, redirect to login
          if (!isLoggedIn && (tab === 'tasks' || tab === 'leaves' || tab === 'users')) {
            setActiveTab('login');
          } else if (tab === 'users' && !isCeo) {
            // Non-CEO attempting to access users page redirected to tasks
            setActiveTab('tasks');
          } else {
            setActiveTab(tab);
          }
        }}
        isLoggedIn={isLoggedIn}
        onLoginClick={() => setActiveTab('login')}
        onLogout={handleLogout}
      />

      <main className="main-wrapper">
        {/* View 1: Public Home Page */}
        {activeTab === 'home' && (
          <section id="page-home" className="page-view active" style={{ display: 'block' }}>
            <Hero 
              companyMetrics={companyMetrics} 
              clientSectors={clientSectors} 
              featuredProjects={featuredProjects}
            />
            <TrustSection 
              trustItems={trustItems} 
            />
            <DataSpecializationSection />
            <LeadershipSection />
            <ConsultationSection />
          </section>
        )}

        {/* View 2: Employee Login Page */}
        {activeTab === 'login' && (
          <section id="page-login" className="page-view active" style={{ display: 'block' }}>
            <LoginPage 
              employees={employees}
              onLoginSuccess={handleLoginSuccess}
              onCancel={() => setActiveTab('home')}
            />
          </section>
        )}

        {/* View 3: Protected Work & Tasks Page (Only accessible when logged in) */}
        {activeTab === 'tasks' && isLoggedIn && (
          <section id="page-tasks" className="page-view active" style={{ display: 'block' }}>
            <WorkTasksPage 
              currentUser={currentUser}
              employees={employees}
              projects={projects}
              tasks={tasks}
              dailyUpdates={dailyUpdates}
              performanceHistory={performanceHistory}
              onUpdateTasks={handleUpdateTasks}
              onUpdateDailyUpdates={handleUpdateDailyUpdates}
              onUserChange={handleUserChange}
            />
          </section>
        )}

        {/* View 4: Protected Leave & Performance Page (Only accessible when logged in) */}
        {activeTab === 'leaves' && isLoggedIn && (
          <section id="page-leaves" className="page-view active" style={{ display: 'block', padding: '120px 20px 80px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ background: '#fff', borderRadius: '24px', padding: '60px 30px', boxShadow: 'var(--cs-shadow-pill)', border: '1px solid var(--cs-border)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌴</div>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '28px', color: 'var(--cs-primary)', fontWeight: 800, marginBottom: '12px' }}>
                Leave & Performance Module
              </h2>
              <p style={{ color: 'var(--cs-text-secondary)', maxWidth: '580px', margin: '0 auto 24px', fontSize: '15px' }}>
                Coming in the next phase! Track employee annual, casual, and medical leaves, executive sign-offs, and multi-tier approval workflows.
              </p>
              <button 
                className="btn-cwt-primary" 
                onClick={() => setActiveTab('tasks')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', background: 'var(--cwt-gradient-brand)', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer' }}
              >
                <span>Go to Work & Tasks</span> →
              </button>
            </div>
          </section>
        )}

        {/* View 5: CEO Exclusive User & Position Governance (Strictly visible only for Kolitha De Silva) */}
        {activeTab === 'users' && isLoggedIn && isCeo && (
          <section id="page-users" className="page-view active" style={{ display: 'block' }}>
            <UserManagementPage 
              employees={employees}
              currentUser={currentUser}
              onCreateEmployee={handleCreateEmployee}
              onNavigateToTasks={() => setActiveTab('tasks')}
            />
          </section>
        )}
      </main>

      {/* Hide footer on login page for pure distraction-free sign-in */}
      {activeTab !== 'login' && <Footer />}
    </div>
  );
}
