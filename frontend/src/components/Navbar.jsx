import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

const Navbar = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🏛️ CivicPulse
        </Link>

        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        <div className={`navbar-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {!isAuthenticated ? (
            <>
              <Link to="/" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link to="/login" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
              <Link to="/signup" className="navbar-link navbar-link-signup" onClick={() => setMobileMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link to="/" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <span className="navbar-user">
                {user?.name} ({user?.role})
              </span>
              {isAdmin && (
                <Link to="/admin" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
                  Admin Panel
                </Link>
              )}
              <Link to="/dashboard" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </Link>
              <button onClick={handleLogout} className="navbar-logout">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar




