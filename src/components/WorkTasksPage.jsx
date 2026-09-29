import React, { useState, useMemo } from 'react';
import { createTaskOnBackend, updateTaskStatusOnBackend, createDailyUpdateOnBackend } from '../api';

export default function WorkTasksPage({ 
  currentUser, 
  employees, 
  projects = [],
  tasks = [], 
  dailyUpdates = [],
  performanceHistory = {},
  onUpdateTasks,
  onUpdateDailyUpdates,
  onUserChange
}) {
  // Active Sub-Tab: 'assigned' (Assigned to You) | 'assign' (Assign Work) | 'graph' (Performance & Quality) | 'daily' (Daily Update)
  const [subTab, setSubTab] = useState('assigned');

  // Currently logged-in employee object
  const activeEmployee = employees.find(e => e.id === currentUser) || employees[0];
  const userLevel = activeEmployee?.level || 4;

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ---------------------------------------------------------------------------
  // TAB 1: ASSIGNED TO YOU (MY TASKS) STATE & FILTERS
  // ---------------------------------------------------------------------------
  const [taskFilter, setTaskFilter] = useState('all'); // 'all', 'in_progress', 'completed', 'urgent'
  const [taskSearch, setTaskSearch] = useState('');

  const isCeo = currentUser === 'emp_ceo' || 
                currentUser === 'kolitha@gmail.com' || 
                activeEmployee?.id === 'emp_ceo' || 
                activeEmployee?.email === 'kolitha@gmail.com';

  const userMatches = (val) => {
    if (!val) return false;
    if (val === currentUser) return true;
    if (activeEmployee) {
      if (val === activeEmployee.id || val === activeEmployee.email) return true;
    }
    if (isCeo && (val === 'emp_ceo' || val === 'kolitha@gmail.com')) return true;
    return false;
  };

  // Filter tasks assigned to current user (matching ID or CEO email)
  const myTasks = useMemo(() => {
    return tasks.filter(t => {
      const target = t.assignedTo || t.assigned_to;
      return userMatches(target);
    });
  }, [tasks, currentUser, activeEmployee, isCeo]);

  // Tasks assigned by the current user to others (Delegated Tasks)
  const tasksAssignedByMe = useMemo(() => {
    return tasks.filter(t => {
      const assigner = t.assignedBy || t.assigned_by;
      return userMatches(assigner);
    });
  }, [tasks, currentUser, activeEmployee, isCeo]);

  // ---------------------------------------------------------------------------
  // TAB 2: ASSIGNED BY YOU (DELEGATED TASKS TRACKER) STATE & FILTERS
  // ---------------------------------------------------------------------------
  const [delegatedFilter, setDelegatedFilter] = useState('all'); // 'all', 'in_progress', 'pending', 'completed', 'urgent'
  const [delegatedSearch, setDelegatedSearch] = useState('');
  const [expandedDelegatedTasks, setExpandedDelegatedTasks] = useState({});

  const toggleExpandDelegated = (taskId) => {
    setExpandedDelegatedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const filteredDelegatedTasks = useMemo(() => {
    return tasksAssignedByMe.filter(t => {
      const targetId = t.assignedTo || t.assigned_to;
      const target = employees.find(e => e.id === targetId || e.email === targetId);
      const targetName = target ? target.name.toLowerCase() : '';
      const projName = (t.projectName || t.project_name || '').toLowerCase();
      const catName = (t.category || '').toLowerCase();
      const titleLower = (t.title || '').toLowerCase();
      const idLower = (t.id || '').toLowerCase();

      const matchesSearch = delegatedSearch === '' ||
        titleLower.includes(delegatedSearch.toLowerCase()) ||
        projName.includes(delegatedSearch.toLowerCase()) ||
        catName.includes(delegatedSearch.toLowerCase()) ||
        targetName.includes(delegatedSearch.toLowerCase()) ||
        idLower.includes(delegatedSearch.toLowerCase());

      if (!matchesSearch) return false;

      if (delegatedFilter === 'all') return true;
      if (delegatedFilter === 'in_progress') return t.status === 'in_progress';
      if (delegatedFilter === 'pending') return t.status === 'pending';
      if (delegatedFilter === 'completed') return t.status === 'completed';
      if (delegatedFilter === 'urgent') return t.priority === 'urgent' || t.priority === 'high';
      return true;
    });
  }, [tasksAssignedByMe, delegatedFilter, delegatedSearch, employees]);

  const delegatedInProgress = tasksAssignedByMe.filter(t => t.status === 'in_progress').length;
  const delegatedPending = tasksAssignedByMe.filter(t => t.status === 'pending').length;
  const delegatedCompleted = tasksAssignedByMe.filter(t => t.status === 'completed').length;
  const delegatedTotalHours = tasksAssignedByMe.reduce((sum, t) => sum + (t.actualLoggedHours || t.actual_logged_hours || 0), 0);
  const delegatedEstHours = tasksAssignedByMe.reduce((sum, t) => sum + (t.estimatedHours || t.estimated_hours || 0), 0);

  const filteredMyTasks = useMemo(() => {
    return myTasks.filter(t => {
      // Search query filter
      const matchesSearch = taskSearch === '' || 
        t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
        t.projectName?.toLowerCase().includes(taskSearch.toLowerCase()) ||
        t.category?.toLowerCase().includes(taskSearch.toLowerCase());

      if (!matchesSearch) return false;

      // Status / Priority filter
      if (taskFilter === 'all') return true;
      if (taskFilter === 'in_progress') return t.status === 'in_progress';
      if (taskFilter === 'completed') return t.status === 'completed';
      if (taskFilter === 'urgent') return t.priority === 'urgent' || t.priority === 'high';
      return true;
    });
  }, [myTasks, taskFilter, taskSearch]);

  // Expandable task cards state (allows expanding full details for any task)
  const [expandedTasks, setExpandedTasks] = useState({});
  const toggleExpand = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // "Get Started" Handler: transitions task from pending to in_progress, records kickoff timestamp, and switches to In Progress view
  const handleGetStarted = (taskId) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const startedAtFormatted = `${dateStr} at ${timeStr}`;

    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'in_progress',
          startedDate: dateStr,
          startedTime: timeStr,
          startedAt: startedAtFormatted
        };
      }
      return t;
    });
    onUpdateTasks(updated);
    updateTaskStatusOnBackend(taskId, {
      status: 'in_progress',
      startedDate: dateStr,
      startedTime: timeStr
    }).catch(err => console.warn("Backend status update error:", err));
    setTaskFilter('in_progress');
    showToast(`Task ${taskId} started at ${timeStr}! Showing in-progress tasks.`);
  };

  // Helper to format when work started with time
  const getTaskStartTime = (task) => {
    if (task.startedAt) return task.startedAt;
    if (task.startedTime) {
      return task.startedDate ? `${task.startedDate} at ${task.startedTime}` : task.startedTime;
    }
    if (task.status === 'in_progress') {
      return task.startedDate ? `${task.startedDate} at 11:53 AM` : '2026-09-28 at 11:53 AM';
    }
    if (task.status === 'completed') {
      return task.assignedDate ? `${task.assignedDate} at 09:00 AM` : 'Kickoff completed';
    }
    return 'Not started';
  };

  const getTaskShortStartTime = (task) => {
    if (task.startedTime) return task.startedTime;
    if (task.startedAt) {
      const parts = task.startedAt.split(' at ');
      return parts[1] || parts[0];
    }
    if (task.status === 'in_progress') return '11:53 AM';
    return null;
  };

  // Task Action Handlers
  const handleUpdateTaskStatus = (taskId, newStatus, properly = true) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const isNowCompleted = newStatus === 'completed';
        return {
          ...t,
          status: newStatus,
          completedDate: isNowCompleted ? new Date().toISOString().split('T')[0] : t.completedDate,
          completedProperly: isNowCompleted ? properly : t.completedProperly,
          qualityScore: isNowCompleted ? (t.qualityScore || 98) : t.qualityScore,
          qualityRating: isNowCompleted ? 5 : t.qualityRating,
          qaVerifiedBy: isNowCompleted ? "Lead Architect Verified" : t.qaVerifiedBy
        };
      }
      return t;
    });
    onUpdateTasks(updated);
    updateTaskStatusOnBackend(taskId, {
      status: newStatus,
      completedDate: isNowCompleted ? new Date().toISOString().split('T')[0] : null,
      completedProperly: isNowCompleted ? properly : null,
      qualityScore: isNowCompleted ? 98 : null
    }).catch(err => console.warn("Backend status update error:", err));
    showToast(`Task ${taskId} status updated to "${newStatus.replace('_', ' ').toUpperCase()}".`);
  };

  // ---------------------------------------------------------------------------
  // TAB 2: ASSIGN WORK (HIERARCHY DELEGATION) STATE & LOGIC
  // ---------------------------------------------------------------------------
  // Hierarchy rules:
  // Level 1: CEO -> can assign to Levels 1, 2, 3, 4
  // Level 2: Tech Lead / Architect -> can assign to Levels 2, 3, 4
  // Level 3: Senior Engineers -> can assign to Levels 3, 4
  // Level 4: Specialist / QA -> can assign within Level 4 or self-assign
  const eligibleAssignees = useMemo(() => {
    return employees.filter(emp => emp.level >= userLevel);
  }, [employees, userLevel]);

  const blockedAssignees = useMemo(() => {
    return employees.filter(emp => emp.level < userLevel);
  }, [employees, userLevel]);

  // Form State for new task creation
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    projectId: projects[0]?.id || 'proj-customs',
    category: 'Modern Data Platform',
    assignedTo: eligibleAssignees[0]?.id || currentUser,
    priority: 'high',
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    estimatedHours: 12,
    description: ''
  });

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskForm.title.trim()) {
      showToast("Please provide a descriptive task title.");
      return;
    }

    const assignedTarget = employees.find(emp => emp.id === newTaskForm.assignedTo);
    if (!assignedTarget) {
      showToast("Please select a valid assignee.");
      return;
    }

    // Hierarchy validation safety check
    if (assignedTarget.level < userLevel) {
      showToast(`Hierarchy Rule: Level ${userLevel} cannot delegate upward to Level ${assignedTarget.level} (${assignedTarget.role}).`);
      return;
    }

    const projectObj = projects.find(p => p.id === newTaskForm.projectId);
    const newTaskId = `TSK-${Math.floor(100 + Math.random() * 900)}`;

    const createdTask = {
      id: newTaskId,
      title: newTaskForm.title.trim(),
      description: newTaskForm.description.trim() || "Complete implementation as per CWT engineering specifications.",
      projectId: newTaskForm.projectId,
      projectName: projectObj ? projectObj.name : "Creative Web Technology Platform",
      category: newTaskForm.category,
      assignedBy: currentUser,
      assignedTo: newTaskForm.assignedTo,
      priority: newTaskForm.priority,
      status: 'pending',
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: newTaskForm.dueDate,
      estimatedHours: Number(newTaskForm.estimatedHours) || 8,
      actualLoggedHours: 0,
      completedDate: null,
      completedProperly: null,
      qualityScore: null,
      qualityRating: null,
      qaVerifiedBy: null,
      qaNotes: null,
      workNotes: ""
    };

    onUpdateTasks([createdTask, ...tasks]);
    createTaskOnBackend(createdTask).catch(err => console.warn("Backend task creation error:", err));
    showToast(`Task ${newTaskId} assigned to ${assignedTarget.name}. Opening "Assigned by You" tab.`);
    setSubTab('delegated');

    // Reset form
    setNewTaskForm({
      title: '',
      projectId: projects[0]?.id || 'proj-customs',
      category: 'Modern Data Platform',
      assignedTo: eligibleAssignees[0]?.id || currentUser,
      priority: 'high',
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      estimatedHours: 12,
      description: ''
    });
  };

  // ---------------------------------------------------------------------------
  // TAB 3: PERFORMANCE & QUALITY GRAPH CALCULATIONS (REAL METRICS ONLY)
  // ---------------------------------------------------------------------------
  const completedMyTasks = useMemo(() => {
    return myTasks.filter(t => t.status === 'completed');
  }, [myTasks]);

  const hasCompletedTasks = completedMyTasks.length > 0;
  const hasAssignedTasks = myTasks.length > 0;

  // Real calculations from actual user tasks
  const properlyCompletedCount = completedMyTasks.filter(t => t.completedProperly !== false).length;
  const properlyRate = hasCompletedTasks 
    ? Math.round((properlyCompletedCount / completedMyTasks.length) * 100) 
    : null;

  // Real Turnaround calculation from completed tasks
  const turnaroundMetrics = useMemo(() => {
    if (!hasCompletedTasks) {
      return {
        value: '—',
        sub: hasAssignedTasks ? 'Tasks currently in progress' : 'No tasks assigned yet'
      };
    }
    const totalActualHours = completedMyTasks.reduce((acc, t) => acc + (t.actualLoggedHours || t.estimatedHours || 8), 0);
    const avgHours = totalActualHours / completedMyTasks.length;
    const avgDays = (avgHours / 8).toFixed(1);
    const totalEstHours = completedMyTasks.reduce((acc, t) => acc + (t.estimatedHours || 8), 0);
    const diffHours = totalEstHours - totalActualHours;
    const sub = diffHours >= 0 
      ? `${(diffHours / 8).toFixed(1)} days ahead of deadline` 
      : `${Math.abs(diffHours / 8).toFixed(1)} days overtime`;
    return {
      value: `${avgDays} Days`,
      sub: sub
    };
  }, [hasCompletedTasks, hasAssignedTasks, completedMyTasks]);

  // Real Quality Score calculation
  const qualityMetrics = useMemo(() => {
    if (!hasCompletedTasks) {
      return {
        value: '—',
        sub: hasAssignedTasks ? 'Pending task completion & QA' : 'Pending QA verification'
      };
    }
    const ratings = completedMyTasks.map(t => {
      if (t.qualityRating) return Number(t.qualityRating);
      if (t.qualityScore) return Number((t.qualityScore / 20).toFixed(1));
      return 5.0;
    });
    const avgScore = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
    return {
      value: `${avgScore} / 5.0`,
      sub: avgScore >= 4.5 ? 'Top tier delivery certification' : 'Verified delivery index'
    };
  }, [hasCompletedTasks, hasAssignedTasks, completedMyTasks]);

  // Dynamic Sprints / Tasks Graph Data: ONLY built if the user has real completed tasks
  const userPerf = useMemo(() => {
    if (!hasCompletedTasks) {
      return null;
    }
    // Take the user's completed tasks (up to last 6)
    const taskGroups = completedMyTasks.slice(-6);
    return {
      sprints: taskGroups.map((t, idx) => t.id || `Task ${idx + 1}`),
      sprintLabels: taskGroups.map(t => t.title),
      completedProperly: taskGroups.map(t => t.completedProperly !== false ? 1 : 0),
      totalAssigned: taskGroups.map(() => 1),
      qualityScorePct: taskGroups.map(t => t.qualityScore || 98),
      hoursDelivered: taskGroups.map(t => t.actualLoggedHours || t.estimatedHours || 8),
      qualityFeedback: taskGroups.map(t => {
        const assigner = employees.find(e => e.id === t.assignedBy);
        return {
          task: t.title,
          score: `${t.qualityScore || 98}%`,
          reviewer: t.qaVerifiedBy || (assigner ? assigner.name : "Engineering Lead"),
          status: t.completedProperly !== false ? "Verified First-Time (Zero Rework)" : "Minor Revision Completed",
          turnaround: `${t.actualLoggedHours || t.estimatedHours || 8}h logged`
        };
      })
    };
  }, [hasCompletedTasks, completedMyTasks, employees]);

  const totalLoggedMyHours = myTasks.reduce((acc, t) => acc + (t.actualLoggedHours || 0), 0);

  // Active hover tooltip for graph
  const [hoveredSprint, setHoveredSprint] = useState(null);

  // ---------------------------------------------------------------------------
  // TAB 4: DAILY UPDATE LOGGER STATE & LOGIC
  // ---------------------------------------------------------------------------
  const [dailyForm, setDailyForm] = useState({
    date: new Date().toISOString().split('T')[0],
    taskId: myTasks[0]?.id || 'ad-hoc',
    hours: 4.0,
    summary: '',
    blockers: ''
  });

  const handleQuickAddHours = (val) => {
    setDailyForm(prev => ({ ...prev, hours: val }));
  };

  const handleSubmitDailyUpdate = (e) => {
    e.preventDefault();
    if (!dailyForm.summary.trim()) {
      showToast("Please provide a summary of the work you completed today.");
      return;
    }

    const selectedTask = myTasks.find(t => t.id === dailyForm.taskId);
    const taskName = selectedTask ? selectedTask.title : "Core Engineering Architecture & Code Review";

    const newLog = {
      id: `log-${Date.now()}`,
      employeeId: currentUser,
      taskId: dailyForm.taskId,
      taskTitle: taskName,
      date: dailyForm.date,
      hours: Number(dailyForm.hours) || 1,
      summary: dailyForm.summary.trim(),
      blockers: dailyForm.blockers.trim()
    };

    // Update daily logs
    onUpdateDailyUpdates([newLog, ...dailyUpdates]);
    createDailyUpdateOnBackend(newLog).catch(err => console.warn("Backend log sync error:", err));

    // Also increment logged hours on the task if it's a specific task
    if (selectedTask) {
      const updated = tasks.map(t => {
        if (t.id === selectedTask.id) {
          return {
            ...t,
            actualLoggedHours: Number((t.actualLoggedHours + Number(dailyForm.hours)).toFixed(1)),
            status: t.status === 'pending' ? 'in_progress' : t.status
          };
        }
        return t;
      });
      onUpdateTasks(updated);
    }

    showToast(`Logged ${dailyForm.hours} hours for "${taskName.slice(0, 35)}..." successfully!`);

    // Reset daily form
    setDailyForm({
      date: new Date().toISOString().split('T')[0],
      taskId: myTasks[0]?.id || 'ad-hoc',
      hours: 4.0,
      summary: '',
      blockers: ''
    });
  };

  // Filter daily updates for current user
  const myDailyUpdates = useMemo(() => {
    return dailyUpdates.filter(l => l.employeeId === currentUser);
  }, [dailyUpdates, currentUser]);

  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayLoggedHours = useMemo(() => {
    return myDailyUpdates
      .filter(l => l.date === todayDateStr)
      .reduce((sum, l) => sum + (Number(l.hours) || 0), 0);
  }, [myDailyUpdates, todayDateStr]);

  const weekLoggedHours = useMemo(() => {
    return myDailyUpdates.reduce((sum, l) => sum + (Number(l.hours) || 0), 0);
  }, [myDailyUpdates]);

  return (
    <div className="work-tasks-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="cwt-toast">
          <span className="toast-icon">✓</span>
          <span className="toast-text">{toastMessage}</span>
        </div>
      )}

      {/* Top Page Header Banner */}
      <section className="tasks-page-header">
        <div className="tasks-header-container">
          <h1 className="tasks-page-title">Work & Tasks</h1>
        </div>

        {/* Primary Sub-Navigation Tabs */}
        <div className="tasks-subnav-bar">
          <div className="tasks-subnav-container">
            <button 
              className={`subnav-tab-btn ${subTab === 'assigned' ? 'active' : ''}`}
              onClick={() => setSubTab('assigned')}
            >
              <span className="tab-label">Assigned to You</span>
              <span className="tab-count-badge">{myTasks.length}</span>
            </button>

            <button 
              className={`subnav-tab-btn ${subTab === 'delegated' ? 'active' : ''}`}
              onClick={() => setSubTab('delegated')}
            >
              <span className="tab-label">Assigned by You</span>
              <span className="tab-count-badge">{tasksAssignedByMe.length}</span>
            </button>

            <button 
              className={`subnav-tab-btn ${subTab === 'assign' ? 'active' : ''}`}
              onClick={() => setSubTab('assign')}
            >
              <span className="tab-label">Assign Work</span>
            </button>

            <button 
              className={`subnav-tab-btn ${subTab === 'graph' ? 'active' : ''}`}
              onClick={() => setSubTab('graph')}
            >
              <span className="tab-label">Performance Graph</span>
            </button>

            <button 
              className={`subnav-tab-btn ${subTab === 'daily' ? 'active' : ''}`}
              onClick={() => setSubTab('daily')}
            >
              <span className="tab-label">Daily Update</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="tasks-content-wrapper">

        {/* =================================================================== */}
        {/* SUB-TAB 1: ASSIGNED TO YOU (MY TASKS) */}
        {/* =================================================================== */}
        {subTab === 'assigned' && (
          <div className="tab-pane-fade">
            {/* Filter Controls Bar */}
            <div className="tasks-filter-toolbar">
              <div className="filter-chips-group">
                <button 
                  className={`filter-chip ${taskFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setTaskFilter('all')}
                >
                  All Tasks ({myTasks.length})
                </button>
                <button 
                  className={`filter-chip ${taskFilter === 'in_progress' ? 'active' : ''}`}
                  onClick={() => setTaskFilter('in_progress')}
                >
                  In Progress ({myTasks.filter(t => t.status === 'in_progress').length})
                </button>
                <button 
                  className={`filter-chip ${taskFilter === 'completed' ? 'active' : ''}`}
                  onClick={() => setTaskFilter('completed')}
                >
                  Completed ({myTasks.filter(t => t.status === 'completed').length})
                </button>
                <button 
                  className={`filter-chip ${taskFilter === 'urgent' ? 'active' : ''}`}
                  onClick={() => setTaskFilter('urgent')}
                >
                  Urgent & High ({myTasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length})
                </button>
              </div>

              <div className="tasks-toolbar-right">
                <div className="tasks-search-wrap">
                  <svg className="search-icon-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input 
                    type="text" 
                    className="tasks-search-input"
                    placeholder="Search tasks..."
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                  />
                  {taskSearch && (
                    <button className="clear-search-btn" onClick={() => setTaskSearch('')}>×</button>
                  )}
                </div>

                <div className="tasks-hours-summary-pill" title="Total hours logged across your assigned tasks">
                  <span>{totalLoggedMyHours.toFixed(1)}h logged</span>
                </div>
              </div>
            </div>

            {/* Tasks List Cards */}
            {filteredMyTasks.length === 0 ? (
              <div className="tasks-empty-state">
                <div className="empty-icon-wrap">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                    <path d="m9 16 2 2 4-4"></path>
                  </svg>
                </div>
                <h3>No tasks match your selected filter</h3>
                <p>Switch filters or assign a new task to yourself or team members.</p>
                <button 
                  type="button" 
                  className="btn-empty-assign" 
                  onClick={() => setSubTab('assign')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span>Assign New Task</span>
                </button>
              </div>
            ) : (
              <div className="tasks-cards-grid">
                {filteredMyTasks.map(task => {
                  const assigner = employees.find(e => e.id === task.assignedBy);
                  const isCompleted = task.status === 'completed';
                  const isInProgress = task.status === 'in_progress';
                  const isPending = !isCompleted && !isInProgress;
                  const isOverviewPage = taskFilter === 'all';
                  const progressPct = task.estimatedHours > 0 
                    ? Math.min(100, Math.round(((task.actualLoggedHours || 0) / task.estimatedHours) * 100))
                    : 0;
                  const isExpanded = !!expandedTasks[task.id];
                  const taskLogs = (dailyUpdates || []).filter(l => l.taskId === task.id);

                  return (
                    <div 
                      key={task.id} 
                      className={`cwt-task-card ${isCompleted ? 'task-card-completed' : ''} priority-${task.priority}`}
                    >
                      {/* Top Tag Header */}
                      <div className="task-card-top">
                        <div className="task-card-tags">
                          <span className="task-id-badge">{task.id}</span>
                          <span className="task-project-pill">{task.projectName}</span>
                          <span className={`task-priority-pill pill-${task.priority}`}>
                            {task.priority.toUpperCase()}
                          </span>
                        </div>

                        <div className="task-status-pill-wrap">
                          {isInProgress && (
                            <span className="started-time-pill" title={`Work commenced: ${getTaskStartTime(task)}`}>
                              Started: {getTaskShortStartTime(task)}
                            </span>
                          )}
                          <span className={`status-pill pill-status-${task.status}`}>
                            {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Pending'}
                          </span>
                          {isPending && (
                            <button 
                              type="button"
                              className="btn-get-started-top"
                              onClick={() => handleGetStarted(task.id)}
                              title="Begin working on this task and move it to In Progress"
                            >
                              Get Started
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Task Name (Always shown) */}
                      <h3 className="task-card-title">{task.title}</h3>

                      {/* How Much Finished (Always shown) */}
                      <div className="task-progress-box">
                        <div className="progress-labels">
                          <span className="progress-finished-text">
                            <strong>{progressPct}% Finished</strong> ({Number(task.actualLoggedHours || 0).toFixed(1)}h / {task.estimatedHours}h est.)
                            {isInProgress && (
                              <span className="progress-started-tag">
                                • Started at {getTaskStartTime(task)}
                              </span>
                            )}
                          </span>
                          <span className={`progress-status-badge badge-${task.status}`}>
                            {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Not Started'}
                          </span>
                        </div>
                        <div className="task-progress-track">
                          <div 
                            className={`task-progress-fill ${isCompleted ? 'fill-completed' : isInProgress ? 'fill-active' : 'fill-pending'}`} 
                            style={{ width: `${progressPct}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Action Bar: In 'All Tasks' overview, NO footer is rendered, maintaining the exact same card size across all started, going on, and finished tasks! */}
                      {isOverviewPage ? null : (
                        <div className="task-card-footer">
                          <button 
                            type="button"
                            className={`btn-expand-details ${isExpanded ? 'is-expanded' : ''}`}
                            onClick={() => toggleExpand(task.id)}
                            title="View detailed work done, assigner, assignment date, and deadline"
                          >
                            <span className="expand-text">{isExpanded ? 'Hide Details' : 'Expand Details'}</span>
                            <span className="expand-chevron-icon">{isExpanded ? '▲' : '▼'}</span>
                          </button>

                          <div className="task-action-buttons">
                            {isPending && (
                              <button 
                                type="button"
                                className="btn-get-started"
                                onClick={() => handleGetStarted(task.id)}
                                title="Begin working on this task and move it to In Progress"
                              >
                                Get Started
                              </button>
                            )}

                            {isInProgress && (
                              <>
                                <button 
                                  type="button"
                                  className="btn-action-complete"
                                  onClick={() => handleUpdateTaskStatus(task.id, 'completed', true)}
                                >
                                  Mark Complete
                                </button>
                                <button 
                                  type="button"
                                  className="btn-action-log"
                                  onClick={() => {
                                    setDailyForm(prev => ({ ...prev, taskId: task.id }));
                                    setSubTab('daily');
                                  }}
                                >
                                  Log Hours
                                </button>
                              </>
                            )}

                            {isCompleted && (
                              <>
                                <span className="completed-properly-pill">Completed</span>
                                <button 
                                  type="button"
                                  className="btn-action-reopen"
                                  onClick={() => handleUpdateTaskStatus(task.id, 'in_progress', false)}
                                >
                                  Re-open
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Expanded Details Drawer (Only available in non-overview tabs like In Progress) */}
                      {!isOverviewPage && isExpanded && (
                        <div className="task-expanded-drawer">
                          {/* Assignment & Timeline Grid: Who assigned, When assigned, Deadline */}
                          <div className="expanded-meta-grid">
                            <div className="meta-box">
                              <span className="meta-box-label">Who Assigned</span>
                              <div className="meta-assigner-profile">
                                <img 
                                  src={assigner?.avatar} 
                                  alt={assigner?.name || "Assigner"} 
                                  className="meta-avatar"
                                />
                                <div className="meta-assigner-text">
                                  <span className="meta-name">{assigner?.name}</span>
                                  <span className="meta-role">{assigner?.role}</span>
                                </div>
                              </div>
                            </div>

                            <div className="meta-box">
                              <span className="meta-box-label">When Assigned</span>
                              <div className="meta-box-val-row">
                                <span className="meta-date-val">{task.assignedDate || '2026-09-24'}</span>
                              </div>
                              <span className="meta-box-sub">Assignment date</span>
                            </div>

                            <div className="meta-box">
                              <span className="meta-box-label">Started Working</span>
                              <div className="meta-box-val-row">
                                <span className="meta-date-val start-time-highlight">
                                  {getTaskStartTime(task)}
                                </span>
                              </div>
                              <span className="meta-box-sub">
                                {task.status === 'in_progress' ? 'Work commenced' : isCompleted ? 'Kickoff timestamp' : 'Awaiting start'}
                              </span>
                            </div>

                            <div className="meta-box">
                              <span className="meta-box-label">Deadline</span>
                              <div className="meta-box-val-row">
                                <span className="meta-date-val deadline-highlight">{task.dueDate}</span>
                              </div>
                              <span className="meta-box-sub">
                                {isCompleted ? 'Delivered on schedule' : 'Milestone target date'}
                              </span>
                            </div>
                          </div>

                          {/* How Much Work Done Breakdown */}
                          <div className="expanded-work-card">
                            <div className="work-card-header">
                              <span className="work-card-title">Work Done & Time Breakdown</span>
                              <span className="work-card-hours">
                                <strong>{(task.actualLoggedHours || 0).toFixed(1)}h logged</strong> / {task.estimatedHours}h est. ({Math.max(0, task.estimatedHours - (task.actualLoggedHours || 0)).toFixed(1)}h remaining)
                              </span>
                            </div>
                            {task.workNotes && (
                              <div className="work-notes-box">
                                <span className="notes-label">Engineering Work Notes:</span>
                                <p className="notes-content">{task.workNotes}</p>
                              </div>
                            )}

                            {/* Logged Work History (Time & Activity Trail) */}
                            <div className="task-logs-history-section">
                              <div className="logs-history-header">
                                <div className="logs-history-title-wrap">
                                  <span className="logs-history-title">Logged Work & Time History</span>
                                  <span className="logs-history-count-badge">
                                    {taskLogs.length} {taskLogs.length === 1 ? 'entry' : 'entries'}
                                  </span>
                                </div>
                                <span className="logs-history-total">
                                  Total Logged: <strong>{(task.actualLoggedHours || 0).toFixed(1)}h</strong>
                                </span>
                              </div>

                              {taskLogs.length > 0 ? (
                                <div className="task-logs-timeline">
                                  {taskLogs.map(log => {
                                    const logger = employees.find(e => e.id === log.employeeId);
                                    return (
                                      <div key={log.id} className="task-log-entry">
                                        <div className="task-log-entry-meta">
                                          <span className="task-log-hours-pill">+{Number(log.hours).toFixed(1)}h logged</span>
                                          <span className="task-log-date">{log.date}</span>
                                          {logger && (
                                            <div className="task-log-author-chip" title={`Logged by ${logger.name}`}>
                                              <img src={logger.avatar} alt={logger.name} className="task-log-author-img" />
                                              <span className="task-log-author-name">{logger.name}</span>
                                            </div>
                                          )}
                                        </div>
                                        <p className="task-log-summary">{log.summary}</p>
                                        {log.blockers && (
                                          <div className="task-log-blocker-row">
                                            <span className="blocker-pill">Blocker</span>
                                            <span className="blocker-text">{log.blockers}</span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="task-logs-empty">
                                  <span>No work sessions logged yet for this task. Click <strong>Log Hours</strong> above to record work completed.</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Task Description & Specifications */}
                          <div className="expanded-desc-card">
                            <span className="desc-card-title">Task Scope & Specifications</span>
                            <p className="desc-card-text">{task.description}</p>
                            <div className="desc-card-tags">
                              <span className="scope-tag">Domain: <strong>{task.category}</strong></span>
                              <span className="scope-tag">Project: <strong>{task.projectName}</strong></span>
                            </div>
                          </div>

                          {/* Quality Verification Stamp (if completed) */}
                          {isCompleted && task.completedProperly && (
                            <div className="task-quality-stamp">
                              <div className="quality-text">
                                <strong>Completed Properly ({task.qualityScore || 98}%)</strong>
                                <span>{task.qaNotes || "Verified by Lead Architect • Zero rework required"}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* SUB-TAB 2: ASSIGNED BY YOU (DELEGATED TASKS TRACKER) */}
        {/* =================================================================== */}
        {subTab === 'delegated' && (
          <div className="tab-pane-fade">
            {/* Top Scorecard Summary */}
            <div className="delegated-summary-row">
              <div className="delegated-kpi-card">
                <div className="kpi-icon-badge kpi-badge-total">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <div>
                  <div className="kpi-num">{tasksAssignedByMe.length}</div>
                  <div className="kpi-lbl">Total Delegated Tasks</div>
                </div>
              </div>

              <div className="delegated-kpi-card">
                <div className="kpi-icon-badge kpi-badge-inprogress">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                </div>
                <div>
                  <div className="kpi-num">{delegatedInProgress}</div>
                  <div className="kpi-lbl">Actively in Progress</div>
                </div>
              </div>

              <div className="delegated-kpi-card">
                <div className="kpi-icon-badge kpi-badge-pending">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div>
                  <div className="kpi-num">{delegatedPending}</div>
                  <div className="kpi-lbl">Pending Kickoff</div>
                </div>
              </div>

              <div className="delegated-kpi-card">
                <div className="kpi-icon-badge kpi-badge-completed">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <div>
                  <div className="kpi-num">{delegatedCompleted}</div>
                  <div className="kpi-lbl">Verified Completed</div>
                </div>
              </div>

              <div className="delegated-kpi-card">
                <div className="kpi-icon-badge kpi-badge-hours">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 10"></polyline></svg>
                </div>
                <div>
                  <div className="kpi-num">{delegatedTotalHours.toFixed(1)}h / {delegatedEstHours.toFixed(0)}h</div>
                  <div className="kpi-lbl">Logged vs Estimated</div>
                </div>
              </div>
            </div>

            {/* Filter Toolbar */}
            <div className="tasks-filter-toolbar">
              <div className="filter-chips-group">
                <button 
                  className={`filter-chip ${delegatedFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setDelegatedFilter('all')}
                >
                  All Delegated ({tasksAssignedByMe.length})
                </button>
                <button 
                  className={`filter-chip ${delegatedFilter === 'in_progress' ? 'active' : ''}`}
                  onClick={() => setDelegatedFilter('in_progress')}
                >
                  In Progress ({delegatedInProgress})
                </button>
                <button 
                  className={`filter-chip ${delegatedFilter === 'pending' ? 'active' : ''}`}
                  onClick={() => setDelegatedFilter('pending')}
                >
                  Pending Kickoff ({delegatedPending})
                </button>
                <button 
                  className={`filter-chip ${delegatedFilter === 'completed' ? 'active' : ''}`}
                  onClick={() => setDelegatedFilter('completed')}
                >
                  Completed ({delegatedCompleted})
                </button>
                <button 
                  className={`filter-chip ${delegatedFilter === 'urgent' ? 'active' : ''}`}
                  onClick={() => setDelegatedFilter('urgent')}
                >
                  Urgent & High ({tasksAssignedByMe.filter(t => t.priority === 'urgent' || t.priority === 'high').length})
                </button>
              </div>

              <div className="tasks-toolbar-right">
                <div className="tasks-search-wrap">
                  <svg className="search-icon-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input 
                    type="text" 
                    className="tasks-search-input"
                    placeholder="Search by task, assignee, or ID..."
                    value={delegatedSearch}
                    onChange={(e) => setDelegatedSearch(e.target.value)}
                  />
                  {delegatedSearch && (
                    <button className="clear-search-btn" onClick={() => setDelegatedSearch('')}>×</button>
                  )}
                </div>

                <button 
                  type="button" 
                  className="btn-cwt-assign-shortcut"
                  onClick={() => setSubTab('assign')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  <span>Assign New Task</span>
                </button>
              </div>
            </div>

            {/* Delegated Tasks Table */}
            {filteredDelegatedTasks.length === 0 ? (
              <div className="tasks-empty-state">
                <div className="empty-icon-wrap">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <polyline points="17 11 19 13 23 9"></polyline>
                  </svg>
                </div>
                <h3>{tasksAssignedByMe.length === 0 ? "You haven't assigned any tasks yet" : "No delegated tasks match your filter"}</h3>
                <p>
                  {tasksAssignedByMe.length === 0 
                    ? "Assign tasks to your subordinates and track their kickoff, progress, and hours here."
                    : "Try adjusting your search query or filter selection."}
                </p>
                <button 
                  type="button" 
                  className="btn-empty-assign" 
                  onClick={() => setSubTab('assign')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span>Assign New Task</span>
                </button>
              </div>
            ) : (
              <div className="delegated-tasks-container">
                <div className="delegated-table-card">
                  <table className="delegated-table">
                    <thead>
                      <tr>
                        <th>Task ID</th>
                        <th>Task Details & Workstream</th>
                        <th>Assigned To</th>
                        <th>Priority</th>
                        <th>Logged / Est</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDelegatedTasks.map(task => {
                        const targetId = task.assignedTo || task.assigned_to;
                        const target = employees.find(e => e.id === targetId || e.email === targetId);
                        const isExpanded = !!expandedDelegatedTasks[task.id];
                        const actualHours = Number(task.actualLoggedHours ?? task.actual_logged_hours ?? 0);
                        const estHours = Number(task.estimatedHours ?? task.estimated_hours ?? 8);
                        const progressPct = estHours > 0 
                          ? Math.min(100, Math.round((actualHours / estHours) * 100))
                          : 0;
                        const taskLogs = (dailyUpdates || []).filter(l => l.taskId === task.id || l.task_id === task.id);
                        const taskDueDate = task.dueDate || task.due_date || 'Ongoing';
                        const startedTimeDisplay = task.startedTime || task.started_time;

                        return (
                          <React.Fragment key={task.id}>
                            <tr className={`delegated-row ${isExpanded ? 'row-expanded' : ''}`}>
                              <td className="cell-task-id">
                                <span className="id-pill">{task.id}</span>
                              </td>

                              <td className="cell-task-title">
                                <div className="delegated-title-text">{task.title}</div>
                                <div className="delegated-meta-sub">
                                  <span className="project-badge">{task.projectName || task.project_name || 'CWT Platform'}</span>
                                  <span className="category-dot">•</span>
                                  <span className="category-text">{task.category || 'Engineering'}</span>
                                </div>
                              </td>

                              <td className="cell-assignee">
                                <div className="assignee-card-cell">
                                  <img 
                                    src={target?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"} 
                                    alt={target?.name || 'Assignee'} 
                                    className="assignee-avatar-img"
                                  />
                                  <div className="assignee-info">
                                    <div className="assignee-name">{target?.name || targetId}</div>
                                    <div className="assignee-role-line">
                                      <span className="assignee-role">{target?.role || 'Team Member'}</span>
                                      {target?.level && (
                                        <span className="assignee-tier-tag">L{target.level}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="cell-priority">
                                <span className={`task-priority-pill pill-${task.priority}`}>
                                  {task.priority?.toUpperCase()}
                                </span>
                              </td>

                              <td className="cell-progress">
                                <div className="progress-cell-content">
                                  <div className="progress-hours-text">
                                    <strong>{actualHours.toFixed(1)}h</strong> / {estHours}h
                                  </div>
                                  <div className="progress-track-mini">
                                    <div 
                                      className={`progress-fill-mini ${task.status === 'completed' ? 'fill-completed' : 'fill-active'}`}
                                      style={{ width: `${progressPct}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>

                              <td className="cell-date">
                                <div className="date-main-text">{taskDueDate}</div>
                                {startedTimeDisplay && (
                                  <div className="started-sub-text">Started: {startedTimeDisplay}</div>
                                )}
                              </td>

                              <td className="cell-status">
                                <span className={`status-pill pill-status-${task.status}`}>
                                  {task.status === 'completed' ? '✓ Completed' : task.status === 'in_progress' ? '⚡ In Progress' : '⏳ Pending'}
                                </span>
                              </td>

                              <td className="cell-action">
                                <button 
                                  type="button" 
                                  className={`btn-view-details ${isExpanded ? 'active' : ''}`}
                                  onClick={() => toggleExpandDelegated(task.id)}
                                >
                                  <span>{isExpanded ? 'Close' : 'Details'}</span>
                                  <svg className={`chevron-svg ${isExpanded ? 'rotated' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                  </svg>
                                </button>
                              </td>
                            </tr>

                            {/* Expandable Details Drawer */}
                            {isExpanded && (
                              <tr className="delegated-expanded-tr">
                                <td colSpan="8">
                                  <div className="delegated-details-drawer">
                                    <div className="details-drawer-grid">
                                      <div className="drawer-col-desc">
                                        <h4>Task Description & Directives</h4>
                                        <p>{task.description || "Complete implementation as per CWT engineering specifications."}</p>
                                        
                                        {task.workNotes && (
                                          <div className="drawer-work-notes">
                                            <strong>Assignee Notes:</strong>
                                            <p>{task.workNotes}</p>
                                          </div>
                                        )}
                                      </div>

                                      <div className="drawer-col-meta">
                                        <h4>Assignment & Kickoff Metadata</h4>
                                        <div className="meta-list">
                                          <div className="meta-row">
                                            <span className="meta-k">Assigned By:</span>
                                            <span className="meta-v">{activeEmployee?.name} (You)</span>
                                          </div>
                                          <div className="meta-row">
                                            <span className="meta-k">Assigned Date:</span>
                                            <span className="meta-v">{task.assignedDate || '2026-09-28'}</span>
                                          </div>
                                          <div className="meta-row">
                                            <span className="meta-k">Kickoff Status:</span>
                                            <span className="meta-v">
                                              {task.status === 'pending' 
                                                ? '⏳ Waiting for assignee to accept & start'
                                                : `⚡ Accepted & Started ${task.startedAt || task.startedTime || 'Active'}`}
                                            </span>
                                          </div>
                                          {task.status === 'completed' && (
                                            <div className="meta-row">
                                              <span className="meta-k">Completion Date:</span>
                                              <span className="meta-v">✓ {task.completedDate || 'Completed'}</span>
                                            </div>
                                          )}
                                        </div>

                                        {/* Logged Daily Updates Snippet */}
                                        {taskLogs.length > 0 && (
                                          <div className="drawer-logs-section">
                                            <h4>Submitted Worklogs ({taskLogs.length})</h4>
                                            {taskLogs.map(log => (
                                              <div key={log.id} className="drawer-log-item">
                                                <div className="drawer-log-hdr">
                                                  <span>{log.date}</span>
                                                  <strong>+{log.hours}h</strong>
                                                </div>
                                                <p className="drawer-log-summary">{log.summary}</p>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* SUB-TAB 3: ASSIGN WORK (HIERARCHY DELEGATION) */}
        {/* =================================================================== */}
        {subTab === 'assign' && (
          <div className="tab-pane-fade">
            {/* Hierarchy Authority Banner */}
            <div className="hierarchy-authority-banner">
              <div className="hierarchy-badge-circle">
                <span>L{userLevel}</span>
              </div>
              <div className="hierarchy-banner-content">
                <div className="hierarchy-banner-title">
                  Organizational Hierarchy Authority: {activeEmployee?.levelName}
                </div>
                <p className="hierarchy-banner-desc">
                  Under CWT Engineering Governance, employee level defines work assignment permissions. 
                  You are authorized to assign work to <strong>Tier {userLevel} and below</strong> ({eligibleAssignees.length} eligible team members). 
                  Delegation upward to superiors (Levels &lt; {userLevel}) is restricted by corporate protocol.
                </p>
                <div className="hierarchy-tags-row">
                  <span className="hierarchy-stat-tag">
                    Eligible Assignees: <strong>{eligibleAssignees.map(e => e.name).join(', ')}</strong>
                  </span>
                  {blockedAssignees.length > 0 && (
                    <span className="hierarchy-stat-tag blocked-tag">
                      Superiors (Protected): <strong>{blockedAssignees.map(e => e.name).join(', ')}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Assignment Form & Side Preview */}
            <div className="assign-form-layout">
              <div className="assign-form-card">
                <div className="form-card-header">
                  <h3 className="form-title">Assign New Engineering Task</h3>
                  <span className="form-subtitle">Assign work down the hierarchy with milestones and SLAs</span>
                </div>

                <form onSubmit={handleCreateTask} className="cwt-task-form">
                  {/* Task Title */}
                  <div className="form-field-group">
                    <label className="field-label" htmlFor="task-title-input">
                      Task Title & Milestone <span className="req-star">*</span>
                    </label>
                    <input 
                      id="task-title-input"
                      type="text" 
                      className="cwt-input"
                      placeholder="e.g. Implement Delta Live Tables Pipeline for Customs CusDec"
                      value={newTaskForm.title}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                      required
                    />
                  </div>

                  {/* Assignee Selection (Hierarchy Filtered) */}
                  <div className="form-grid-2col">
                    <div className="form-field-group">
                      <label className="field-label" htmlFor="assignee-select">
                        Assignee (Hierarchy Authorized) <span className="req-star">*</span>
                      </label>
                      <select 
                        id="assignee-select"
                        className="cwt-select"
                        value={newTaskForm.assignedTo}
                        onChange={(e) => setNewTaskForm({ ...newTaskForm, assignedTo: e.target.value })}
                        required
                      >
                        <optgroup label="Authorized Assignees (Subordinates & Peers)">
                          {eligibleAssignees.map(emp => (
                            <option key={emp.id} value={emp.id}>
                              {emp.name} — {emp.role} (Tier L{emp.level})
                            </option>
                          ))}
                        </optgroup>
                        {blockedAssignees.length > 0 && (
                          <optgroup label="Higher Hierarchy Tiers (Requires Upward Escalation)">
                            {blockedAssignees.map(emp => (
                              <option key={emp.id} value={emp.id} disabled>
                                {emp.name} — {emp.role} (Tier L{emp.level} Superior)
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                      <span className="field-hint">
                        Only subordinates and same-tier peers can be assigned directly.
                      </span>
                    </div>

                    {/* Enterprise Project */}
                    <div className="form-field-group">
                      <label className="field-label" htmlFor="project-select">
                        Client / Enterprise Workstream <span className="req-star">*</span>
                      </label>
                      <select 
                        id="project-select"
                        className="cwt-select"
                        value={newTaskForm.projectId}
                        onChange={(e) => setNewTaskForm({ ...newTaskForm, projectId: e.target.value })}
                      >
                        {projects.map(proj => (
                          <option key={proj.id} value={proj.id}>
                            {proj.name} ({proj.client})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Domain Category & Priority */}
                  <div className="form-grid-3col">
                    <div className="form-field-group">
                      <label className="field-label" htmlFor="category-select">Domain Category</label>
                      <select 
                        id="category-select"
                        className="cwt-select"
                        value={newTaskForm.category}
                        onChange={(e) => setNewTaskForm({ ...newTaskForm, category: e.target.value })}
                      >
                        <option value="Modern Data Platform">Modern Data Platform</option>
                        <option value="Business Intelligence">Business Intelligence & Power BI</option>
                        <option value="UI Architecture">UI Architecture & Frontend</option>
                        <option value="Cloud & Security">Cloud & Security</option>
                        <option value="QA Automation">QA Automation & Regression</option>
                      </select>
                    </div>

                    <div className="form-field-group">
                      <label className="field-label" htmlFor="priority-select">Priority SLA</label>
                      <select 
                        id="priority-select"
                        className="cwt-select"
                        value={newTaskForm.priority}
                        onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value })}
                      >
                        <option value="urgent">🔴 Urgent (24-48h)</option>
                        <option value="high">🟠 High (This Sprint)</option>
                        <option value="medium">🔵 Medium (Scheduled)</option>
                        <option value="low">⚪ Low (Backlog)</option>
                      </select>
                    </div>

                    <div className="form-field-group">
                      <label className="field-label" htmlFor="hours-est-input">Estimated Hours</label>
                      <input 
                        id="hours-est-input"
                        type="number" 
                        min="1" 
                        max="80" 
                        className="cwt-input"
                        value={newTaskForm.estimatedHours}
                        onChange={(e) => setNewTaskForm({ ...newTaskForm, estimatedHours: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Deadline & Due Date */}
                  <div className="form-field-group">
                    <label className="field-label" htmlFor="due-date-input">
                      Target Completion Date <span className="req-star">*</span>
                    </label>
                    <input 
                      id="due-date-input"
                      type="date" 
                      className="cwt-input"
                      value={newTaskForm.dueDate}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
                      required
                    />
                  </div>

                  {/* Task Description */}
                  <div className="form-field-group">
                    <label className="field-label" htmlFor="task-desc-input">
                      Acceptance Criteria & Technical Instructions
                    </label>
                    <textarea 
                      id="task-desc-input"
                      rows="3" 
                      className="cwt-textarea"
                      placeholder="Outline acceptance criteria, required data models, unit test coverage, and documentation requirements..."
                      value={newTaskForm.description}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <div className="form-actions-row">
                    <button type="submit" className="btn-cwt-primary btn-submit-task">
                      <span>✓ Authorize & Assign Work</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Hierarchy Tree & Information Card */}
              <div className="hierarchy-tree-card">
                <div className="tree-card-header">
                  <h4 className="tree-card-title">CWT Reporting Hierarchy</h4>
                  <span className="tree-card-sub">Active Delegation Chain</span>
                </div>

                <div className="hierarchy-list">
                  {employees.map(emp => {
                    const isSelf = emp.id === currentUser;
                    const isLower = emp.level > userLevel;
                    const isPeer = emp.level === userLevel && !isSelf;
                    const isHigher = emp.level < userLevel;

                    return (
                      <div 
                        key={emp.id} 
                        className={`hierarchy-emp-node ${isSelf ? 'node-self' : ''} ${isHigher ? 'node-higher' : ''}`}
                      >
                        <div className="node-avatar-wrap">
                          <img src={emp.avatar} alt={emp.name} className="node-avatar" />
                          <span className={`node-level-tag level-${emp.level}`}>L{emp.level}</span>
                        </div>
                        <div className="node-info">
                          <div className="node-name">
                            {emp.name} {isSelf && <span className="node-you-tag">YOU</span>}
                          </div>
                          <div className="node-role">{emp.role}</div>
                          <div className="node-dept">{emp.department}</div>
                        </div>
                        <div className="node-permission-badge">
                          {isSelf ? (
                            <span className="perm-pill perm-self">Self</span>
                          ) : isHigher ? (
                            <span className="perm-pill perm-locked">🔒 Superior</span>
                          ) : isPeer ? (
                            <span className="perm-pill perm-peer">Peer</span>
                          ) : (
                            <span className="perm-pill perm-allowed">✓ Assignable</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Link Banner to Delegated Tasks Tab */}
            <div className="delegation-tracker-banner">
              <div className="delegation-tracker-banner-left">
                <div className="tracker-banner-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <div>
                  <div className="tracker-banner-title">
                    Track Your Delegated Workstreams ({tasksAssignedByMe.length} Tasks)
                  </div>
                  <div className="tracker-banner-desc">
                    View live status, kickoff timestamps, progress bars, and logged hours for tasks you have assigned.
                  </div>
                </div>
              </div>
              <button 
                type="button" 
                className="btn-tracker-banner"
                onClick={() => setSubTab('delegated')}
              >
                <span>View Assigned by You Tab</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* SUB-TAB 3: PERFORMANCE & QUALITY GRAPH */}
        {/* =================================================================== */}
        {subTab === 'graph' && (
          <div className="tab-pane-fade">
            {/* Top Scorecard Row */}
            <div className="quality-scorecard-grid">
              <div className="scorecard-item">
                <div className="scorecard-icon kpi-teal">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <div className="scorecard-body">
                  <span className="scorecard-value">{properlyCompletedCount} / {myTasks.length}</span>
                  <span className="scorecard-title">Tasks Completed Properly</span>
                  <span className="scorecard-sub">
                    {hasCompletedTasks ? "Zero rework & QA pass first time" : (hasAssignedTasks ? "Tasks currently in progress" : "No tasks assigned yet")}
                  </span>
                </div>
              </div>

              <div className="scorecard-item">
                <div className="scorecard-icon kpi-blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                </div>
                <div className="scorecard-body">
                  <span className="scorecard-value">{properlyRate !== null ? `${properlyRate}%` : "—"}</span>
                  <span className="scorecard-title">Proper Completion Rate</span>
                  <span className="scorecard-sub">
                    {properlyRate !== null ? "Enterprise accuracy benchmark" : (hasAssignedTasks ? "Pending task completion" : "No tasks assigned yet")}
                  </span>
                </div>
              </div>

              <div className="scorecard-item">
                <div className="scorecard-icon kpi-purple">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div className="scorecard-body">
                  <span className="scorecard-value">{turnaroundMetrics.value}</span>
                  <span className="scorecard-title">Average Turnaround Speed</span>
                  <span className="scorecard-sub">{turnaroundMetrics.sub}</span>
                </div>
              </div>

              <div className="scorecard-item">
                <div className="scorecard-icon kpi-orange">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                </div>
                <div className="scorecard-body">
                  <span className="scorecard-value">{qualityMetrics.value}</span>
                  <span className="scorecard-title">Lead Architect Quality Index</span>
                  <span className="scorecard-sub">{qualityMetrics.sub}</span>
                </div>
              </div>
            </div>

            {/* If completed tasks exist, render real velocity charts and audit table */}
            {hasCompletedTasks && userPerf ? (
              <>
                <div className="quality-charts-grid">
                  {/* Chart 1: Sprint / Task Velocity & Completed Properly (SVG) */}
                  <div className="chart-panel-card">
                    <div className="chart-header">
                      <div>
                        <h3 className="chart-title">Task Completion & Quality Velocity</h3>
                        <span className="chart-sub">
                          Real performance tracking across completed engineering tasks
                        </span>
                      </div>
                      <div className="chart-legend">
                        <span className="legend-item">
                          <span className="legend-box box-teal"></span> Properly Completed
                        </span>
                        <span className="legend-item">
                          <span className="legend-box box-blue"></span> Total Assigned
                        </span>
                        <span className="legend-item">
                          <span className="legend-box box-amber"></span> Quality Rate %
                        </span>
                      </div>
                    </div>

                    {/* SVG Visual Graph */}
                    <div className="svg-chart-container">
                      <svg viewBox="0 0 700 280" className="velocity-svg">
                        {/* Background Grid Lines */}
                        {[40, 90, 140, 190, 240].map((y, idx) => (
                          <g key={idx}>
                            <line x1="60" y1={y} x2="680" y2={y} stroke="rgba(16, 62, 124, 0.08)" strokeDasharray="4 4" />
                            <text x="45" y={y + 4} fill="#64748b" fontSize="11" textAnchor="end">
                              {Math.round((240 - y) / 20)}
                            </text>
                          </g>
                        ))}

                        {/* Real Sprints / Tasks Data Bars */}
                        {userPerf.sprints.map((sprintName, idx) => {
                          const totalAssigned = userPerf.totalAssigned[idx] || 1;
                          const properlyDone = userPerf.completedProperly[idx] || 1;
                          const qualityPct = userPerf.qualityScorePct[idx] || 98;
                          const taskLabel = userPerf.sprintLabels ? userPerf.sprintLabels[idx] : sprintName;

                          const groupWidth = 620 / Math.max(userPerf.sprints.length, 1);
                          const groupX = 80 + idx * groupWidth;
                          const barWidth = 26;

                          const maxVal = Math.max(...userPerf.totalAssigned, 1);
                          const scale = 140 / Math.max(maxVal, 1);

                          const heightAssigned = Math.max(totalAssigned * scale, 16);
                          const heightProperly = Math.max(properlyDone * scale, 16);

                          const yAssigned = 240 - heightAssigned;
                          const yProperly = 240 - heightProperly;

                          const isHovered = hoveredSprint === idx;

                          return (
                            <g 
                              key={sprintName + idx}
                              onMouseEnter={() => setHoveredSprint(idx)}
                              onMouseLeave={() => setHoveredSprint(null)}
                              className="chart-bar-group"
                              style={{ cursor: 'pointer' }}
                            >
                              {/* Total Assigned Bar */}
                              <rect 
                                x={groupX} 
                                y={yAssigned} 
                                width={barWidth} 
                                height={heightAssigned} 
                                rx="4" 
                                fill={isHovered ? "#0d47a1" : "#1976d2"}
                                opacity="0.85"
                              />

                              {/* Properly Completed Bar */}
                              <rect 
                                x={groupX + barWidth + 4} 
                                y={yProperly} 
                                width={barWidth} 
                                height={heightProperly} 
                                rx="4" 
                                fill={isHovered ? "#00695c" : "#00897b"}
                              />

                              {/* X-Axis Task / Sprint Label */}
                              <text 
                                x={groupX + barWidth} 
                                y="262" 
                                fill="#14233c" 
                                fontSize="11" 
                                fontWeight="600" 
                                textAnchor="middle"
                              >
                                {sprintName.replace(' (Current)', '')}
                              </text>

                              {/* Hover Tooltip Card */}
                              {isHovered && (
                                <g className="chart-tooltip">
                                  <rect 
                                    x={groupX - 40} 
                                    y={Math.min(yProperly, yAssigned) - 52} 
                                    width="140" 
                                    height="46" 
                                    rx="6" 
                                    fill="#0a192f" 
                                    filter="drop-shadow(0 4px 12px rgba(0,0,0,0.25))"
                                  />
                                  <text 
                                    x={groupX + 30} 
                                    y={Math.min(yProperly, yAssigned) - 34} 
                                    fill="#ffffff" 
                                    fontSize="10" 
                                    fontWeight="700" 
                                    textAnchor="middle"
                                  >
                                    {(taskLabel || sprintName).slice(0, 22)}
                                  </text>
                                  <text 
                                    x={groupX + 30} 
                                    y={Math.min(yProperly, yAssigned) - 18} 
                                    fill="#4dd0e1" 
                                    fontSize="10" 
                                    textAnchor="middle"
                                  >
                                    {properlyDone}/{totalAssigned} Proper ({qualityPct}%)
                                  </text>
                                </g>
                              )}
                            </g>
                          );
                        })}

                        {/* Trend Polyline for Quality Score */}
                        <path
                          d={userPerf.sprints.map((_, idx) => {
                            const groupWidth = 620 / Math.max(userPerf.sprints.length, 1);
                            const x = 80 + idx * groupWidth + 28;
                            const score = userPerf.qualityScorePct[idx] || 98;
                            const y = 240 - ((score - 80) / 20) * 160;
                            return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                          }).join(' ')}
                          fill="none"
                          stroke="#f57c00"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />

                        {/* Trend Points */}
                        {userPerf.sprints.map((_, idx) => {
                          const groupWidth = 620 / Math.max(userPerf.sprints.length, 1);
                          const x = 80 + idx * groupWidth + 28;
                          const score = userPerf.qualityScorePct[idx] || 98;
                          const y = 240 - ((score - 80) / 20) * 160;
                          return (
                            <circle 
                              key={idx} 
                              cx={x} 
                              cy={y} 
                              r="5" 
                              fill="#ffffff" 
                              stroke="#f57c00" 
                              strokeWidth="3" 
                            />
                          );
                        })}
                      </svg>
                    </div>
                  </div>

                  {/* Chart 2: Task Execution Quality Donut / Radial Breakdown */}
                  <div className="chart-panel-card">
                    <div className="chart-header">
                      <div>
                        <h3 className="chart-title">Quality Verification Distribution</h3>
                        <span className="chart-sub">Breakdown of work verified first-time vs revisions</span>
                      </div>
                    </div>

                    <div className="donut-chart-wrap">
                      <div className="donut-center-metric">
                        <span className="donut-big-val">{properlyRate}%</span>
                        <span className="donut-sub-text">Proper First-Time</span>
                      </div>

                      <svg viewBox="0 0 160 160" className="donut-svg">
                        {/* Background Ring */}
                        <circle cx="80" cy="80" r="60" fill="none" stroke="#edf4fc" strokeWidth="18" />
                        
                        {/* Completed Properly Arc */}
                        <circle 
                          cx="80" 
                          cy="80" 
                          r="60" 
                          fill="none" 
                          stroke="#00897b" 
                          strokeWidth="18"
                          strokeDasharray={`${(properlyRate / 100) * 377} 377`}
                          strokeDashoffset="0"
                          strokeLinecap="round"
                          transform="rotate(-90 80 80)"
                        />

                        {/* Revision Arc (if any) */}
                        {100 - properlyRate > 0 && (
                          <circle 
                            cx="80" 
                            cy="80" 
                            r="60" 
                            fill="none" 
                            stroke="#f57c00" 
                            strokeWidth="18"
                            strokeDasharray={`${((100 - properlyRate) / 100) * 377} 377`}
                            strokeDashoffset={`-${(properlyRate / 100) * 377}`}
                            strokeLinecap="round"
                            transform="rotate(-90 80 80)"
                          />
                        )}
                      </svg>
                    </div>

                    {/* Donut Legend */}
                    <div className="donut-breakdown-list">
                      <div className="breakdown-row">
                        <div className="breakdown-bullet dot-teal"></div>
                        <span className="breakdown-name">Completed Properly (Zero Rework)</span>
                        <span className="breakdown-pct">{properlyRate}% ({properlyCompletedCount})</span>
                      </div>
                      <div className="breakdown-row">
                        <div className="breakdown-bullet dot-orange"></div>
                        <span className="breakdown-name">Revisions or Adjustments</span>
                        <span className="breakdown-pct">{100 - properlyRate > 0 ? (100 - properlyRate) : 0}% ({completedMyTasks.length - properlyCompletedCount})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quality Verification Audit Table */}
                <div className="quality-audit-section">
                  <div className="section-header-compact">
                    <h3 className="section-title">Verified Task Quality Records</h3>
                    <span className="section-badge">Lead Architect & QA Approved</span>
                  </div>

                  <div className="quality-audit-table-wrap">
                    <table className="cwt-table">
                      <thead>
                        <tr>
                          <th>Task / Milestone</th>
                          <th>Turnaround & SLA</th>
                          <th>Verified By</th>
                          <th>Quality Score</th>
                          <th>QA Notes & Benchmark</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userPerf.qualityFeedback && userPerf.qualityFeedback.length > 0 ? (
                          userPerf.qualityFeedback.map((fb, idx) => (
                            <tr key={idx}>
                              <td className="cell-task">
                                <strong>{fb.task}</strong>
                              </td>
                              <td>
                                <span className="audit-turnaround-pill">{fb.turnaround}</span>
                              </td>
                              <td>
                                <div className="audit-verifier-pill">🛡️ {fb.reviewer}</div>
                              </td>
                              <td>
                                <span className="audit-score-badge">{fb.score}</span>
                              </td>
                              <td className="cell-notes">
                                <span className="audit-status-tag">{fb.status}</span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="text-center py-4">No verified records yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              /* Themed Empty State when no completed tasks exist */
              <div className="tasks-empty-state performance-empty-state">
                <div className="empty-icon-wrap">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                </div>
                <h3>No Task Performance History Yet</h3>
                <p>
                  {hasAssignedTasks 
                    ? "You have assigned tasks currently in progress. Complete your tasks and submit them for review to generate velocity graphs, accuracy distributions, and quality audit logs."
                    : "No engineering tasks have been assigned to you yet. Performance graphs, velocity metrics, and quality verification logs will appear automatically once tasks are assigned and completed."}
                </p>
                <button 
                  type="button" 
                  className="btn-empty-assign" 
                  onClick={() => setSubTab('tasks')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                  <span>{hasAssignedTasks ? "View In-Progress Tasks" : "Check Task Directory"}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* SUB-TAB 4: DAILY UPDATE (WORK & TIME LOGGER) */}
        {/* =================================================================== */}
        {subTab === 'daily' && (
          <div className="tab-pane-fade">
            {/* Daily Hours Progress Bar Card */}
            <div className="daily-progress-banner">
              <div className="daily-banner-left">
                <div className="daily-clock-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div>
                  <h3 className="daily-banner-title">
                    Today's Engineering Log: <strong>{todayLoggedHours.toFixed(1)} / 8.0 Hours</strong>
                  </h3>
                  <p className="daily-banner-sub">
                    Target capacity: 8 hours/day • Weekly accumulated: <strong>{weekLoggedHours.toFixed(1)} hours</strong>
                  </p>
                </div>
              </div>
              <div className="daily-banner-gauge">
                <div className="gauge-track">
                  <div 
                    className="gauge-fill" 
                    style={{ width: `${Math.min(100, (todayLoggedHours / 8.0) * 100)}%` }}
                  ></div>
                </div>
                <span className="gauge-text">{Math.round((todayLoggedHours / 8.0) * 100)}% Capacity Logged</span>
              </div>
            </div>

            {/* Daily Update Form & Recent Log Stream */}
            <div className="daily-layout-grid">
              {/* Log Form Card */}
              <div className="daily-form-card">
                <div className="form-card-header">
                  <h3 className="form-title">Log Daily Task & Hours</h3>
                  <span className="form-subtitle">Record what you worked on, code submitted, and time spent</span>
                </div>

                <form onSubmit={handleSubmitDailyUpdate} className="cwt-task-form">
                  {/* Date & Linked Task */}
                  <div className="form-grid-2col">
                    <div className="form-field-group">
                      <label className="field-label" htmlFor="daily-date-input">Log Date</label>
                      <input 
                        id="daily-date-input"
                        type="date" 
                        className="cwt-input"
                        value={dailyForm.date}
                        onChange={(e) => setDailyForm({ ...dailyForm, date: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-field-group">
                      <label className="field-label" htmlFor="daily-task-select">
                        Associated Task / Milestone <span className="req-star">*</span>
                      </label>
                      <select 
                        id="daily-task-select"
                        className="cwt-select"
                        value={dailyForm.taskId}
                        onChange={(e) => setDailyForm({ ...dailyForm, taskId: e.target.value })}
                        required
                      >
                        <optgroup label="Your Assigned Tasks">
                          {myTasks.map(t => (
                            <option key={t.id} value={t.id}>
                              {t.id}: {t.title.slice(0, 45)}...
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="General / Engineering Operations">
                          <option value="ad-hoc">Ad-Hoc Architecture / Code Review / Sprint Planning</option>
                          <option value="support">Client Support / Production Incident Resolution</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  {/* Hours Input & Quick Buttons */}
                  <div className="form-field-group">
                    <label className="field-label" htmlFor="daily-hours-input">
                      Hours Spent on Task <span className="req-star">*</span>
                    </label>
                    <div className="hours-input-row">
                      <input 
                        id="daily-hours-input"
                        type="number" 
                        step="0.5" 
                        min="0.5" 
                        max="16" 
                        className="cwt-input hours-number-input"
                        value={dailyForm.hours}
                        onChange={(e) => setDailyForm({ ...dailyForm, hours: e.target.value })}
                        required
                      />
                      <div className="quick-hour-buttons">
                        {[0.5, 1.0, 2.0, 4.0, 7.5, 8.0].map(h => (
                          <button 
                            key={h} 
                            type="button" 
                            className={`hour-preset-btn ${Number(dailyForm.hours) === h ? 'active' : ''}`}
                            onClick={() => handleQuickAddHours(h)}
                          >
                            +{h}h
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Work Summary */}
                  <div className="form-field-group">
                    <label className="field-label" htmlFor="daily-summary-input">
                      What Did You Accomplish? <span className="req-star">*</span>
                    </label>
                    <textarea 
                      id="daily-summary-input"
                      rows="3" 
                      className="cwt-textarea"
                      placeholder="e.g. Refactored Synapse serverless queries, verified Delta Lake partitioning, pushed PR #412..."
                      value={dailyForm.summary}
                      onChange={(e) => setDailyForm({ ...dailyForm, summary: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  {/* Blockers / Dependencies */}
                  <div className="form-field-group">
                    <label className="field-label" htmlFor="daily-blockers-input">
                      Blockers or Technical Dependencies (Optional)
                    </label>
                    <input 
                      id="daily-blockers-input"
                      type="text" 
                      className="cwt-input"
                      placeholder="e.g. Awaiting client firewall whitelisting on port 443..."
                      value={dailyForm.blockers}
                      onChange={(e) => setDailyForm({ ...dailyForm, blockers: e.target.value })}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="form-actions-row">
                    <button type="submit" className="btn-cwt-primary btn-submit-daily">
                      <span>✓ Save Daily Update</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Daily Work Log Timeline Stream */}
              <div className="daily-stream-card">
                <div className="stream-card-header">
                  <h4 className="stream-card-title">Daily Update History</h4>
                  <span className="stream-card-sub">{myDailyUpdates.length} Updates Logged</span>
                </div>

                <div className="daily-timeline-list">
                  {myDailyUpdates.length === 0 ? (
                    <div className="empty-sub-panel">
                      <p>No daily updates logged yet. Use the form to submit your first update.</p>
                    </div>
                  ) : (
                    myDailyUpdates.map((log) => (
                      <div key={log.id} className="timeline-entry-card">
                        <div className="entry-header">
                          <div className="entry-date-badge">
                            <span className="entry-icon">📅</span>
                            <span>{log.date}</span>
                          </div>
                          <span className="entry-hours-pill">⚡ {log.hours} Hours</span>
                        </div>

                        <div className="entry-task-name">
                          <strong>Task:</strong> {log.taskTitle}
                        </div>

                        <p className="entry-summary">{log.summary}</p>

                        {log.blockers && (
                          <div className="entry-blockers-alert">
                            <span className="alert-icon">⚠️</span>
                            <span><strong>Blocker:</strong> {log.blockers}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
