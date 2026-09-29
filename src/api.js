// ============================================================================
// Creative Web Technology (CWT) - Enterprise API Client
// Connects to FastAPI Backend (PostgreSQL / SQLite) with graceful local fallback
// ============================================================================

import { INITIAL_DATA } from './data';

const API_BASE = "http://localhost:8000/api";

export async function loginEmployee(emailOrId, password, customEmployees = null) {
  const cleanInput = (emailOrId || "").trim().toLowerCase();
  const passInput = (password || "").trim();
  
  // 1. Try FastAPI Backend
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout for ultra-fast fallback
    
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanInput, password: passInput }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.info("Backend connecting/offline; using corporate directory:", err.message);
  }

  // 2. Direct Employee Authentication Fallback
  // Check custom passed employees or stored in localStorage, with fallback to INITIAL_DATA
  let employees = customEmployees;
  if (!employees) {
    try {
      const saved = localStorage.getItem('CWT_EMPLOYEES_DATA_v2') || localStorage.getItem('CWT_EMPLOYEES_DATA_v1');
      if (saved) {
        employees = JSON.parse(saved).filter(e => !['emp_1', 'emp_2', 'emp_3', 'emp_4', 'emp_5'].includes(e.id));
      }
    } catch {
      // fallback
    }
  }
  if (!employees) employees = INITIAL_DATA.employees;

  // Special match for CEO Kolitha admin credentials: kolitha@gmail.com / 1234
  const isKolitha = cleanInput === "kolitha@gmail.com" || 
    cleanInput === "emp_ceo" ||
    cleanInput === "kolitha";

  let foundEmp = null;
  if (isKolitha) {
    foundEmp = employees.find(e => e.id === "emp_ceo") || INITIAL_DATA.employees[0];
  } else {
    foundEmp = employees.find(e => 
      e.email?.toLowerCase() === cleanInput || 
      e.id?.toLowerCase() === cleanInput
    );
  }

  if (!foundEmp) {
    throw new Error("Invalid corporate email or employee ID.");
  }

  // Strict Password Authentication against employee account password
  const expectedPassword = foundEmp.password || "1234";
  if (passInput !== expectedPassword) {
    throw new Error("Incorrect password. Please verify credentials.");
  }

  return {
    success: true,
    token: `cwt_token_${foundEmp.id}_${Date.now()}`,
    employee: foundEmp,
    message: `Authenticated as ${foundEmp.name}`
  };
}

export async function createEmployeeOnBackend(empData) {
  try {
    const res = await fetch(`${API_BASE}/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(empData)
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Saved employee locally, backend offline:", err);
  }
  return null;
}

export async function fetchDepartmentsFromBackend() {
  try {
    const res = await fetch(`${API_BASE}/departments`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Using local departments cache:", err);
  }
  return null;
}

export async function saveDepartmentToBackend(deptName) {
  try {
    const res = await fetch(`${API_BASE}/departments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: deptName })
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Department cached locally:", err);
  }
  return null;
}

