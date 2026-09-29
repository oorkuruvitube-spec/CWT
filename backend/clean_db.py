import sqlite3

def clean_database():
    conn = sqlite3.connect('cwt_portal.db')
    cursor = conn.cursor()

    # 1. Add started_date and started_time columns to tasks table if not existing
    cursor.execute('PRAGMA table_info(tasks)')
    cols = [col[1] for col in cursor.fetchall()]
    if 'started_date' not in cols:
        cursor.execute('ALTER TABLE tasks ADD COLUMN started_date VARCHAR(20)')
        print('Added started_date column to tasks table')
    if 'started_time' not in cols:
        cursor.execute('ALTER TABLE tasks ADD COLUMN started_time VARCHAR(20)')
        print('Added started_time column to tasks table')

    # 2. Delete all fake mock tasks
    fake_tasks = [
        'TSK-290', 'TSK-295', 'TSK-300', 'TSK-300B', 'TSK-300C',
        'TSK-301', 'TSK-302', 'TSK-303', 'TSK-304', 'TSK-305',
        'TSK-306', 'TSK-307', 'TSK-308'
    ]
    placeholders = ','.join(['?'] * len(fake_tasks))
    cursor.execute(f'DELETE FROM tasks WHERE id IN ({placeholders})', fake_tasks)
    print(f'Deleted mock tasks. Rows affected: {cursor.rowcount}')

    # 3. Delete all fake mock daily updates
    cursor.execute('DELETE FROM daily_updates WHERE id LIKE "log-%"')
    print('Cleaned fake daily updates')

    # 4. Ensure Sharumathan exists in employees
    cursor.execute('SELECT id, name FROM employees WHERE name LIKE "%Sharumathan%" OR email LIKE "%sharu%"')
    sharu = cursor.fetchone()
    sharu_id = sharu[0] if sharu else 'emp_sharu'

    if not sharu:
        cursor.execute('''
            INSERT INTO employees (id, name, email, password, role, level, level_name, department, avatar, can_assign, bio)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            'emp_sharu',
            'Sharumathan',
            'sharu@gmail.com',
            '1234',
            'Associate Data Engineer',
            4,
            'Specialist Engineer',
            'Data Engineering & Analytics',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
            0,
            'Associate Data Engineer at Creative Web Technology.'
        ))
        print('Inserted Sharumathan into employees table')
    else:
        print(f'Sharumathan exists with ID: {sharu_id}')

    # 5. Insert or update the real tasks TSK-484 and TSK-927
    cursor.execute('SELECT id FROM tasks WHERE id = ?', ('TSK-484',))
    if not cursor.fetchone():
        cursor.execute('''
            INSERT INTO tasks (
                id, title, description, project_id, project_name, category,
                assigned_by, assigned_to, priority, status, assigned_date,
                due_date, estimated_hours, actual_logged_hours, started_date, started_time
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            'TSK-484',
            'Create a documantation for customs edge',
            'Document complete architecture, data flow and endpoints for Customs EDGE pipeline.',
            'proj-customs',
            'Sri Lanka Customs DAT & CDNS',
            'Modern Data Platform',
            'emp_ceo',
            sharu_id,
            'high',
            'in_progress',
            '2026-09-28',
            '2026-10-03',
            12.0,
            4.0,
            '2026-09-28',
            '11:53 AM'
        ))
        print('Inserted real task TSK-484')
    else:
        cursor.execute('''
            UPDATE tasks SET
                title = 'Create a documantation for customs edge',
                assigned_to = ?,
                assigned_by = 'emp_ceo',
                priority = 'high',
                status = 'in_progress',
                estimated_hours = 12.0,
                actual_logged_hours = 4.0,
                due_date = '2026-10-03'
            WHERE id = 'TSK-484'
        ''', (sharu_id,))
        print('Updated real task TSK-484')

    cursor.execute('SELECT id FROM tasks WHERE id = ?', ('TSK-927',))
    if not cursor.fetchone():
        cursor.execute('''
            INSERT INTO tasks (
                id, title, description, project_id, project_name, category,
                assigned_by, assigned_to, priority, status, assigned_date,
                due_date, estimated_hours, actual_logged_hours
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            'TSK-927',
            'Create a documantation about EDGE',
            'High-level executive documentation and overview about EDGE platform.',
            'proj-customs',
            'Sri Lanka Customs DAT & CDNS',
            'Modern Data Platform',
            'emp_ceo',
            'emp_ceo',
            'medium',
            'pending',
            '2026-09-28',
            '2026-10-01',
            3.0,
            0.0
        ))
        print('Inserted real task TSK-927')
    else:
        cursor.execute('''
            UPDATE tasks SET
                title = 'Create a documantation about EDGE',
                assigned_to = 'emp_ceo',
                assigned_by = 'emp_ceo',
                priority = 'medium',
                status = 'pending',
                estimated_hours = 3.0,
                actual_logged_hours = 0.0,
                due_date = '2026-10-01'
            WHERE id = 'TSK-927'
        ''')
        print('Updated real task TSK-927')

    conn.commit()

    print('=== ALL CURRENT EMPLOYEES IN DATABASE ===')
    for row in cursor.execute('SELECT id, name, role, email FROM employees').fetchall():
        print(row)

    print('=== ALL CURRENT TASKS IN DATABASE ===')
    for row in cursor.execute('SELECT id, title, assigned_to, priority, actual_logged_hours, estimated_hours, due_date, status FROM tasks').fetchall():
        print(row)

    conn.close()

if __name__ == '__main__':
    clean_database()
