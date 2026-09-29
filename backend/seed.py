from sqlalchemy.orm import Session
from .models import Employee, Project, Department, HierarchyTier

def seed_database(db: Session):
    # 1. Seed Real Admin (Kolitha De Silva) if not present
    ceo = db.query(Employee).filter(Employee.id == "emp_ceo").first()
    if not ceo:
        ceo = Employee(
            id="emp_ceo",
            name="Kolitha De Silva",
            email="kolitha@gmail.com",
            password="1234",
            role="Chief Executive Officer & MD",
            level=1,
            level_name="Executive / C-Suite",
            department="Executive Leadership",
            avatar="/team/kolitha_headshot_circle.png",
            can_assign=True,
            bio="25+ years driving global enterprise architectures across Australia, UK, and Sri Lanka."
        )
        db.add(ceo)

    # 2. Seed Standard Projects if not present
    projects = [
        Project(id="proj-customs", name="Sri Lanka Customs DAT & CDNS", client="Sri Lanka Customs", tag="Customs & Trade"),
        Project(id="proj-aviation", name="Aviation Modern Data Platform", client="Sri Lankan Airlines", tag="Aviation & Synapse"),
        Project(id="proj-allianz", name="Allianz DataSphere Lakehouse", client="Allianz Lanka", tag="Insurance & Risk"),
        Project(id="proj-dilmah", name="Multi-Company ERP Lakehouse", client="Dilmah Tea", tag="FMCG ERP"),
        Project(id="proj-healthcare", name="Nordic EPR Clinical Platform", client="Cambio Healthcare", tag="E-Health"),
        Project(id="proj-banking", name="High-Velocity Banking ELT", client="Bank of Maldives", tag="FinTech & Banking"),
    ]
    for p in projects:
        if not db.query(Project).filter(Project.id == p.id).first():
            db.add(p)

    # 3. Seed Standard Departments if not present
    standard_depts = [
        "Executive Leadership",
        "Data Engineering & Analytics",
        "Cloud Architecture & Infrastructure",
        "Business Intelligence & Reporting",
        "Enterprise Software Engineering",
        "Quality Assurance & Automation"
    ]
    for d_name in standard_depts:
        if not db.query(Department).filter(Department.name.ilike(d_name)).first():
            db.add(Department(name=d_name))

    # 4. Seed Standard Hierarchy Tiers if not present
    standard_tiers = [
        (1, "Executive / C-Suite"),
        (2, "Lead Architect / Tech Lead"),
        (3, "Senior Engineer"),
        (4, "Specialist Engineer")
    ]
    for lvl, t_name in standard_tiers:
        if not db.query(HierarchyTier).filter((HierarchyTier.level == lvl) & (HierarchyTier.name.ilike(t_name))).first():
            db.add(HierarchyTier(level=lvl, name=t_name))

    # Commit all core records
    db.commit()
    print("Database seeding completed: Clean enterprise structure ready.")
