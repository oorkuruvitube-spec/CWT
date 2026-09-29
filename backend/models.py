from sqlalchemy import Column, String, Integer, Float, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from .database import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password = Column(String(100), nullable=False, default="cwt2026") # Hashed or plain for demo
    role = Column(String(150), nullable=False)
    level = Column(Integer, nullable=False, default=4) # 1: CEO, 2: Lead, 3: Senior, 4: Specialist
    level_name = Column(String(100), nullable=False, default="Specialist")
    department = Column(String(100), nullable=False)
    avatar = Column(String(300), nullable=True)
    can_assign = Column(Boolean, default=False)
    bio = Column(Text, nullable=True)

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    client = Column(String(150), nullable=False)
    tag = Column(String(100), nullable=True)

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    project_id = Column(String(50), nullable=True)
    project_name = Column(String(150), nullable=True)
    category = Column(String(100), nullable=False, default="Modern Data Platform")
    assigned_by = Column(String(50), ForeignKey("employees.id"), nullable=False)
    assigned_to = Column(String(50), ForeignKey("employees.id"), nullable=False)
    priority = Column(String(20), nullable=False, default="high") # urgent, high, medium, low
    status = Column(String(30), nullable=False, default="pending") # pending, in_progress, completed, review
    assigned_date = Column(String(20), nullable=True)
    due_date = Column(String(20), nullable=True)
    estimated_hours = Column(Float, default=8.0)
    actual_logged_hours = Column(Float, default=0.0)
    started_date = Column(String(20), nullable=True)
    started_time = Column(String(20), nullable=True)
    completed_date = Column(String(20), nullable=True)
    completed_properly = Column(Boolean, nullable=True)
    quality_score = Column(Integer, nullable=True)
    quality_rating = Column(Integer, nullable=True)
    qa_verified_by = Column(String(100), nullable=True)
    qa_notes = Column(Text, nullable=True)
    work_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class DailyUpdate(Base):
    __tablename__ = "daily_updates"

    id = Column(String(50), primary_key=True, index=True)
    employee_id = Column(String(50), ForeignKey("employees.id"), nullable=False)
    task_id = Column(String(50), nullable=True)
    task_title = Column(String(255), nullable=False)
    date = Column(String(20), nullable=False)
    hours = Column(Float, nullable=False, default=1.0)
    summary = Column(Text, nullable=False)
    blockers = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False)

class HierarchyTier(Base):
    __tablename__ = "hierarchy_tiers"

    id = Column(Integer, primary_key=True, index=True)
    level = Column(Integer, nullable=False)
    name = Column(String(150), nullable=False)
