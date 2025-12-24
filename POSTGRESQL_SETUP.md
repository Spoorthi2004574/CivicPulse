# PostgreSQL Database Setup Guide

## Step 1: Install PostgreSQL

### Windows
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` superuser
4. Default port is `5432`

### macOS
```bash
# Using Homebrew
brew install postgresql@14
brew services start postgresql@14
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Step 2: Verify PostgreSQL Installation

Open a terminal/command prompt and run:
```bash
psql --version
```

You should see the PostgreSQL version number.

## Step 3: Connect to PostgreSQL

### Windows (using psql)
1. Open "SQL Shell (psql)" from Start Menu
2. Press Enter for default server (localhost)
3. Press Enter for default port (5432)
4. Press Enter for default database (postgres)
5. Enter your postgres user password

### macOS/Linux
```bash
sudo -u postgres psql
```

Or if you have a user account:
```bash
psql -U postgres
```

## Step 4: Create the Database

Once connected to PostgreSQL, run these commands:

```sql
-- Create the database
CREATE DATABASE civicpulse_db;

-- Verify database creation
\l
```

You should see `civicpulse_db` in the list.

## Step 5: Create a User (Optional but Recommended)

For better security, create a dedicated user:

```sql
-- Create a new user
CREATE USER civicpulse_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE civicpulse_db TO civicpulse_user;

-- Exit psql
\q
```

## Step 6: Update Application Properties

Edit `src/main/resources/application.properties`:

```properties
# If using default postgres user
spring.datasource.url=jdbc:postgresql://localhost:5432/civicpulse_db
spring.datasource.username=postgres
spring.datasource.password=your_postgres_password

# OR if using dedicated user
spring.datasource.url=jdbc:postgresql://localhost:5432/civicpulse_db
spring.datasource.username=civicpulse_user
spring.datasource.password=your_secure_password
```

## Step 7: Test Connection

### Using psql
```bash
psql -U postgres -d civicpulse_db
# Enter password when prompted
```

### Using pgAdmin (GUI Tool)
1. Download pgAdmin from: https://www.pgadmin.org/download/
2. Install and open pgAdmin
3. Right-click "Servers" → "Create" → "Server"
4. General tab: Name = "CivicPulse Local"
5. Connection tab:
   - Host: localhost
   - Port: 5432
   - Database: civicpulse_db
   - Username: postgres
   - Password: your_password
6. Click "Save"

## Step 8: Verify Database is Ready

After starting your Spring Boot application, the tables will be created automatically (due to `spring.jpa.hibernate.ddl-auto=update`).

You can verify by connecting to the database and running:
```sql
\dt
```

You should see the `users` table.

## Troubleshooting

### Connection Refused Error
- **Problem**: Cannot connect to PostgreSQL
- **Solution**: 
  - Check if PostgreSQL service is running
  - Windows: Services → PostgreSQL
  - Linux: `sudo systemctl status postgresql`
  - macOS: `brew services list`

### Authentication Failed
- **Problem**: Wrong username/password
- **Solution**: 
  - Verify credentials in `application.properties`
  - Reset password: `ALTER USER postgres WITH PASSWORD 'new_password';`

### Database Does Not Exist
- **Problem**: `civicpulse_db` not found
- **Solution**: Run `CREATE DATABASE civicpulse_db;` in psql

### Port Already in Use
- **Problem**: Port 5432 is already in use
- **Solution**: 
  - Change PostgreSQL port in `postgresql.conf`
  - Update `application.properties` with new port

## Quick Connection Test Script

Create a file `test-connection.sql`:

```sql
-- Test connection
SELECT version();

-- List databases
\l

-- Connect to civicpulse_db
\c civicpulse_db

-- List tables (after running Spring Boot app)
\dt
```

Run with: `psql -U postgres -f test-connection.sql`

## Common PostgreSQL Commands

```sql
-- List all databases
\l

-- Connect to a database
\c database_name

-- List all tables
\dt

-- Describe a table
\d table_name

-- List all users
\du

-- Exit psql
\q
```

## Security Best Practices

1. **Change default postgres password**:
   ```sql
   ALTER USER postgres WITH PASSWORD 'strong_password';
   ```

2. **Create dedicated application user** (recommended):
   ```sql
   CREATE USER app_user WITH PASSWORD 'secure_password';
   GRANT CONNECT ON DATABASE civicpulse_db TO app_user;
   GRANT USAGE ON SCHEMA public TO app_user;
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;
   ```

3. **Use environment variables** for sensitive data:
   ```properties
   spring.datasource.password=${DB_PASSWORD}
   ```

## Environment Variables Setup

Instead of hardcoding passwords, use environment variables:

### Windows (PowerShell)
```powershell
$env:DB_PASSWORD="your_password"
```

### Windows (Command Prompt)
```cmd
set DB_PASSWORD=your_password
```

### macOS/Linux
```bash
export DB_PASSWORD=your_password
```

Then in `application.properties`:
```properties
spring.datasource.password=${DB_PASSWORD}
```

## Next Steps

After setting up PostgreSQL:
1. Update `application.properties` with your database credentials
2. Run `mvn clean install` to build the project
3. Run `mvn spring-boot:run` to start the application
4. Check the console for "Started CivicPulseApplication" message
5. Verify tables are created by checking the database




