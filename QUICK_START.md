# Quick Start Guide - CivicPulse Hub

## PostgreSQL Connection - Quick Steps

### 1. Install PostgreSQL (if not installed)

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Install with default settings
- Remember the password you set for `postgres` user

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux:**
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

Open terminal/command prompt and run:

```bash
# Connect to PostgreSQL
psql -U postgres

# Enter your password when prompted, then run:
CREATE DATABASE civicpulse_db;

# Exit
\q
```

### 3. Update Configuration

Edit `src/main/resources/application.properties`:

```properties
# Replace with your PostgreSQL password
spring.datasource.password=YOUR_POSTGRES_PASSWORD
```

### 4. Run Backend

```bash
mvn clean install
mvn spring-boot:run
```

### 5. Run Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

### 6. Access Application

- Frontend: http://localhost:3000
- Backend: http://localhost:8080

### 7. Login as Admin

- Email: `admin@civicpulse.com`
- Password: `Admin@123`

## Common Connection Strings

### Local PostgreSQL (Default)
```
jdbc:postgresql://localhost:5432/civicpulse_db
```

### Remote PostgreSQL
```
jdbc:postgresql://your-server-ip:5432/civicpulse_db
```

### With SSL
```
jdbc:postgresql://localhost:5432/civicpulse_db?ssl=true
```

## Verify Connection

After starting the backend, check the console logs. You should see:
- "HikariPool-1 - Starting..."
- "HikariPool-1 - Start completed"
- No connection errors

If you see connection errors, verify:
1. PostgreSQL is running
2. Database `civicpulse_db` exists
3. Username and password are correct
4. Port 5432 is not blocked by firewall




