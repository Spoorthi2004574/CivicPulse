# CivicPulse Hub – Unified Smart City Feedback System

## Authentication Module

A complete Spring Boot backend authentication system with JWT, Spring Security, and role-based access control.

### Features

- **User Roles**: CITIZEN, OFFICER, ADMIN
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different access levels for different user types
- **Officer Approval System**: Admin approval required for officers with secret key generation
- **Password Hashing**: BCrypt password encryption
- **Secret Key Hashing**: Secure secret key storage for officers

### Technology Stack

**Backend:**
- Spring Boot 3.2.0
- Spring Security 6
- JWT (jjwt 0.12.3)
- PostgreSQL Database
- JPA/Hibernate
- Lombok

**Frontend:**
- React 18.2.0
- React Router 6.20.0
- Axios 1.6.2
- Vite 5.0.8
- React Toastify

### Prerequisites

- Java 17 or higher
- PostgreSQL 12 or higher
- Maven 3.6+
- Node.js 16+ and npm (for frontend)

### Backend Setup Instructions

1. **Database Setup**
   - Create a PostgreSQL database named `civicpulse_db`
   - Update database credentials in `src/main/resources/application.properties`

2. **Configure Application Properties**
   - Edit `src/main/resources/application.properties`:
     ```properties
     spring.datasource.username=your_username
     spring.datasource.password=your_password
     jwt.secret=your-secret-key-min-256-bits-required
     ```

3. **Build and Run Backend**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
   Backend will run on `http://localhost:8080`

### Frontend Setup Instructions

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:3000`

5. **Default Admin Account**
   - Email: `admin@civicpulse.com`
   - Password: `Admin@123`
   - Created automatically on first run

### API Endpoints

#### Public Endpoints

##### 1. User Signup
- **URL**: `POST /auth/signup`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "CITIZEN",
    "department": null
  }
  ```
- **Response**: JWT token with user information

**For Officer Signup**:
  ```json
  {
    "name": "Jane Officer",
    "email": "jane@city.gov",
    "password": "password123",
    "role": "OFFICER",
    "department": "Transportation"
  }
  ```
- **Note**: Officer accounts are set to `PENDING_VERIFICATION` status and require admin approval

##### 2. User Login
- **URL**: `POST /auth/login`
- **Access**: Public
- **Request Body** (Citizen):
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Request Body** (Officer):
  ```json
  {
    "email": "jane@city.gov",
    "password": "password123",
    "secretKey": "generated-secret-key-here"
  }
  ```
- **Response**: JWT token with user information

#### Admin Endpoints (Require ADMIN role)

##### 3. Get Pending Officers
- **URL**: `GET /admin/officers/pending`
- **Access**: ADMIN only
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Response**: List of pending officer accounts

##### 4. Approve Officer
- **URL**: `POST /admin/officers/{id}/approve`
- **Access**: ADMIN only
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Response**: Officer details with generated secret key
  ```json
  {
    "officerId": 1,
    "officerName": "Jane Officer",
    "officerEmail": "jane@city.gov",
    "department": "Transportation",
    "secretKey": "AbCdEfGhIjKlMnOpQrStUvWxYz123456",
    "message": "Officer approved successfully"
  }
  ```

### User Roles and Flows

#### CITIZEN
1. Signs up with name, email, password
2. Account is immediately activated (status: ACTIVE)
3. Can login with email + password only
4. No admin approval required

#### OFFICER
1. Signs up with name, email, password, department
2. Account status set to PENDING_VERIFICATION
3. Cannot login until approved by admin
4. Admin approves → secret key generated
5. Officer logs in with email + password + secret key

#### ADMIN
1. Admin accounts are created manually or via data initializer
2. Cannot signup through public API
3. Full access to all endpoints

### Security Features

- **JWT Tokens**: Stateless authentication
- **Password Hashing**: BCrypt with salt
- **Secret Key Hashing**: Secure storage of officer secret keys
- **Role-based Authorization**: Spring Security method-level security
- **CORS Configuration**: Cross-origin resource sharing enabled

### Project Structure

```
src/main/java/com/project/auth/
├── config/
│   ├── DataInitializer.java
│   └── SecurityConfig.java
├── controller/
│   ├── AdminController.java
│   └── AuthController.java
├── dto/
│   ├── ApproveOfficerResponse.java
│   ├── JwtResponse.java
│   ├── LoginRequest.java
│   ├── SignupRequest.java
│   └── UserResponse.java
├── entity/
│   ├── Role.java
│   ├── Status.java
│   └── User.java
├── exception/
│   └── GlobalExceptionHandler.java
├── repository/
│   └── UserRepository.java
├── security/
│   ├── CustomUserDetailsService.java
│   ├── JwtAuthenticationFilter.java
│   └── JwtUtil.java
├── service/
│   ├── AdminService.java
│   ├── AuthService.java
│   └── impl/
│       ├── AdminServiceImpl.java
│       └── AuthServiceImpl.java
└── util/
    └── SecretKeyGenerator.java
```

### Testing the API

You can use tools like Postman or cURL to test the endpoints.

**Example: Citizen Signup**
```bash
curl -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "CITIZEN"
  }'
```

**Example: Admin Login**
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@civicpulse.com",
    "password": "Admin@123"
  }'
```

**Example: Get Pending Officers (Admin)**
```bash
curl -X GET http://localhost:8080/admin/officers/pending \
  -H "Authorization: Bearer <jwt_token>"
```

### Notes

- JWT tokens expire after 24 hours (configurable in `application.properties`)
- Secret keys are 32-character random strings
- All passwords and secret keys are hashed using BCrypt
- Admin signup is disabled for security reasons
- Officer accounts must be approved before they can login

### License

This project is part of the CivicPulse Hub system.

