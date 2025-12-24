# Complete Setup Guide - CivicPulse Hub

## Prerequisites Checklist

- [ ] Java 17 or higher installed
- [ ] Maven 3.6+ installed
- [ ] PostgreSQL 12+ installed and running
- [ ] Node.js 16+ and npm installed (for frontend)
- [ ] Git (optional, for version control)

## Step-by-Step Setup

### 1. Verify Prerequisites

#### Check Java Version
```bash
java -version
# Should show version 17 or higher
```

#### Check Maven Version
```bash
mvn -version
# Should show version 3.6 or higher
```

#### Check PostgreSQL
```bash
psql --version
# Should show PostgreSQL version
```

#### Check Node.js
```bash
node -v
npm -v
# Should show Node.js 16+ and npm version
```

### 2. PostgreSQL Database Setup

Follow the detailed guide in `POSTGRESQL_SETUP.md` or quick setup:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE civicpulse_db;

# Exit
\q
```

### 3. Configure Backend

#### Update Database Credentials

Edit `src/main/resources/application.properties`:

```properties
# Update these values with your PostgreSQL credentials
spring.datasource.url=jdbc:postgresql://localhost:5432/civicpulse_db
spring.datasource.username=postgres
spring.datasource.password=YOUR_POSTGRES_PASSWORD
```

#### Update JWT Secret (Optional but Recommended)

The default JWT secret in `application.properties` is:
```
jwt.secret=CivicPulseHubSecretKey2024SecureAuthenticationSystemMin256BitsRequired
```

For production, generate a secure random string (minimum 32 characters).

### 4. Build and Run Backend

```bash
# Navigate to project root
cd CivicPulse

# Clean and build
mvn clean install

# Run the application
mvn spring-boot:run
```

**Expected Output:**
```
Started CivicPulseApplication in X.XXX seconds
```

The backend will be available at: `http://localhost:8080`

### 5. Setup Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:3000/
```

The frontend will be available at: `http://localhost:3000`

### 6. Verify Installation

#### Backend Health Check

Open browser or use curl:
```bash
# Test if backend is running
curl http://localhost:8080/auth/login
# Should return 400 (Bad Request) - this is expected for GET request
```

#### Frontend Check

Open browser: `http://localhost:3000`

You should see the login page.

### 7. Default Admin Account

On first run, the application automatically creates an admin account:

- **Email**: `admin@civicpulse.com`
- **Password**: `Admin@123`

**Important**: Change this password immediately in production!

### 8. Test the Application

#### Test Citizen Signup
1. Go to `http://localhost:3000/signup`
2. Fill in the form:
   - Name: John Doe
   - Email: john@example.com
   - Password: password123
   - Role: Citizen
3. Click "Sign Up"
4. You should be redirected to dashboard

#### Test Officer Signup
1. Go to `http://localhost:3000/signup`
2. Fill in the form:
   - Name: Jane Officer
   - Email: jane@city.gov
   - Password: password123
   - Role: Officer
   - Department: Transportation
3. Click "Sign Up"
4. You'll see a message about pending approval

#### Test Admin Login
1. Go to `http://localhost:3000/login`
2. Login with:
   - Email: `admin@civicpulse.com`
   - Password: `Admin@123`
3. You should be redirected to admin dashboard

#### Test Officer Approval (Admin)
1. Login as admin
2. Go to Admin Panel
3. You should see pending officers
4. Click "Approve" on an officer
5. Copy the secret key shown in the alert
6. Share it with the officer

#### Test Officer Login
1. Logout from admin account
2. Go to login page
3. Enter officer credentials:
   - Email: jane@city.gov
   - Password: password123
   - Secret Key: (the key from approval step)
4. Click "Login"
5. You should be redirected to dashboard

## Troubleshooting

### Backend Issues

#### Port 8080 Already in Use
```bash
# Windows: Find process using port 8080
netstat -ano | findstr :8080

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change port in application.properties
server.port=8081
```

#### Database Connection Failed
- Verify PostgreSQL is running
- Check credentials in `application.properties`
- Ensure database `civicpulse_db` exists
- Check PostgreSQL logs for errors

#### Maven Build Fails
```bash
# Clean Maven cache
mvn clean

# Update dependencies
mvn dependency:resolve

# Rebuild
mvn clean install
```

### Frontend Issues

#### npm install Fails
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Port 3000 Already in Use
```bash
# Change port in vite.config.js
server: {
  port: 3001
}
```

#### CORS Errors
- Verify backend CORS configuration in `SecurityConfig.java`
- Ensure backend is running on port 8080
- Check browser console for specific error messages

### Database Issues

#### Tables Not Created
- Check `spring.jpa.hibernate.ddl-auto=update` in `application.properties`
- Verify database connection is successful
- Check application logs for Hibernate errors

#### Cannot Connect to Database
- Verify PostgreSQL service is running
- Check firewall settings
- Verify database credentials
- Test connection using psql: `psql -U postgres -d civicpulse_db`

## Development Workflow

### Backend Development
```bash
# Run with hot reload (if devtools enabled)
mvn spring-boot:run

# Run tests
mvn test

# Build JAR file
mvn clean package
```

### Frontend Development
```bash
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Production Deployment

### Backend
1. Update `application.properties` with production database credentials
2. Change JWT secret to a secure random string
3. Set `spring.jpa.hibernate.ddl-auto=validate` (not `update`)
4. Build JAR: `mvn clean package`
5. Run: `java -jar target/civicpulse-hub-1.0.0.jar`

### Frontend
1. Build: `npm run build`
2. Deploy `dist/` folder to web server (nginx, Apache, etc.)
3. Configure reverse proxy to backend API

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT secret (32+ characters)
- [ ] Use environment variables for sensitive data
- [ ] Enable HTTPS in production
- [ ] Configure CORS for specific domains only
- [ ] Use database user with limited privileges
- [ ] Regular security updates
- [ ] Enable database backups

## Support

If you encounter issues:
1. Check application logs
2. Verify all prerequisites are installed
3. Review error messages carefully
4. Check database connection
5. Verify all configuration files

## Next Steps

After successful setup:
1. Explore the API endpoints using Postman
2. Customize the frontend UI
3. Add additional features
4. Set up CI/CD pipeline
5. Deploy to production environment




