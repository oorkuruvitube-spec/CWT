// Initial Seed Data for Creative Web Technology (CWT)
// Leave & Work Tracking System

const INITIAL_DATA = {
  currentUser: "emp_ceo",
  
  employees: [
    {
      id: "emp_ceo",
      name: "Kolitha De Silva",
      role: "Chief Executive Officer & MD",
      department: "Executive Leadership",
      email: "kolitha@gmail.com",
      password: "1234",
      avatar: "/team/kolitha_headshot_circle.png",
      canAssign: true,
      leaveBalances: {
        annual: { allocated: 21, used: 2, pending: 0 },
        casual: { allocated: 7, used: 1, pending: 0 },
        medical: { allocated: 14, used: 0, pending: 0 }
      }
    }
  ],

  projects: [
    "Enterprise Portal 2.0",
    "Client FinTech Platform",
    "HealthCare Web Suite",
    "CWT Internal Core Services",
    "E-Commerce Cloud Architecture"
  ],

  tasks: [
    {
      id: "TSK-101",
      title: "Implement CWT Corporate Wave Header & Nav Layout",
      description: "Build high-performance responsive navbar and hero section with Sri Lanka Customs DAT theme and fluid dynamics.",
      project: "Enterprise Portal 2.0",
      priority: "high",
      assignerId: "emp_1",
      assignerName: "Mathivathanan K. (Tech Lead)",
      assigneeId: "emp_2",
      assigneeName: "Sarah Perera",
      status: "completed",
      assignedAt: "2026-09-21T09:00:00.000Z",
      deadline: "2026-09-22T18:00:00.000Z",
      estimatedHours: 8,
      actualLoggedHours: 7.5,
      completedAt: "2026-09-22T16:30:00.000Z",
      completionTurnaround: "1d 7h 30m",
      workNotes: "Implemented pure CSS SVG responsive waves, accessible navigation links, and seamless mobile drawer.",
      timeLogs: [
        { id: "log_1", date: "2026-09-21", hours: 4.0, notes: "Designed wave bezier paths and navigation shell" },
        { id: "log_2", date: "2026-09-22", hours: 3.5, notes: "Integrated responsive breakpoints and test validation" }
      ]
    },
    {
      id: "TSK-102",
      title: "Develop Real-Time Work Stopwatch & Session Logger",
      description: "Implement interactive stopwatch widget with start/stop/resume capabilities and automatic duration calculations.",
      project: "CWT Internal Core Services",
      priority: "urgent",
      assignerId: "emp_1",
      assignerName: "Mathivathanan K. (Tech Lead)",
      assigneeId: "emp_2",
      assigneeName: "Sarah Perera",
      status: "in_progress",
      assignedAt: "2026-09-23T08:30:00.000Z",
      deadline: "2026-09-24T17:00:00.000Z",
      estimatedHours: 6,
      actualLoggedHours: 3.25,
      completedAt: null,
      completionTurnaround: null,
      workNotes: "Stopwatch state active. Testing localStorage persistence across page refreshes.",
      timeLogs: [
        { id: "log_3", date: "2026-09-23", hours: 3.25, notes: "Built timer interval ticker and state persistence" }
      ]
    },
    {
      id: "TSK-103",
      title: "Design Employee Leave Balance & Quota Dashboard Cards",
      description: "Create visual progress bars and metrics for Annual, Casual, and Medical leaves with remaining day calculations.",
      project: "Enterprise Portal 2.0",
      priority: "medium",
      assignerId: "emp_3",
      assignerName: "Dinesh Fernando (UI/UX Architect)",
      assigneeId: "emp_3",
      assigneeName: "Dinesh Fernando",
      status: "completed",
      assignedAt: "2026-09-20T10:00:00.000Z",
      deadline: "2026-09-21T15:00:00.000Z",
      estimatedHours: 5,
      actualLoggedHours: 4.5,
      completedAt: "2026-09-21T14:15:00.000Z",
      completionTurnaround: "1d 4h 15m",
      workNotes: "Cards crafted with subtle oceanic shadow, animated quota progress bars, and status tooltips.",
      timeLogs: [
        { id: "log_4", date: "2026-09-20", hours: 2.5, notes: "Wireframes and design tokens" },
        { id: "log_5", date: "2026-09-21", hours: 2.0, notes: "CSS implementation and quota calculations" }
      ]
    },
    {
      id: "TSK-104",
      title: "API Endpoint & Schema for Leave Request Approvals",
      description: "Build robust data handling for managers to approve, reject, or comment on pending employee leave requests.",
      project: "CWT Internal Core Services",
      priority: "high",
      assignerId: "emp_1",
      assignerName: "Mathivathanan K. (Tech Lead)",
      assigneeId: "emp_4",
      assigneeName: "Ananya Sharma",
      status: "in_progress",
      assignedAt: "2026-09-22T14:00:00.000Z",
      deadline: "2026-09-24T12:00:00.000Z",
      estimatedHours: 6,
      actualLoggedHours: 2.0,
      completedAt: null,
      completionTurnaround: null,
      workNotes: "Drafted verification handlers and automated quota deductions upon approval.",
      timeLogs: [
        { id: "log_6", date: "2026-09-23", hours: 2.0, notes: "Validation rules for insufficient leave balance" }
      ]
    },
    {
      id: "TSK-105",
      title: "Automated Regression Test Suite for Work Assignment",
      description: "Write end-to-end tests covering work creation, assigner validation, status transitions, and duration calculations.",
      project: "Client FinTech Platform",
      priority: "low",
      assignerId: "emp_1",
      assignerName: "Mathivathanan K. (Tech Lead)",
      assigneeId: "emp_5",
      assigneeName: "Kasun Jayawardena",
      status: "backlog",
      assignedAt: "2026-09-23T11:00:00.000Z",
      deadline: "2026-09-26T18:00:00.000Z",
      estimatedHours: 10,
      actualLoggedHours: 0,
      completedAt: null,
      completionTurnaround: null,
      workNotes: "",
      timeLogs: []
    }
  ],

  leaves: [
    {
      id: "LV-201",
      employeeId: "emp_2",
      employeeName: "Sarah Perera",
      employeeRole: "Senior Full-Stack Engineer",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      leaveType: "Annual",
      startDate: "2026-09-28",
      endDate: "2026-09-29",
      days: 2,
      reason: "Family travel and personal commitment.",
      status: "Pending",
      appliedAt: "2026-09-22T11:20:00.000Z",
      reviewedBy: null,
      reviewedAt: null,
      reviewNotes: ""
    },
    {
      id: "LV-202",
      employeeId: "emp_4",
      employeeName: "Ananya Sharma",
      employeeRole: "Backend & Cloud Engineer",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
      leaveType: "Casual",
      startDate: "2026-09-25",
      endDate: "2026-09-25",
      days: 1,
      reason: "Home utility maintenance appointment.",
      status: "Pending",
      appliedAt: "2026-09-23T09:40:00.000Z",
      reviewedBy: null,
      reviewedAt: null,
      reviewNotes: ""
    },
    {
      id: "LV-203",
      employeeId: "emp_5",
      employeeName: "Kasun Jayawardena",
      employeeRole: "QA Automation Engineer",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      leaveType: "Medical",
      startDate: "2026-09-18",
      endDate: "2026-09-19",
      days: 2,
      reason: "Severe viral flu and medical rest.",
      status: "Approved",
      appliedAt: "2026-09-17T08:15:00.000Z",
      reviewedBy: "Mathivathanan K.",
      reviewedAt: "2026-09-17T09:00:00.000Z",
      reviewNotes: "Approved. Take care and get well soon."
    },
    {
      id: "LV-204",
      employeeId: "emp_1",
      employeeName: "Mathivathanan K.",
      employeeRole: "Tech Lead & Project Manager",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      leaveType: "Casual",
      startDate: "2026-09-11",
      endDate: "2026-09-11",
      days: 1,
      reason: "Attending technical conference in Colombo.",
      status: "Approved",
      appliedAt: "2026-09-08T14:30:00.000Z",
      reviewedBy: "Operations Director",
      reviewedAt: "2026-09-09T10:00:00.000Z",
      reviewNotes: "Approved."
    }
  ]
};
