import os
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import engine, Base, get_db, DB_TYPE
from .models import Employee, Project, Task, DailyUpdate, Department, HierarchyTier
from .schemas import (
    LoginRequest, LoginResponse, EmployeeCreate, EmployeeSchema,
    ProjectSchema, TaskCreate, TaskUpdateStatus, TaskSchema,
    DailyUpdateCreate, DailyUpdateSchema, DepartmentCreate, HierarchyTierCreate
)
from .seed import seed_database

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Creative Web Technology (CWT) Enterprise API",
    description="Backend engine for CWT Portal: Employee Auth, Hierarchy Delegation, Task Orchestration, and Worklogs",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow Vite frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed database on startup
@app.on_event("startup")
def startup_populate():
    with next(get_db()) as db:
        seed_database(db)

# =============================================================================
# HEALTH & METADATA
# =============================================================================
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CWT Enterprise Portal API",
        "database": DB_TYPE,
        "version": "2.0.0"
    }

# =============================================================================
# AUTHENTICATION
# =============================================================================
@app.post("/api/auth/login", response_model=LoginResponse)
def login(creds: LoginRequest, db: Session = Depends(get_db)):
    email_clean = creds.email.strip().lower()
    
    # Query employee by email (case-insensitive)
    emp = db.query(Employee).filter(Employee.email.ilike(email_clean)).first()
    
    # Special check for CEO Kolitha: kolitha@gmail.com
    if not emp and (email_clean in ["kolitha@gmail.com", "emp_ceo", "kolitha"]):
        emp = db.query(Employee).filter(Employee.id == "emp_ceo").first()
        if emp and emp.email != "kolitha@gmail.com":
            emp.email = "kolitha@gmail.com"
            emp.password = "1234"
            db.commit()

    if not emp:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid corporate credentials. Account not found."
        )

    # Strict Password Check against employee actual password
    if creds.password.strip() != (emp.password or "1234"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password."
        )

    # Return mock enterprise session token
    return LoginResponse(
        success=True,
        token=f"cwt_jwt_{emp.id}_auth_token",
        employee=emp,
        message=f"Welcome back, {emp.name}!"
    )

# =============================================================================
# EMPLOYEES & HIERARCHY
# =============================================================================
@app.get("/api/employees", response_model=List[EmployeeSchema])
def list_employees(db: Session = Depends(get_db)):
    return db.query(Employee).order_by(Employee.level.asc()).all()

@app.post("/api/employees", response_model=EmployeeSchema)
def create_employee(emp_in: EmployeeCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    existing = db.query(Employee).filter(Employee.email.ilike(emp_in.email.strip())).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employee with this email already exists")
    
    count = db.query(Employee).count()
    new_id = f"emp_{count + 1}_{abs(hash(emp_in.email)) % 1000}"
    
    level_names = {
        1: "Executive / C-Suite",
        2: "Lead Architect / Tech Lead",
        3: "Senior Engineer",
        4: "Specialist Engineer"
    }
    lvl_name = emp_in.level_name or level_names.get(emp_in.level, "Specialist Engineer")
    avatar = emp_in.avatar or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    
    new_emp = Employee(
        id=new_id,
        name=emp_in.name,
        email=emp_in.email.strip().lower(),
        password=emp_in.password or "1234",
        role=emp_in.role,
        level=emp_in.level,
        level_name=lvl_name,
        department=emp_in.department,
        avatar=avatar,
        can_assign=emp_in.can_assign if emp_in.can_assign is not None else (emp_in.level <= 3),
        bio=emp_in.bio or f"{emp_in.role} at Creative Web Technology."
    )
    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)

    # Persist custom department in departments table
    if emp_in.department:
        dept_name = emp_in.department.strip()
        dept_exists = db.query(Department).filter(Department.name.ilike(dept_name)).first()
        if not dept_exists:
            db.add(Department(name=dept_name))
            db.commit()

    # Persist custom tier in hierarchy_tiers table
    if lvl_name:
        tier_name = lvl_name.strip()
        tier_exists = db.query(HierarchyTier).filter(
            (HierarchyTier.level == emp_in.level) & (HierarchyTier.name.ilike(tier_name))
        ).first()
        if not tier_exists:
            db.add(HierarchyTier(level=emp_in.level, name=tier_name))
            db.commit()

    return new_emp

@app.get("/api/departments")
def get_departments(db: Session = Depends(get_db)):
    dept_objs = db.query(Department).all()
    depts = [d.name for d in dept_objs]
    emp_depts = [e.department for e in db.query(Employee).all() if e.department]
    return list(dict.fromkeys(depts + emp_depts))

