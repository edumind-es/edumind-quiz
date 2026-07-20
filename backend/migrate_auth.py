import sqlite3
import os

DB_PATH = "/var/www/edumind_quiz/backend/edumind_quiz.db"

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print(f"Migrating {DB_PATH}")
    
    try:
        # Check if username column exists
        cursor.execute("PRAGMA table_info(users)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if "username" not in columns:
            print("Adding username column...")
            cursor.execute("ALTER TABLE users ADD COLUMN username VARCHAR;")
            
            # Map existing emails to username so we don't violate null constraint later (although SQLite doesn't enforce added NOT NULL well)
            cursor.execute("UPDATE users SET username = email WHERE username IS NULL;")
            
            # create index on username
            cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_username ON users (username);")
            
            print("Migration successful.")
        else:
            print("Column 'username' already exists.")
            
        conn.commit()
    except Exception as e:
        print(f"Error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
