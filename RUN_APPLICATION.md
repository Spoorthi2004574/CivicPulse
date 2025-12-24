# How to Run the Application

## Prerequisites Check

Before running, ensure you have:
1. ✅ Java 17+ installed
2. ✅ Maven installed
3. ✅ PostgreSQL installed and running
4. ✅ Node.js 16+ and npm installed

## Step 1: Setup PostgreSQL Database

### Quick Setup (Command Line)

```bash
# Connect to PostgreSQL
psql -U postgres

# Enter your PostgreSQL password when prompted
# Then run these SQL commands:
CREATE DATABASE civicpulse_db;
\q
```

### Using pgAdmin (GUI)

1. Open pgAdmin
2. Right-click "Databases" → "Create" → "Database"
3. Name: `civicpulse_db`
4. Click "Save"

## Step 2: Configure Database Connection

Edit `src/main/resources/application.properties`:

```properties
# Update with your PostgreSQL password
spring.datasource.password=YOUR_POSTGRES_PASSWORD
```

**Default values:**
- Host: `localhost`
- Port: `5432`
- Database: `civicpulse_db`
- Username: `postgres`

## Step 3: Run Backend

### Option A: Using Maven (Recommended)

```bash
# Navigate to project root
cd CivicPulse

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

### Option B: Using IDE (IntelliJ IDEA / Eclipse)

1. Open the project in your IDE
2. Wait for Maven to download dependencies
3. Find `CivicPulseApplication.java`
4. Right-click → "Run 'CivicPulseApplication'"

### Expected Output

You should see:
```
Started CivicPulseApplication in X.XXX seconds
Default admin user created: admin@civicpulse.com / Admin@123
```

**Backend URL:** http://localhost:8080

## Step 4: Run Frontend

### Open a New Terminal

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

### Expected Output

```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

**Frontend URL:** http://localhost:3000

## Step 5: Verify Everything Works

### Test Backend

Open browser: http://localhost:8080/auth/login

You should see an error (this is expected - it's a POST endpoint, not GET).

### Test Frontend

Open browser: http://localhost:3000

You should see the login page.

### Test Login

1. Go to http://localhost:3000/login
2. Login with:
   - Email: `admin@civicpulse.com`
   - Password: `Admin@123`
3. You should be redirected to the admin dashboard

## Troubleshooting

### Backend Won't Start

**Error: "Port 8080 already in use"**
```bash
# Windows: Find and kill process
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Or change port in application.properties
server.port=8081
```

**Error: "Connection refused" (PostgreSQL)**
- Check if PostgreSQL is running
- Verify database exists: `psql -U postgres -l`
- Check credentials in `application.properties`

**Error: "Database does not exist"**
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE civicpulse_db;
\q
```

### Frontend Won't Start

**Error: "Port 3000 already in use"**
```bash
# Change port in vite.config.js
server: {
  port: 3001
}
```

**Error: "Cannot find module"**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Issues

**Test PostgreSQL Connection:**
```bash
psql -U postgres -d civicpulse_db
# If this works, your connection is fine
```

**Check PostgreSQL Service:**
- Windows: Services → PostgreSQL
- Linux: `sudo systemctl status postgresql`
- macOS: `brew services list`

## Default Credentials

### Admin Account (Auto-created)
- Email: `admin@civicpulse.com`
- Password: `Admin@123`
- Role: ADMIN

**⚠️ IMPORTANT:** Change this password in production!

## Application Flow

1. **Citizen Signup** → Immediate activation → Can login
2. **Officer Signup** → Pending approval → Admin must approve
3. **Admin Approval** → Generates secret key → Officer can login with secret key
4. **Login** → Returns JWT token → Used for authenticated requests

## API Endpoints

### Public Endpoints
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login

### Admin Endpoints (Require JWT token)
- `GET /admin/officers/pending` - List pending officers
- `POST /admin/officers/{id}/approve` - Approve officer

## Next Steps

1. ✅ Backend running on port 8080
2. ✅ Frontend running on port 3000
3. ✅ Database connected
4. ✅ Login as admin
5. ✅ Test signup flow
6. ✅ Test officer approval

## Production Checklist

Before deploying to production:

- [ ] Change default admin password
- [ ] Update JWT secret to secure random string
- [ ] Use environment variables for sensitive data
- [ ] Set `spring.jpa.hibernate.ddl-auto=validate`
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Configure logging
- [ ] Set up monitoring

## Support

If you encounter issues:
1. Check application logs
2. Verify PostgreSQL is running
3. Check database credentials
4. Review error messages
5. See `POSTGRESQL_SETUP.md` for detailed database setup




