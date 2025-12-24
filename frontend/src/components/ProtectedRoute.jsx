import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, role = null }) => {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return <div className="container">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (role && user?.role !== role) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute




