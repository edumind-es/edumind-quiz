import sqlite3
import os

# Ruta de la BD: la variable QUIZ_DB_PATH o, por defecto, el fichero junto a este script
DB_PATH = os.environ.get("QUIZ_DB_PATH", os.path.join(os.path.dirname(os.path.abspath(__file__)), "edumind_quiz.db"))

def reset_game_tables():
    if not os.path.exists(DB_PATH):
        print(f"Database {DB_PATH} not found.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    tables_to_drop = [
        "question_history",
        "questions",
        "question_proposals",
        "teams",
        "areas",
        "proposals",
        "classrooms"
    ]

    for table in tables_to_drop:
        try:
            cursor.execute(f"DROP TABLE IF EXISTS {table}")
            print(f"Dropped {table}")
        except Exception as e:
            print(f"Error dropping {table}: {e}")

    conn.commit()
    conn.close()
    print("Database cleared of game-level schemas successfully.")

if __name__ == "__main__":
    reset_game_tables()