@app.post("/api/departments")
def create_department(dept_in: DepartmentCreate, db: Session = Depends(get_db)):
    dept_name = dept_in.name.strip()
    if not dept_name:
        raise HTTPException(status_code=400, detail="Department name cannot be empty")
    existing = db.query(Department).filter(Department.name.ilike(dept_name)).first()
    if not existing:
        new_d = Department(name=dept_name)
        db.add(new_d)
        db.commit()
    return {"message": "Department saved successfully", "name": dept_name}

@app.get("/api/tiers")
def get_tiers(db: Session = Depends(get_db)):
    tiers = db.query(HierarchyTier).order_by(HierarchyTier.level.asc()).all()
    return [{"level": t.level, "name": t.name} for t in tiers]

@app.post("/api/tiers")
def create_tier(tier_in: HierarchyTierCreate, db: Session = Depends(get_db)):
    tier_name = tier_in.name.strip()
    if not tier_name:
        raise HTTPException(status_code=400, detail="Tier name cannot be empty")
    existing = db.query(HierarchyTier).filter(
        (HierarchyTier.level == tier_in.level) & (HierarchyTier.name.ilike(tier_name))
    ).first()
    if not existing:
        new_t = HierarchyTier(level=tier_in.level, name=tier_name)
        db.add(new_t)
        db.commit()
    return {"message": "Tier saved successfully", "level": tier_in.level, "name": tier_name}


