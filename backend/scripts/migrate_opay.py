import sqlite3

def run_migration():
    conn = sqlite3.connect("joyshiddenbeauty.db")
    cur = conn.cursor()

    # 1. Migrate appointments table
    cur.execute("PRAGMA table_info(appointments)")
    cols = [col[1] for col in cur.fetchall()]
    if "opay_reference" not in cols:
        print("Adding column 'opay_reference' to 'appointments' table...")
        cur.execute("ALTER TABLE appointments ADD COLUMN opay_reference VARCHAR(255)")
        print("Column 'opay_reference' added to 'appointments' table.")
    else:
        print("Column 'opay_reference' already exists in 'appointments' table.")

    # 2. Migrate orders table
    cur.execute("PRAGMA table_info(orders)")
    cols = [col[1] for col in cur.fetchall()]
    if "opay_reference" not in cols:
        print("Adding column 'opay_reference' to 'orders' table...")
        cur.execute("ALTER TABLE orders ADD COLUMN opay_reference VARCHAR(255)")
        print("Column 'opay_reference' added to 'orders' table.")
    else:
        print("Column 'opay_reference' already exists in 'orders' table.")

    conn.commit()
    conn.close()
    print("Database migration completed successfully!")

if __name__ == "__main__":
    run_migration()
