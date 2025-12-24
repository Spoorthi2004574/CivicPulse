import React, { createContext, useState, useEffect, useContext } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password, secretKey = null) => {
    try {
      const response = await authAPI.login({
        email,
        password,
        secretKey,
      })
      const { token, ...userData } = response.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      return { success: true, data: response.data }
    } catch (error) {
      // Extract error message from various response formats
      let errorMessage = 'Login failed. Please try again.'
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status
        const data = error.response.data
        
        // Try different error message formats
        if (data?.error) {
          errorMessage = data.error
        } else if (data?.message) {
          errorMessage = data.message
        } else if (typeof data === 'string') {
          errorMessage = data
        } else if (data?.errors) {
          // Validation errors - could be object or array
          if (Array.isArray(data.errors)) {
            errorMessage = data.errors.join(', ')
          } else if (typeof data.errors === 'object') {
            errorMessage = Object.values(data.errors).join(', ')
          } else {
            errorMessage = String(data.errors)
          }
        } else if (data && Object.keys(data).length > 0) {
          // Try to extract any error message from the response
          const firstKey = Object.keys(data)[0]
          errorMessage = data[firstKey] || errorMessage
        } else {
          // Default messages based on status code
          switch (status) {
            case 401:
              errorMessage = 'Invalid email or password. Please check your credentials.'
              break
            case 403:
              errorMessage = 'Access denied. Your account may not be approved yet.'
              break
            case 404:
              errorMessage = 'User not found. Please check your email address.'
              break
            case 400:
              errorMessage = 'Invalid request. Please check your input and try again.'
              break
            case 500:
              errorMessage = 'Server error. Please try again later.'
              break
            default:
              errorMessage = `Login failed (Status: ${status}). Please try again.`
          }
        }
        
        // Make error messages more user-friendly
        const lowerError = errorMessage.toLowerCase()
        if (lowerError.includes('bad credentials') || lowerError.includes('authentication failed')) {
          errorMessage = 'Invalid email or password. Please check your credentials.'
        } else if (lowerError.includes('invalid secret key')) {
          errorMessage = 'Invalid secret key. Please check the secret key provided by your administrator.'
        } else if (lowerError.includes('secret key is required')) {
          errorMessage = 'Secret key is required for officer login.'
        } else if (lowerError.includes('not approved') || lowerError.includes('pending')) {
          errorMessage = 'Your account is pending approval. Please wait for admin approval.'
        } else if (lowerError.includes('not active')) {
          errorMessage = 'Your account is not active. Please contact support.'
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Network error. Please check your internet connection and try again.'
      } else {
        // Error setting up the request
        errorMessage = error.message || 'An unexpected error occurred. Please try again.'
      }
      
      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  const signup = async (signupData) => {
    try {
      const response = await authAPI.signup(signupData)
      const { token, ...userData } = response.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Signup failed',
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isOfficer: user?.role === 'OFFICER',
    isCitizen: user?.role === 'CITIZEN',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