export async function fetchTiersFromBackend() {
  try {
    const res = await fetch(`${API_BASE}/tiers`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Using local tiers cache:", err);
  }
  return null;
}

export async function saveTierToBackend(level, tierName) {
  try {
    const res = await fetch(`${API_BASE}/tiers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level: parseInt(level, 10), name: tierName })
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Tier cached locally:", err);
  }
  return null;
}


export function normalizeTask(t) {
  if (!t) return t;
  const assignedTo = t.assignedTo || t.assigned_to;
  const assignedBy = t.assignedBy || t.assigned_by || 'emp_ceo';
  const projectName = t.projectName || t.project_name || 'Sri Lanka Customs DAT & CDNS';
  const projectId = t.projectId || t.project_id || 'proj-customs';
  const dueDate = t.dueDate || t.due_date;
  const assignedDate = t.assignedDate || t.assigned_date;
  const estimatedHours = t.estimatedHours !== undefined ? t.estimatedHours : (t.estimated_hours !== undefined ? t.estimated_hours : 8);
  const actualLoggedHours = t.actualLoggedHours !== undefined ? t.actualLoggedHours : (t.actual_logged_hours !== undefined ? t.actual_logged_hours : 0);
  const startedDate = t.startedDate || t.started_date;
  const startedTime = t.startedTime || t.started_time;
  const completedDate = t.completedDate || t.completed_date;
  const completedProperly = t.completedProperly !== undefined ? t.completedProperly : t.completed_properly;
  const qualityScore = t.qualityScore !== undefined ? t.qualityScore : t.quality_score;
  const qaNotes = t.qaNotes || t.qa_notes;
  const workNotes = t.workNotes || t.work_notes;

  return {
    ...t,
    id: t.id,
    title: t.title,
    description: t.description || '',
    category: t.category || 'Modern Data Platform',
    priority: t.priority || 'high',
    status: t.status || 'pending',
    assignedTo,
    assignedBy,
    projectName,
    projectId,
    dueDate,
    assignedDate,
    estimatedHours: Number(estimatedHours) || 8,
    actualLoggedHours: Number(actualLoggedHours) || 0,
    startedDate,
    startedTime,
    startedAt: startedDate && startedTime ? `${startedDate} at ${startedTime}` : (t.startedAt || null),
    completedDate,
    completedProperly,
    qualityScore,
    qaNotes,
    workNotes,
    assigned_to: assignedTo,
    assigned_by: assignedBy,
    project_name: projectName,
    project_id: projectId,
    due_date: dueDate,
    assigned_date: assignedDate,
    estimated_hours: Number(estimatedHours) || 8,
    actual_logged_hours: Number(actualLoggedHours) || 0,
    started_date: startedDate,
    started_time: startedTime,
    completed_date: completedDate,
    completed_properly: completedProperly,
    quality_score: qualityScore,
    qa_notes: qaNotes,
    work_notes: workNotes
  };
}

export function normalizeEmployee(e) {
  if (!e) return e;
  return {
    ...e,
    id: e.id,
    name: e.name,
    email: e.email,
    password: e.password || '1234',
    role: e.role,
    level: Number(e.level) || 4,
    levelName: e.levelName || e.level_name || 'Specialist Engineer',
    level_name: e.levelName || e.level_name || 'Specialist Engineer',
    department: e.department || 'Data Engineering & Analytics',
    avatar: e.avatar,
    canAssign: e.canAssign !== undefined ? e.canAssign : (e.can_assign !== undefined ? e.can_assign : (e.level <= 3)),
    can_assign: e.canAssign !== undefined ? e.canAssign : (e.can_assign !== undefined ? e.can_assign : (e.level <= 3)),
    bio: e.bio || `${e.role} at Creative Web Technology.`
  };
}

export async function fetchEmployeesFromBackend() {
  try {
    const res = await fetch(`${API_BASE}/employees`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map(normalizeEmployee);
      }
    }
  } catch (err) {
    console.warn("Using local employee cache:", err);
  }
  return null;
}

export async function fetchTasksFromBackend(assignedTo = null) {
  try {
    const url = assignedTo ? `${API_BASE}/tasks?assigned_to=${assignedTo}` : `${API_BASE}/tasks`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map(normalizeTask);
      }
    }
  } catch (err) {
    console.warn("Using local tasks cache:", err);
  }
  return null;
}

export async function createTaskOnBackend(taskData) {
  try {
    const payload = {
      id: taskData.id,
      title: taskData.title,
      description: taskData.description || "",
      project_id: taskData.projectId || taskData.project_id || "proj-customs",
      project_name: taskData.projectName || taskData.project_name || "Sri Lanka Customs DAT & CDNS",
      category: taskData.category || "Modern Data Platform",
      assigned_by: taskData.assignedBy || taskData.assigned_by || "emp_ceo",
      assigned_to: taskData.assignedTo || taskData.assigned_to,
      priority: taskData.priority || "high",
      status: taskData.status || "pending",
      assigned_date: taskData.assignedDate || taskData.assigned_date,
      due_date: taskData.dueDate || taskData.due_date,
      estimated_hours: Number(taskData.estimatedHours || taskData.estimated_hours || 8),
      actual_logged_hours: Number(taskData.actualLoggedHours || taskData.actual_logged_hours || 0),
      started_date: taskData.startedDate || taskData.started_date,
      started_time: taskData.startedTime || taskData.started_time
    };
    const res = await fetch(`${API_BASE}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const saved = await res.json();
      return normalizeTask(saved);
    }
  } catch (err) {
    console.warn("Task saved locally:", err);
  }
  return null;
}

export async function updateTaskStatusOnBackend(taskId, statusData) {
  try {
    const payload = {
      status: statusData.status,
      actual_logged_hours: statusData.actualLoggedHours ?? statusData.actual_logged_hours,
      started_date: statusData.startedDate || statusData.started_date,
      started_time: statusData.startedTime || statusData.started_time,
      completed_date: statusData.completedDate || statusData.completed_date,
      completed_properly: statusData.completedProperly ?? statusData.completed_properly,
      quality_score: statusData.qualityScore ?? statusData.quality_score,
      qa_notes: statusData.qaNotes || statusData.qa_notes,
      work_notes: statusData.workNotes || statusData.work_notes
    };
    const res = await fetch(`${API_BASE}/tasks/${taskId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const saved = await res.json();
      return normalizeTask(saved);
    }
  } catch (err) {
    console.warn("Task status updated locally:", err);
  }
  return null;
}

export async function createDailyUpdateOnBackend(updateData) {
  try {
    const res = await fetch(`${API_BASE}/daily-updates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData)
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Daily update saved locally:", err);
  }
  return null;
}
