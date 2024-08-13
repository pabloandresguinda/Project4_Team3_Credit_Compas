import psycopg2


# Connect to the PostgreSQL database
conn = psycopg2.connect(
    dbname='creditcompass',
    user='postgres',
    password='constella',
    host='localhost',
    port='5432'
)
cursor = conn.cursor()

# Fetch table names
cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
tables = cursor.fetchall()
print("Tables:", tables)

# Fetch column details for each table
for table in tables:
    table_name = table[0]
    print(f"\nTable: {table_name}")
    cursor.execute(f"SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = '{table_name}';")
    columns = cursor.fetchall()
    for column in columns:
        print(f"Column: {column[0]}, Type: {column[1]}, Nullable: {column[2]}, Default: {column[3]}")

# Show the first 15 records from each table
for table in tables:
    table_name = table[0]
    print(f"\nTable: {table_name}")
    cursor.execute(f"SELECT * FROM {table_name} LIMIT 15;")
    rows = cursor.fetchall()
    for row in rows:
        print(row)

# Close the connection
conn.close()
