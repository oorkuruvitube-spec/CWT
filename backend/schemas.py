from pydantic import BaseModel
from typing import Optional, List

# Auth Schemas
class LoginRequest(BaseModel):
    email: str
    password: str

class EmployeeCreate(BaseModel):
    name: str
    email: str
    password: Optional[str] = "1234"
    role: str
    level: int = 3
    level_name: Optional[str] = None
    department: str = "Web Technologies"
    avatar: Optional[str] = None
    can_assign: Optional[bool] = False
    bio: Optional[str] = None

class EmployeeSchema(BaseModel):
    id: str
    name: str
    email: str
    role: str
    level: int
    level_name: str
    department: str
    avatar: Optional[str] = None
    can_assign: bool = False
    bio: Optional[str] = None

    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    success: bool
    token: str
    employee: EmployeeSchema
    message: str

# Project Schemas
class ProjectSchema(BaseModel):
    id: str
    name: str
    client: str
    tag: Optional[str] = None

    class Config:
        from_attributes = True

# Task Schemas
class TaskCreate(BaseModel):
    id: Optional[str] = None
    title: str
    description: Optional[str] = ""
    project_id: Optional[str] = None
    project_name: Optional[str] = "CWT Enterprise Platform"
    category: Optional[str] = "Modern Data Platform"
    assigned_by: str
    assigned_to: str
    priority: Optional[str] = "high"
    status: Optional[str] = "pending"
    assigned_date: Optional[str] = None
    due_date: str
    estimated_hours: Optional[float] = 8.0
    actual_logged_hours: Optional[float] = 0.0
    started_date: Optional[str] = None
    started_time: Optional[str] = None

class TaskUpdateStatus(BaseModel):
    status: Optional[str] = None
    actual_logged_hours: Optional[float] = None
    started_date: Optional[str] = None
    started_time: Optional[str] = None
    completed_date: Optional[str] = None
    completed_properly: Optional[bool] = None
    quality_score: Optional[int] = None
    qa_notes: Optional[str] = None
    work_notes: Optional[str] = None

class TaskSchema(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    category: str
    assigned_by: str
    assigned_to: str
    priority: str
    status: str
    assigned_date: Optional[str] = None
    due_date: Optional[str] = None
    estimated_hours: float
    actual_logged_hours: float
    started_date: Optional[str] = None
    started_time: Optional[str] = None
    completed_date: Optional[str] = None
    completed_properly: Optional[bool] = None
    quality_score: Optional[int] = None
    quality_rating: Optional[int] = None
    qa_verified_by: Optional[str] = None
    qa_notes: Optional[str] = None
    work_notes: Optional[str] = None

    class Config:
        from_attributes = True

# Daily Update Schemas
class DailyUpdateCreate(BaseModel):
    employee_id: str
    task_id: Optional[str] = None
    task_title: str
    date: str
    hours: float
    summary: str
    blockers: Optional[str] = ""

class DailyUpdateSchema(BaseModel):
    id: str
    employee_id: str
    task_id: Optional[str] = None
    task_title: str
    date: str
    hours: float
    summary: str
    blockers: Optional[str] = None

    class Config:
        from_attributes = True

# Department and Hierarchy Schemas
class DepartmentCreate(BaseModel):
    name: str

class HierarchyTierCreate(BaseModel):
    level: int
    name: str

