# CivicPulse Hub - Frontend

React.js frontend for the CivicPulse Hub authentication system.

## Features

- User authentication (Login/Signup)
- Role-based access control
- Admin dashboard for officer approval
- JWT token management
- Protected routes
- Responsive design

## Installation

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev
```

The app will run on `http://localhost:3000`

## Build

```bash
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── UserDashboard.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── Navbar.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── package.json
└── vite.config.js
```

## API Configuration

The frontend is configured to connect to the backend at `http://localhost:8080`. 
Update the `API_URL` in `src/services/api.js` if your backend runs on a different port.

## Usage

1. **Signup**: Create a new account (Citizen or Officer)
2. **Login**: Login with email and password (Officers need secret key)
3. **Admin Panel**: Admins can approve pending officers
4. **Dashboard**: View user information and status




