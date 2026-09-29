// ============================================================================
// Creative Web Technologies (CWT) - Enterprise Tracker Engine
// State Management, Live Stopwatch, Leave System & Turnaround Analytics
// ============================================================================

const STORAGE_KEY = "CWT_PORTAL_STATE_v1";

let state = {
  currentUser: "emp_1",
  employees: [],
  projects: [],
  tasks: [],
  leaves: [],
  activeTimer: null // { taskId, startTime, timerInterval }
};

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  initRouter();
  populateDropdowns();
  renderApp();
  initFormDates();
  setupTimerRecovery();
});

// ============================================================================
// State & LocalStorage
// ============================================================================
function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      state = JSON.parse(saved);
      // Clean up any serialized timer interval ID
      if (state.activeTimer) {
        state.activeTimer.timerInterval = null;
      }
      if (state.employees) {
        const emp1 = state.employees.find(e => e.id === "emp_1");
        if (emp1) emp1.name = "Mathivathanan";
      }
    } catch (e) {
      console.error("Failed to parse saved state, using default data.", e);
      resetToDemoData(false);
    }
  } else {
    resetToDemoData(false);
  }
}

function saveState() {
  // Avoid saving interval reference
  const toSave = {
    ...state,
    activeTimer: state.activeTimer ? {
      taskId: state.activeTimer.taskId,
      startTime: state.activeTimer.startTime
    } : null
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

function resetToDemoData(showToast = true) {
  // Clone INITIAL_DATA from data.js
  state = JSON.parse(JSON.stringify(INITIAL_DATA));
  state.activeTimer = null;
  saveState();
  populateDropdowns();
  renderApp();
  if (showToast) {
    displayToast("Workspace reset to Creative Web Technology demo data.");
  }
}

// ============================================================================
// Router & Page Navigation
// ============================================================================
function initRouter() {
  window.addEventListener("hashchange", handleHashChange);
  handleHashChange();
}

function handleHashChange() {
  const hash = window.location.hash.replace("#", "") || "home";
  const anchorEl = document.getElementById(hash);
  if (anchorEl) {
    document.querySelectorAll(".cs-nav-link").forEach(btn => btn.classList.remove("active"));
    const activeLink = document.querySelector(`.cs-nav-link[href="#${hash}"]`) || document.getElementById(`nav-${hash}`);
    if (activeLink) activeLink.classList.add("active");
    anchorEl.scrollIntoView({ behavior: "smooth" });
    return;
  }
  navigateTo(hash, false);
}

function navigateTo(pageId, updateHash = true) {
  // Single-page mode: page-home is always active
  const homeEl = document.getElementById("page-home");
  if (homeEl) homeEl.classList.add("active");

  const anchorEl = document.getElementById(pageId);
  if (anchorEl) {
    if (updateHash) {
      history.pushState(null, null, `#${pageId}`);
    }
    anchorEl.scrollIntoView({ behavior: "smooth" });
    document.querySelectorAll(".cs-nav-link").forEach(btn => btn.classList.remove("active"));
    const activeLink = document.querySelector(`.cs-nav-link[href="#${pageId}"]`) || document.getElementById(`nav-${pageId}`);
    if (activeLink) activeLink.classList.add("active");
    return;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
  document.querySelectorAll(".cs-nav-link").forEach(btn => btn.classList.remove("active"));
  const activeBtn = document.getElementById(`nav-${pageId}`) || document.getElementById("nav-home");
  if (activeBtn) activeBtn.classList.add("active");
  renderHomePage();
}

// ============================================================================
// User & Role Switching
// ============================================================================
function switchUser(userId) {
  state.currentUser = userId;
  saveState();
  updateUserNavbarUI();
  renderApp();
  const user = getCurrentUser();
  displayToast(`Switched active view to: ${user.name} (${user.role})`);
}

function getCurrentUser() {
  return state.employees.find(e => e.id === state.currentUser) || state.employees[0];
}

function updateUserNavbarUI() {
  const user = getCurrentUser();
  const avatar = document.getElementById("nav-user-avatar");
  const select = document.getElementById("user-role-select");
  if (avatar) avatar.src = user.avatar;
  if (select) select.value = user.id;
}

function populateDropdowns() {
  const userSelect = document.getElementById("user-role-select");
  const assignerSelect = document.getElementById("task-assigner-input");
  const assigneeSelect = document.getElementById("task-assignee-input");
  const leaveEmpSelect = document.getElementById("leave-emp-input");
  const taskProjectSelect = document.getElementById("task-project-input");
  const taskAssignerFilter = document.getElementById("task-assigner-filter");
  const taskAssigneeFilter = document.getElementById("task-assignee-filter");

  if (userSelect) {
    userSelect.innerHTML = state.employees.map(e => `
      <option value="${e.id}">${e.name}</option>
    `).join("");
    userSelect.value = state.currentUser;
  }

  if (assignerSelect) {
    assignerSelect.innerHTML = state.employees.map(e => `
      <option value="${e.id}">${e.name} - ${e.role}</option>
    `).join("");
  }

  if (assigneeSelect) {
    assigneeSelect.innerHTML = state.employees.map(e => `
      <option value="${e.id}">${e.name} (${e.department})</option>
    `).join("");
  }

  if (leaveEmpSelect) {
    leaveEmpSelect.innerHTML = state.employees.map(e => `
      <option value="${e.id}">${e.name}</option>
    `).join("");
  }

  if (taskProjectSelect) {
    taskProjectSelect.innerHTML = state.projects.map(p => `
      <option value="${p}">${p}</option>
    `).join("");
  }

  if (taskAssignerFilter) {
    taskAssignerFilter.innerHTML = `<option value="all">All Assigners (Who gave work)</option>` +
      state.employees.map(e => `<option value="${e.id}">Work Given By: ${e.name}</option>`).join("");
  }

  if (taskAssigneeFilter) {
    taskAssigneeFilter.innerHTML = `<option value="all">All Assignees (Employees)</option>` +
      state.employees.map(e => `<option value="${e.id}">Assigned To: ${e.name}</option>`).join("");
  }

  updateUserNavbarUI();
}

function initFormDates() {
  const today = new Date().toISOString().split("T")[0];
  const deadlineInput = document.getElementById("task-deadline-input");
  const leaveStart = document.getElementById("leave-start-date");
  const leaveEnd = document.getElementById("leave-end-date");
  const logDate = document.getElementById("log-date-input");

  if (deadlineInput) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 3);
    deadlineInput.value = nextWeek.toISOString().split("T")[0];
  }
  if (leaveStart) leaveStart.value = today;
  if (leaveEnd) leaveEnd.value = today;
  if (logDate) logDate.value = today;
}

// ============================================================================
// Render Master
// ============================================================================
function renderApp() {
  updateUserNavbarUI();
  renderHomePage();
}

// ============================================================================
// PAGE 1: HOME PAGE
// ============================================================================
function renderHomePage() {
  // 1. KPI Stats
  const activeTasks = state.tasks.filter(t => t.status === "in_progress" || t.status === "backlog");
  const completedTasks = state.tasks.filter(t => t.status === "completed");
  const pendingOrApprovedLeaves = state.leaves.filter(l => l.status === "Approved" || l.status === "Pending");

  const totalCompletedHours = completedTasks.reduce((acc, t) => acc + (t.actualLoggedHours || 0), 0);
  const avgTurnaroundHours = completedTasks.length ? (totalCompletedHours / completedTasks.length).toFixed(1) : "0";

  const kpiActive = document.getElementById("home-kpi-active-tasks");
  const kpiCompleted = document.getElementById("home-kpi-completed-tasks");
  const kpiAvg = document.getElementById("home-kpi-avg-turnaround");
  const kpiLeaves = document.getElementById("home-kpi-on-leave");

  if (kpiActive) kpiActive.textContent = activeTasks.length;
  if (kpiCompleted) kpiCompleted.textContent = completedTasks.length;
  if (kpiAvg) kpiAvg.textContent = `${avgTurnaroundHours}h avg`;
  if (kpiLeaves) kpiLeaves.textContent = pendingOrApprovedLeaves.length;

  // 2. Recent Tasks Mini List
  const recentTasksEl = document.getElementById("home-recent-tasks-list");
  if (recentTasksEl) {
    const recent = [...state.tasks].reverse().slice(0, 4);
    recentTasksEl.innerHTML = recent.map(t => {
      const statusClass = `status-${t.status}`;
      const statusLabel = formatStatus(t.status);
      return `
        <div class="activity-mini-item">
          <div class="activity-mini-content">
            <h4>${escapeHTML(t.title)}</h4>
            <div class="activity-mini-meta">
              <span class="assigner-tag">👤 Given by: ${escapeHTML(t.assignerName)}</span>
              <span>👉 Assigned to: <strong>${escapeHTML(t.assigneeName)}</strong></span>
              <span>⏱️ Logged: <strong>${t.actualLoggedHours}h</strong> / ${t.estimatedHours}h</span>
            </div>
          </div>
          <span class="status-badge ${statusClass}">${statusLabel}</span>
        </div>
      `;
    }).join("");
  }

  // 3. Upcoming Leaves Mini List
  const leavesAwayEl = document.getElementById("home-leaves-away-list");
  if (leavesAwayEl) {
    const pendingAndApproved = state.leaves.slice(0, 4);
    leavesAwayEl.innerHTML = pendingAndApproved.map(l => {
      const isApproved = l.status === "Approved";
      const statusBadge = isApproved 
        ? `<span class="status-badge" style="background:#dcfce7;color:#16a34a;">Approved</span>` 
        : `<span class="status-badge" style="background:#fef3c7;color:#d97706;">Pending</span>`;
      return `
        <div class="leave-away-item">
          <img class="leave-away-avatar" src="${l.avatar}" alt="${escapeHTML(l.employeeName)}">
          <div class="leave-away-info">
            <div class="leave-away-name">${escapeHTML(l.employeeName)}</div>
            <div class="leave-away-dates">${l.leaveType} Leave (${l.days}d) • ${formatDate(l.startDate)} - ${formatDate(l.endDate)}</div>
          </div>
          ${statusBadge}
        </div>
      `;
    }).join("");
  }
}

// ============================================================================
// PAGE 2: WORK & TASK TRACKER
// ============================================================================
function renderTasks() {
  const container = document.getElementById("tasks-grid-container");
  if (!container) return;

  const searchQuery = (document.getElementById("task-search-input")?.value || "").toLowerCase().trim();
  const statusFilter = document.getElementById("task-status-filter")?.value || "all";
  const assignerFilter = document.getElementById("task-assigner-filter")?.value || "all";
  const assigneeFilter = document.getElementById("task-assignee-filter")?.value || "all";
  const priorityFilter = document.getElementById("task-priority-filter")?.value || "all";

  const filteredTasks = state.tasks.filter(t => {
    const matchesSearch = !searchQuery || 
      t.title.toLowerCase().includes(searchQuery) ||
      t.project.toLowerCase().includes(searchQuery) ||
      t.assignerName.toLowerCase().includes(searchQuery) ||
      t.assigneeName.toLowerCase().includes(searchQuery);

    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesAssigner = assignerFilter === "all" || t.assignerId === assignerFilter;
    const matchesAssignee = assigneeFilter === "all" || t.assigneeId === assigneeFilter;
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesAssigner && matchesAssignee && matchesPriority;
  });

  if (filteredTasks.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3.5rem; background: #ffffff; border-radius: var(--radius-lg); border: 1px dashed var(--border-subtle);">
        <p style="font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 1rem;">No tasks match your current filter criteria.</p>
        <button class="btn btn-outline-primary" onclick="openAssignTaskModal()">Assign New Work</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredTasks.map(t => {
    const isCompleted = t.status === "completed";
    const priorityClass = `priority-${t.priority}`;
    const statusClass = `status-${t.status}`;
    const assigneeObj = state.employees.find(e => e.id === t.assigneeId) || {};
    const isTimerRunningOnThisTask = state.activeTimer && state.activeTimer.taskId === t.id;

    // Time & Turnaround Section
    let durationHTML = "";
    if (isCompleted) {
      durationHTML = `
        <div class="task-duration-box">
          <div class="duration-metrics">
            <span>🏁 Time Taken:</span>
            <span class="duration-turnaround">${t.completionTurnaround || (t.actualLoggedHours + " hrs")}</span>
          </div>
          <div class="duration-variance">
            Estimated: ${t.estimatedHours}h • Total Active Logged: <strong>${t.actualLoggedHours}h</strong>
          </div>
          ${t.workNotes ? `<div style="font-size:0.75rem;color:var(--text-secondary);margin-top:4px;"><em>"${escapeHTML(t.workNotes)}"</em></div>` : ""}
        </div>
      `;
    } else {
      const progressPercent = Math.min(100, Math.round(((t.actualLoggedHours || 0) / t.estimatedHours) * 100));
      durationHTML = `
        <div class="task-duration-box">
          <div class="duration-metrics">
            <span>⏱️ Active Time Logged:</span>
            <span style="color: var(--text-main); font-weight:700;">${t.actualLoggedHours || 0}h of ${t.estimatedHours}h</span>
          </div>
          <div class="quota-progress-bar" style="margin-top: 6px;">
            <div class="quota-progress-fill" style="width: ${progressPercent}%;"></div>
          </div>
        </div>
      `;
    }

    return `
      <div class="task-card">
        <div>
          <!-- Header -->
          <div class="task-card-header">
            <span class="task-project-pill">${escapeHTML(t.project)}</span>
            <span class="task-priority-badge ${priorityClass}">${t.priority}</span>
          </div>

          <!-- Title & Description -->
          <h3 class="task-title">${escapeHTML(t.title)}</h3>
          <p class="task-desc">${escapeHTML(t.description)}</p>

          <!-- WHO GAVE THE WORK (Assigner Box) -->
          <div class="task-assigner-box">
            <div class="assigner-lead">
              <span style="font-size: 1.1rem;">👔</span>
              <div>
                <span class="assigner-label">Work Given By:</span>
                <span class="assigner-name">${escapeHTML(t.assignerName)}</span>
              </div>
            </div>
            <span class="task-assigned-date">Given: ${formatDate(t.assignedAt)}</span>
          </div>

          <!-- ASSIGNED TO & DEADLINE -->
          <div class="task-meta-row">
            <div class="task-assignee">
              <img class="task-assignee-avatar" src="${assigneeObj.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}" alt="${escapeHTML(t.assigneeName)}">
              <span class="task-assignee-name">${escapeHTML(t.assigneeName)}</span>
            </div>
            <div class="task-deadline">
              📅 Due: ${formatDate(t.deadline)}
            </div>
          </div>

          <!-- Duration Box -->
          ${durationHTML}
        </div>

        <!-- Footer Actions -->
        <div>
          <div class="task-actions">
            <div>
              <select class="filter-select" style="padding: 0.35rem 0.6rem; font-size: 0.78rem;" onchange="updateTaskStatus('${t.id}', this.value)">
                <option value="backlog" ${t.status === 'backlog' ? 'selected' : ''}>Backlog</option>
                <option value="in_progress" ${t.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                <option value="in_review" ${t.status === 'in_review' ? 'selected' : ''}>Under Review</option>
                <option value="completed" ${t.status === 'completed' ? 'selected' : ''}>Completed</option>
              </select>
            </div>

            <div style="display: flex; gap: 0.4rem;">
              ${!isCompleted ? (
                isTimerRunningOnThisTask 
                ? `<button class="btn btn-sm btn-danger" onclick="stopAndLogLiveTimer()">Stop Timer</button>`
                : `<button class="btn btn-sm btn-outline-primary" onclick="startLiveTimer('${t.id}')" title="Start live stopwatch">⏱️ Start</button>`
              ) : ''}
              
              <button class="btn btn-sm btn-secondary" onclick="openLogTimeModal('${t.id}')" title="Log hours worked">
                + Log Time
              </button>

              <button class="btn btn-sm btn-secondary" onclick="openTaskHistoryModal('${t.id}')" title="View time history">
                📄 History
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// ============================================================================
// LIVE STOPWATCH ENGINE
// ============================================================================
function startLiveTimer(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  if (state.activeTimer) {
    if (state.activeTimer.taskId === taskId) {
      displayToast("Timer is already ticking on this task.");
      return;
    }
    // Prompt to switch
    if (!confirm("A timer is already running on another task. Would you like to switch to this task?")) {
      return;
    }
    clearInterval(state.activeTimer.timerInterval);
  }

  // Update task status to in_progress if in backlog
  if (task.status === "backlog") {
    task.status = "in_progress";
  }

  state.activeTimer = {
    taskId: task.id,
    startTime: Date.now(),
    timerInterval: null
  };

  saveState();
  startTimerTicker();
  renderTasks();
  displayToast(`Started live stopwatch for: "${task.title}"`);
}

function startTimerTicker() {
  const banner = document.getElementById("active-stopwatch-banner");
  const titleEl = document.getElementById("active-timer-task-title");
  const assignerEl = document.getElementById("active-timer-assigner");
  const clockEl = document.getElementById("active-timer-clock");

  if (!state.activeTimer) {
    if (banner) banner.style.display = "none";
    return;
  }

  const task = state.tasks.find(t => t.id === state.activeTimer.taskId);
  if (!task) {
    state.activeTimer = null;
    saveState();
    if (banner) banner.style.display = "none";
    return;
  }

  if (banner) banner.style.display = "flex";
  if (titleEl) titleEl.textContent = task.title;
  if (assignerEl) assignerEl.textContent = `Assigned by: ${task.assignerName}`;

  if (state.activeTimer.timerInterval) {
    clearInterval(state.activeTimer.timerInterval);
  }

  const updateClock = () => {
    if (!state.activeTimer) return;
    const elapsedSeconds = Math.floor((Date.now() - state.activeTimer.startTime) / 1000);
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;
    if (clockEl) {
      clockEl.textContent = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
    }
  };

  updateClock();
  state.activeTimer.timerInterval = setInterval(updateClock, 1000);
}

function pauseLiveTimer() {
  if (!state.activeTimer) return;
  const elapsedMinutes = Math.max(1, Math.round((Date.now() - state.activeTimer.startTime) / (1000 * 60)));
  const hoursSpent = parseFloat((elapsedMinutes / 60).toFixed(2));
  const taskId = state.activeTimer.taskId;

  clearInterval(state.activeTimer.timerInterval);
  state.activeTimer = null;
  saveState();

  startTimerTicker();
  openLogTimeModal(taskId, hoursSpent);
  displayToast(`Timer paused. Logged ${hoursSpent} hours to task session.`);
}

function stopAndLogLiveTimer() {
  pauseLiveTimer();
}

function setupTimerRecovery() {
  if (state.activeTimer && state.activeTimer.startTime) {
    startTimerTicker();
  }
}

// ============================================================================
// TASK ACTIONS & STATUS
// ============================================================================
function updateTaskStatus(taskId, newStatus) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  const oldStatus = task.status;
  task.status = newStatus;

  if (newStatus === "completed" && oldStatus !== "completed") {
    task.completedAt = new Date().toISOString();
    // Calculate calendar turnaround
    task.completionTurnaround = calculateTurnaroundString(task.assignedAt, task.completedAt);
    displayToast(`Task "${task.title}" completed! Turnaround: ${task.completionTurnaround}`);
  } else if (newStatus !== "completed") {
    task.completedAt = null;
    task.completionTurnaround = null;
  }

  saveState();
  renderApp();
}

function handleAssignTaskSubmit(event) {
  event.preventDefault();
  const title = document.getElementById("task-title-input").value.trim();
  const project = document.getElementById("task-project-input").value;
  const priority = document.getElementById("task-priority-input").value;
  const assignerId = document.getElementById("task-assigner-input").value;
  const assigneeId = document.getElementById("task-assignee-input").value;
  const estimatedHours = parseFloat(document.getElementById("task-est-hours").value);
  const deadlineDate = document.getElementById("task-deadline-input").value;
  const description = document.getElementById("task-desc-input").value.trim();

  const assignerObj = state.employees.find(e => e.id === assignerId);
  const assigneeObj = state.employees.find(e => e.id === assigneeId);

  const newTask = {
    id: `TSK-${Date.now().toString().slice(-4)}`,
    title,
    description,
    project,
    priority,
    assignerId,
    assignerName: `${assignerObj.name} (${assignerObj.role})`,
    assigneeId,
    assigneeName: assigneeObj.name,
    status: "in_progress",
    assignedAt: new Date().toISOString(),
    deadline: new Date(deadlineDate).toISOString(),
    estimatedHours,
    actualLoggedHours: 0,
    completedAt: null,
    completionTurnaround: null,
    workNotes: "",
    timeLogs: []
  };

  state.tasks.unshift(newTask);
  saveState();
  closeModal("modal-assign-task");
  document.getElementById("form-assign-task").reset();
  initFormDates();
  renderApp();
  displayToast(`Work assigned to ${assigneeObj.name} by ${assignerObj.name}!`);
}

// Log Work Hours Modal
function openLogTimeModal(taskId, prefilledHours = null) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  document.getElementById("log-time-task-id").value = task.id;
  document.getElementById("log-time-task-title").textContent = `${task.title} (Given by: ${task.assignerName})`;
  document.getElementById("log-hours-input").value = prefilledHours || "1.0";
  document.getElementById("log-date-input").value = new Date().toISOString().split("T")[0];
  document.getElementById("log-notes-input").value = "";
  document.getElementById("log-mark-completed").checked = false;

  openModal("modal-log-time");
}

function handleLogTimeSubmit(event) {
  event.preventDefault();
  const taskId = document.getElementById("log-time-task-id").value;
  const hours = parseFloat(document.getElementById("log-hours-input").value);
  const date = document.getElementById("log-date-input").value;
  const notes = document.getElementById("log-notes-input").value.trim();
  const markCompleted = document.getElementById("log-mark-completed").checked;

  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  const currentUser = getCurrentUser();

  task.actualLoggedHours = parseFloat(((task.actualLoggedHours || 0) + hours).toFixed(2));
  task.timeLogs.push({
    id: `log_${Date.now()}`,
    date,
    hours,
    notes,
    employeeName: currentUser.name
  });

  if (markCompleted) {
    task.status = "completed";
    task.completedAt = new Date().toISOString();
    task.completionTurnaround = calculateTurnaroundString(task.assignedAt, task.completedAt);
    task.workNotes = notes;
  }

  saveState();
  closeModal("modal-log-time");
  renderApp();
  displayToast(`Logged ${hours} hrs to "${task.title}". Total: ${task.actualLoggedHours}h`);
}

function openTaskHistoryModal(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  document.getElementById("history-modal-title").textContent = `Audit Log: ${task.title}`;
  const content = document.getElementById("history-modal-content");

  let logsHTML = "";
  if (task.timeLogs && task.timeLogs.length > 0) {
    logsHTML = task.timeLogs.map(log => `
      <div style="background:var(--bg-muted);padding:0.75rem 1rem;border-radius:var(--radius-md);margin-bottom:0.6rem;border-left:3px solid var(--cwt-primary);">
        <div style="display:flex;justify-content:space-between;font-weight:700;font-size:0.85rem;">
          <span>📅 ${log.date} (${log.employeeName || task.assigneeName})</span>
          <span style="color:var(--cwt-primary);">${log.hours} hours logged</span>
        </div>
        <p style="font-size:0.82rem;color:var(--text-secondary);margin-top:4px;">${escapeHTML(log.notes)}</p>
      </div>
    `).join("");
  } else {
    logsHTML = `<p style="font-size:0.85rem;color:var(--text-secondary);">No time entries logged yet for this work item.</p>`;
  }

  content.innerHTML = `
    <div style="margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-subtle);">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;font-size:0.85rem;">
        <div><strong>👔 Work Given By:</strong> ${escapeHTML(task.assignerName)}</div>
        <div><strong>👤 Assigned To:</strong> ${escapeHTML(task.assigneeName)}</div>
        <div><strong>📅 Assigned Date:</strong> ${formatDate(task.assignedAt)}</div>
        <div><strong>🎯 Deadline:</strong> ${formatDate(task.deadline)}</div>
        <div><strong>⏳ Estimated:</strong> ${task.estimatedHours} hours</div>
        <div><strong>⏱️ Total Logged:</strong> ${task.actualLoggedHours} hours</div>
        ${task.completedAt ? `<div><strong>🏁 Finished:</strong> ${formatDate(task.completedAt)}</div>` : ''}
        ${task.completionTurnaround ? `<div><strong>⚡ Turnaround:</strong> <span style="color:var(--status-success);font-weight:700;">${task.completionTurnaround}</span></div>` : ''}
      </div>
    </div>
    <h4 style="font-size:0.95rem;margin-bottom:0.75rem;color:var(--text-main);">Logged Work Sessions (${task.timeLogs.length}):</h4>
    ${logsHTML}
  `;

  openModal("modal-task-history");
}

// ============================================================================
// PAGE 3: LEAVE MANAGEMENT
// ============================================================================
function renderLeaves() {
  const user = getCurrentUser();

  // 1. Render Quota Cards
  const quotaContainer = document.getElementById("leave-quotas-container");
  if (quotaContainer && user.leaveBalances) {
    const b = user.leaveBalances;
    const types = [
      { key: "annual", label: "Annual Leave", data: b.annual, color: "linear-gradient(135deg, #103e7c 0%, #1976d2 100%)" },
      { key: "casual", label: "Casual Leave", data: b.casual, color: "linear-gradient(135deg, #00897b 0%, #26a69a 100%)" },
      { key: "medical", label: "Medical / Sick Leave", data: b.medical, color: "linear-gradient(135deg, #7b1fa2 0%, #ab47bc 100%)" }
    ];

    quotaContainer.innerHTML = types.map(t => {
      const remaining = Math.max(0, t.data.allocated - t.data.used);
      const percentUsed = Math.min(100, Math.round((t.data.used / t.data.allocated) * 100));
      return `
        <div class="leave-quota-card">
          <div class="quota-header">
            <span class="quota-type">${t.label}</span>
            <span class="quota-count">${remaining} <small style="font-size:0.8rem;color:var(--text-secondary);font-weight:500;">days left</small></span>
          </div>
          <div class="quota-progress-bar">
            <div class="quota-progress-fill" style="width: ${percentUsed}%; background: ${t.color};"></div>
          </div>
          <div class="quota-meta">
            <span>Used: ${t.data.used} of ${t.data.allocated} days</span>
            <span>Allocated: ${t.data.allocated}d</span>
          </div>
        </div>
      `;
    }).join("");
  }

  // 2. Render Table
  const tableBody = document.getElementById("leaves-table-body");
  if (!tableBody) return;

  const statusFilter = document.getElementById("leave-status-filter")?.value || "all";
  const typeFilter = document.getElementById("leave-type-filter")?.value || "all";

  const filteredLeaves = state.leaves.filter(l => {
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    const matchesType = typeFilter === "all" || l.leaveType === typeFilter;
    return matchesStatus && matchesType;
  });

  if (filteredLeaves.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-secondary);">
          No leave records found for selected filters.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filteredLeaves.map(l => {
    let statusBadge = "";
    if (l.status === "Approved") {
      statusBadge = `<span class="status-badge" style="background:#dcfce7;color:#16a34a;">Approved</span>`;
    } else if (l.status === "Rejected") {
      statusBadge = `<span class="status-badge" style="background:#fee2e2;color:#dc2626;">Rejected</span>`;
    } else {
      statusBadge = `<span class="status-badge" style="background:#fef3c7;color:#d97706;">Pending Review</span>`;
    }

    const isPending = l.status === "Pending";
    const canApprove = user.canAssign || user.role.toLowerCase().includes("lead") || user.role.toLowerCase().includes("manager");

    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:0.6rem;">
            <img src="${l.avatar}" alt="${escapeHTML(l.employeeName)}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">
            <div>
              <div style="font-weight:700;">${escapeHTML(l.employeeName)}</div>
              <div style="font-size:0.75rem;color:var(--text-secondary);">${escapeHTML(l.employeeRole || '')}</div>
            </div>
          </div>
        </td>
        <td><strong>${l.leaveType}</strong></td>
        <td>${formatDate(l.startDate)} - ${formatDate(l.endDate)}</td>
        <td><strong>${l.days} ${l.days > 1 ? 'days' : 'day'}</strong></td>
        <td style="max-width:220px;font-size:0.82rem;color:var(--text-secondary);">${escapeHTML(l.reason)}</td>
        <td>${statusBadge}</td>
        <td>
          ${isPending ? (
            canApprove ? `
              <div style="display:flex;gap:0.4rem;">
                <button class="btn btn-sm btn-success" onclick="approveLeave('${l.id}')">Approve</button>
                <button class="btn btn-sm btn-danger" onclick="rejectLeave('${l.id}')">Reject</button>
              </div>
            ` : `<span style="font-size:0.8rem;color:var(--text-muted);">Awaiting Lead Review</span>`
          ) : (
            `<span style="font-size:0.78rem;color:var(--text-secondary);">Reviewed by ${escapeHTML(l.reviewedBy || 'Lead')}</span>`
          )}
        </td>
      </tr>
    `;
  }).join("");
}

function calculateLeaveDays() {
  const startVal = document.getElementById("leave-start-date")?.value;
  const endVal = document.getElementById("leave-end-date")?.value;
  const display = document.getElementById("leave-days-display");
  if (!startVal || !endVal || !display) return 1;

  const start = new Date(startVal);
  const end = new Date(endVal);
  const diffTime = end - start;
  let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  if (diffDays < 1) diffDays = 1;

  display.textContent = `${diffDays} ${diffDays === 1 ? 'Day' : 'Days'}`;
  return diffDays;
}

function handleApplyLeaveSubmit(event) {
  event.preventDefault();
  const employeeId = document.getElementById("leave-emp-input").value;
  const leaveType = document.getElementById("leave-type-select").value;
  const startDate = document.getElementById("leave-start-date").value;
  const endDate = document.getElementById("leave-end-date").value;
  const reason = document.getElementById("leave-reason-input").value.trim();

  const days = calculateLeaveDays();
  const emp = state.employees.find(e => e.id === employeeId);

  const newLeave = {
    id: `LV-${Date.now().toString().slice(-4)}`,
    employeeId: emp.id,
    employeeName: emp.name,
    employeeRole: emp.role,
    avatar: emp.avatar,
    leaveType,
    startDate,
    endDate,
    days,
    reason,
    status: "Pending",
    appliedAt: new Date().toISOString(),
    reviewedBy: null,
    reviewedAt: null,
    reviewNotes: ""
  };

  state.leaves.unshift(newLeave);
  saveState();
  closeModal("modal-apply-leave");
  document.getElementById("form-apply-leave").reset();
  initFormDates();
  renderApp();
  displayToast(`Leave application submitted for ${emp.name} (${days} days ${leaveType})`);
}

function approveLeave(leaveId) {
  const leave = state.leaves.find(l => l.id === leaveId);
  if (!leave) return;

  const reviewer = getCurrentUser();
  leave.status = "Approved";
  leave.reviewedBy = reviewer.name;
  leave.reviewedAt = new Date().toISOString();

  // Deduct from employee leave balances
  const emp = state.employees.find(e => e.id === leave.employeeId);
  if (emp && emp.leaveBalances) {
    const typeKey = leave.leaveType.toLowerCase();
    if (emp.leaveBalances[typeKey]) {
      emp.leaveBalances[typeKey].used += leave.days;
    }
  }

  saveState();
  renderApp();
  displayToast(`Leave request approved for ${leave.employeeName}!`);
}

function rejectLeave(leaveId) {
  const leave = state.leaves.find(l => l.id === leaveId);
  if (!leave) return;

  const reviewer = getCurrentUser();
  leave.status = "Rejected";
  leave.reviewedBy = reviewer.name;
  leave.reviewedAt = new Date().toISOString();

  saveState();
  renderApp();
  displayToast(`Leave request rejected.`);
}

// ============================================================================
// PAGE 4: TURNAROUND & REPORTS
// ============================================================================
function renderReports() {
  const completed = state.tasks.filter(t => t.status === "completed");
  const allTasks = state.tasks;

  const totalLoggedHours = allTasks.reduce((acc, t) => acc + (t.actualLoggedHours || 0), 0);
  const avgCompletionTime = completed.length ? (completed.reduce((acc, t) => acc + (t.actualLoggedHours || 0), 0) / completed.length).toFixed(1) : 0;

  // Calculate on-time rate
  let onTimeCount = 0;
  completed.forEach(t => {
    if (t.completedAt && t.deadline) {
      if (new Date(t.completedAt) <= new Date(t.deadline)) {
        onTimeCount++;
      }
    } else {
      onTimeCount++;
    }
  });
  const onTimeRate = completed.length ? Math.round((onTimeCount / completed.length) * 100) : 100;

  // KPI elements
  const elTotalLogged = document.getElementById("rpt-total-logged-hours");
  const elAvgTime = document.getElementById("rpt-avg-completion-time");
  const elOnTime = document.getElementById("rpt-ontime-rate");
  const elTotalDone = document.getElementById("rpt-total-completed-count");

  if (elTotalLogged) elTotalLogged.textContent = `${totalLoggedHours.toFixed(1)} hrs`;
  if (elAvgTime) elAvgTime.textContent = `${avgCompletionTime} hrs`;
  if (elOnTime) elOnTime.textContent = `${onTimeRate}%`;
  if (elTotalDone) elTotalDone.textContent = completed.length;

  const elTotalLoggedLeaf = document.getElementById("rpt-total-logged-hours-leaf");
  const elAvgTimeLeaf = document.getElementById("rpt-avg-completion-time-leaf");
  const elOnTimeLeaf = document.getElementById("rpt-ontime-rate-leaf");
  const elTotalDoneLeaf = document.getElementById("rpt-total-completed-count-leaf");

  if (elTotalLoggedLeaf) elTotalLoggedLeaf.textContent = `${totalLoggedHours.toFixed(1)} hrs`;
  if (elAvgTimeLeaf) elAvgTimeLeaf.textContent = `${avgCompletionTime} hrs`;
  if (elOnTimeLeaf) elOnTimeLeaf.textContent = `${onTimeRate}%`;
  if (elTotalDoneLeaf) elTotalDoneLeaf.textContent = completed.length;

  // Detailed Table Rows
  const rowsHTML = allTasks.map(t => {
    const isCompleted = t.status === "completed";
    let varianceBadge = "";
    if (isCompleted) {
      const diffHours = t.estimatedHours - (t.actualLoggedHours || 0);
      if (diffHours >= 0) {
        varianceBadge = `<span class="status-badge" style="background:#dcfce7;color:#16a34a;">${diffHours.toFixed(1)}h Under Est.</span>`;
      } else {
        varianceBadge = `<span class="status-badge" style="background:#fee2e2;color:#dc2626;">+${Math.abs(diffHours).toFixed(1)}h Over Est.</span>`;
      }
    } else {
      varianceBadge = `<span class="status-badge" style="background:#e0f2fe;color:#0284c7;">Active Progress</span>`;
    }

    return `
      <tr>
        <td>
          <strong style="color:var(--text-main);">${escapeHTML(t.title)}</strong>
          <div style="font-size:0.75rem;color:var(--text-secondary);">${escapeHTML(t.project)} (${t.id})</div>
        </td>
        <td>
          <span class="assigner-tag">👔 ${escapeHTML(t.assignerName)}</span>
        </td>
        <td>
          <strong>${escapeHTML(t.assigneeName)}</strong>
        </td>
        <td>${formatDate(t.assignedAt)}</td>
        <td>${t.completedAt ? formatDate(t.completedAt) : '<em style="color:var(--text-muted);">In Progress</em>'}</td>
        <td>${t.estimatedHours} hrs</td>
        <td><strong class="report-table-tag">${t.actualLoggedHours || 0} hrs</strong></td>
        <td>
          ${t.completionTurnaround ? `<strong style="color:var(--status-success);">${t.completionTurnaround}</strong>` : '<span style="color:var(--text-muted);">-</span>'}
        </td>
        <td>${varianceBadge}</td>
      </tr>
    `;
  }).join("");

  const tableBody = document.getElementById("reports-table-body");
  if (tableBody) tableBody.innerHTML = rowsHTML;

  const leavesTableBody = document.getElementById("leaves-reports-table-body");
  if (leavesTableBody) leavesTableBody.innerHTML = rowsHTML;
}

function exportReportsToCSV() {
  const headers = ["Task ID", "Project", "Title", "Work Given By (Assigner)", "Assigned To (Employee)", "Assigned Date", "Deadline", "Completed Date", "Estimated Hours", "Actual Logged Hours", "Turnaround Duration", "Status"];
  const rows = state.tasks.map(t => [
    t.id,
    `"${t.project}"`,
    `"${t.title.replace(/"/g, '""')}"`,
    `"${t.assignerName}"`,
    `"${t.assigneeName}"`,
    t.assignedAt,
    t.deadline,
    t.completedAt || "",
    t.estimatedHours,
    t.actualLoggedHours || 0,
    `"${t.completionTurnaround || ''}"`,
    t.status
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `CWT_Work_Turnaround_Report_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  displayToast("Exported work turnaround report to CSV!");
}

// ============================================================================
// PAGE 5: TEAM DIRECTORY
// ============================================================================
function renderTeam() {
  const container = document.getElementById("team-grid-container");
  if (!container) return;

  container.innerHTML = state.employees.map(e => {
    const activeTasks = state.tasks.filter(t => t.assigneeId === e.id && t.status !== "completed");
    const tasksGiven = state.tasks.filter(t => t.assignerId === e.id);
    const isOnLeave = state.leaves.some(l => l.employeeId === e.id && l.status === "Approved");

    return `
      <div class="member-card">
        <img class="member-card-avatar" src="${e.avatar}" alt="${escapeHTML(e.name)}">
        <h3 class="member-card-name">${escapeHTML(e.name)}</h3>
        <div class="member-card-role">${escapeHTML(e.role)}</div>
        <div class="member-card-dept">${escapeHTML(e.department)} • ${escapeHTML(e.email)}</div>

        <div style="margin-bottom: 1rem;">
          ${isOnLeave ? `<span class="status-badge" style="background:#fee2e2;color:#dc2626;">🏖️ Currently On Leave</span>` : `<span class="status-badge" style="background:#dcfce7;color:#16a34a;">🟢 Active Today</span>`}
        </div>

        <div class="member-stats-row">
          <div>
            <strong>${activeTasks.length}</strong>
            <div style="font-size:0.72rem;color:var(--text-secondary);">Active Tasks</div>
          </div>
          <div>
            <strong>${tasksGiven.length}</strong>
            <div style="font-size:0.72rem;color:var(--text-secondary);">Work Given</div>
          </div>
          <div>
            <strong>${e.leaveBalances ? e.leaveBalances.annual.allocated - e.leaveBalances.annual.used : 0}d</strong>
            <div style="font-size:0.72rem;color:var(--text-secondary);">Annual Left</div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// ============================================================================
// MODAL CONTROLLERS
// ============================================================================
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add("active");
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("active");
}

function openAssignTaskModal() {
  const assignerSelect = document.getElementById("task-assigner-input");
  if (assignerSelect) {
    assignerSelect.value = state.currentUser;
  }
  openModal("modal-assign-task");
}

function openApplyLeaveModal() {
  const empSelect = document.getElementById("leave-emp-input");
  if (empSelect) {
    empSelect.value = state.currentUser;
  }
  calculateLeaveDays();
  openModal("modal-apply-leave");
}

// Close modals when clicking on backdrop
window.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("active");
  }
});

// ============================================================================
// HELPER UTILITIES
// ============================================================================
function calculateTurnaroundString(startISO, endISO) {
  if (!startISO || !endISO) return "";
  const start = new Date(startISO);
  const end = new Date(endISO);
  const diffMs = Math.max(0, end - start);

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);

  return parts.join(" ");
}

function formatDate(isoString) {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch (e) {
    return isoString;
  }
}

function formatStatus(status) {
  const map = {
    backlog: "Backlog",
    in_progress: "In Progress",
    in_review: "Under Review",
    completed: "Completed"
  };
  return map[status] || status;
}

function padZero(num) {
  return num < 10 ? `0${num}` : num;
}

function escapeHTML(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

function displayToast(message) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <span>✦</span>
    <span>${escapeHTML(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(20px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3200);
}
