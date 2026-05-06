"""Module to create and manage SQLite3 database"""
import sqlite3

if __name__ == "__main__":
    # Connect to the database (or create it if it doesn't exist)
    conn = sqlite3.connect('./database/database.db')
    cursor = conn.cursor()

    # Create users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        password_hash TEXT NOT NULL
    )
    ''')

    # Create roles table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS roles (
        role_id INTEGER PRIMARY KEY AUTOINCREMENT,
        role_name TEXT NOT NULL
    )
    ''')

    # Create events table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS events (
        event_id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_name TEXT NOT NULL,
        event_date TEXT NOT NULL,
        event_location TEXT NOT NULL
    )
    ''')

    # Create steps table and link it to events table (many to 1)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS steps (
        step_id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER,
        step_num INTEGER NOT NULL,
        step_title TEXT NOT NULL,
        step_performer TEXT NOT NULL,
        FOREIGN KEY (event_id) REFERENCES events(event_id)
    )
    ''')

    # Create instructions table, link it to the steps table (many to 1)
    # and link it to the jobs table (many to 1)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS instructions (
        instruction_id INTEGER PRIMARY KEY AUTOINCREMENT,
        step_id INTEGER,
        job_id INTEGER,
        instruction_num INTEGER NOT NULL,
        instruction_detail TEXT NOT NULL,
        FOREIGN KEY (step_id) REFERENCES steps(step_id),
        FOREIGN KEY (job_id) REFERENCES jobs(job_id)
    )
    ''')

    # Create jobs table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS jobs (
        job_id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_name TEXT NOT NULL
    )
    ''')

    conn.commit()
    conn.close()

    print("✅ Created database successfully")