@app.get("/api/employees/{emp_id}", response_model=EmployeeSchema)
def get_employee(emp_id: str, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == emp_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp

# =============================================================================
# PROJECTS
# =============================================================================
@app.get("/api/projects", response_model=List[ProjectSchema])
def list_projects(db: Session = Depends(get_db)):
    return db.query(Project).all()

# =============================================================================
# TASKS & HIERARCHY-BASED DELEGATION
# =============================================================================
@app.get("/api/tasks", response_model=List[TaskSchema])
def list_tasks(
    assigned_to: Optional[str] = None,
    assigned_by: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Task)
    if assigned_to:
        query = query.filter(Task.assigned_to == assigned_to)
    if assigned_by:
        query = query.filter(Task.assigned_by == assigned_by)
    return query.order_by(Task.created_at.desc()).all()

@app.post("/api/tasks", response_model=TaskSchema)
def create_task(task_in: TaskCreate, db: Session = Depends(get_db)):
    # 1. Fetch Assigner and Assignee for hierarchy verification
    assigner = db.query(Employee).filter(Employee.id == task_in.assigned_by).first()
    assignee = db.query(Employee).filter(Employee.id == task_in.assigned_to).first()

    if not assigner and task_in.assigned_by in ["kolitha@gmail.com", "emp_ceo"]:
        assigner = db.query(Employee).filter(Employee.id == "emp_ceo").first()
    if not assignee and task_in.assigned_to in ["kolitha@gmail.com", "emp_ceo"]:
        assignee = db.query(Employee).filter(Employee.id == "emp_ceo").first()

    if not assigner or not assignee:
        raise HTTPException(status_code=400, detail="Invalid assigner or assignee ID")

    # 2. Strict Hierarchy Rule:
    # An employee at level L can only assign to >= L (subordinates or peers).
    # Cannot delegate upward to a superior (level < assigner.level).
    if assignee.level < assigner.level:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Hierarchy Violation: Tier L{assigner.level} ({assigner.role}) cannot delegate upward to Tier L{assignee.level} ({assignee.role})."
        )

    # 3. Create or Update Task
    new_id = task_in.id or f"TSK-{abs(hash(task_in.title + str(os.urandom(4)))) % 900 + 100}"
    existing = db.query(Task).filter(Task.id == new_id).first()
    if existing:
        existing.title = task_in.title
        existing.description = task_in.description
        existing.project_id = task_in.project_id
        existing.project_name = task_in.project_name
        existing.category = task_in.category or "Modern Data Platform"
        existing.assigned_by = assigner.id
        existing.assigned_to = assignee.id
        existing.priority = task_in.priority or "high"
        if task_in.status:
            existing.status = task_in.status
        existing.due_date = task_in.due_date
        if task_in.estimated_hours is not None:
            existing.estimated_hours = task_in.estimated_hours
        if task_in.actual_logged_hours is not None:
            existing.actual_logged_hours = task_in.actual_logged_hours
        if task_in.started_date:
            existing.started_date = task_in.started_date
        if task_in.started_time:
            existing.started_time = task_in.started_time
        db.commit()
        db.refresh(existing)
        return existing

    from datetime import datetime
    assigned_d = task_in.assigned_date or datetime.now().strftime("%Y-%m-%d")

    new_task = Task(
        id=new_id,
        title=task_in.title,
        description=task_in.description,
        project_id=task_in.project_id,
        project_name=task_in.project_name,
        category=task_in.category or "Modern Data Platform",
        assigned_by=assigner.id,
        assigned_to=assignee.id,
        priority=task_in.priority or "high",
        status=task_in.status or "pending",
        assigned_date=assigned_d,
        due_date=task_in.due_date,
        estimated_hours=task_in.estimated_hours or 8.0,
        actual_logged_hours=task_in.actual_logged_hours or 0.0,
        started_date=task_in.started_date,
        started_time=task_in.started_time
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@app.patch("/api/tasks/{task_id}/status", response_model=TaskSchema)
def update_task_status(task_id: str, update: TaskUpdateStatus, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if update.status:
        task.status = update.status
    if update.actual_logged_hours is not None:
        task.actual_logged_hours = update.actual_logged_hours
    if update.started_date:
        task.started_date = update.started_date
    if update.started_time:
        task.started_time = update.started_time

    if update.status == "completed":
        from datetime import datetime
        task.completed_date = update.completed_date or datetime.now().strftime("%Y-%m-%d")
        task.completed_properly = update.completed_properly if update.completed_properly is not None else True
        task.quality_score = update.quality_score or 98
        task.quality_rating = 5
        task.qa_verified_by = "Lead Architect & QA"
        if update.qa_notes:
            task.qa_notes = update.qa_notes

    if update.work_notes:
        task.work_notes = update.work_notes

    db.commit()
    db.refresh(task)
    return task

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: str, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"message": f"Task {task_id} deleted successfully"}

# =============================================================================
# DAILY WORKLOGS
# =============================================================================
@app.get("/api/daily-updates", response_model=List[DailyUpdateSchema])
def list_daily_updates(employee_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(DailyUpdate)
    if employee_id:
        query = query.filter(DailyUpdate.employee_id == employee_id)
    return query.order_by(DailyUpdate.created_at.desc()).all()

@app.post("/api/daily-updates", response_model=DailyUpdateSchema)
def create_daily_update(log_in: DailyUpdateCreate, db: Session = Depends(get_db)):
    new_id = f"log-{abs(hash(str(os.urandom(8)))) % 90000 + 10000}"
    new_log = DailyUpdate(
        id=new_id,
        employee_id=log_in.employee_id,
        task_id=log_in.task_id,
        task_title=log_in.task_title,
        date=log_in.date,
        hours=log_in.hours,
        summary=log_in.summary,
        blockers=log_in.blockers
    )
    db.add(new_log)

    # Increment logged hours on associated task if linked
    if log_in.task_id and log_in.task_id != "ad-hoc":
        task = db.query(Task).filter(Task.id == log_in.task_id).first()
        if task:
            task.actual_logged_hours = round(task.actual_logged_hours + log_in.hours, 1)
            if task.status == "pending":
                task.status = "in_progress"

    db.commit()
    db.refresh(new_log)
    return new_log

# =============================================================================
# PERFORMANCE & SPRINT VELOCITY
# =============================================================================
@app.get("/api/performance/{employee_id}")
def get_employee_performance(employee_id: str, db: Session = Depends(get_db)):
    tasks = db.query(Task).filter(Task.assigned_to == employee_id).all()
    completed = [t for t in tasks if t.status == "completed"]
    properly_done = [t for t in completed if t.completed_properly is not False]

    properly_rate = round((len(properly_done) / len(completed) * 100)) if completed else 98
    total_hours = sum(t.actual_logged_hours for t in tasks)

    return {
        "employee_id": employee_id,
        "total_assigned": len(tasks),
        "total_completed": len(completed),
        "completed_properly": len(properly_done),
        "properly_rate_pct": properly_rate,
        "total_hours_logged": round(total_hours, 1),
        "sprints": ["Sprint 36", "Sprint 37", "Sprint 38", "Sprint 39", "Sprint 40 (Current)"],
        "properly_completed_trend": [5, 6, 7, 7, len(properly_done) or 6],
        "assigned_trend": [5, 6, 7, 8, len(tasks) or 7],
        "quality_rate_trend": [98, 97, 100, 96, properly_rate]
    }
