import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'

const Login = () => {
  const location = useLocation()
  const roleFromState = location.state?.role

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    secretKey: '',
  })
  const [showSecretKey, setShowSecretKey] = useState(false)
  const [isOfficerLogin, setIsOfficerLogin] = useState(roleFromState === 'OFFICER')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
    secretKey: '',
  })
  const { login } = useAuth()
  const navigate = useNavigate()

  // Auto-check officer checkbox if coming from Officer panel
  useEffect(() => {
    if (roleFromState === 'OFFICER') {
      setIsOfficerLogin(true)
      setShowSecretKey(true)
    }
  }, [roleFromState])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Clear errors when user starts typing
    setError('')
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: '',
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Clear previous errors
    setError('')
    setFieldErrors({ email: '', password: '', secretKey: '' })

    // Client-side validation
    if (!formData.email.trim()) {
      setFieldErrors(prev => ({ ...prev, email: 'Email is required' }))
      return
    }

    if (!formData.password) {
      setFieldErrors(prev => ({ ...prev, password: 'Password is required' }))
      return
    }

    if (isOfficerLogin && !formData.secretKey.trim()) {
      setFieldErrors(prev => ({ ...prev, secretKey: 'Secret key is required for officer login' }))
      toast.error('Secret key is required for officer login')
      return
    }

    setLoading(true)
    try {
      const result = await login(
        formData.email.trim(),
        formData.password,
        isOfficerLogin ? formData.secretKey.trim() : null
      )

      if (result.success) {
        toast.success('Login successful!')
        if (result.data.role === 'ADMIN') {
          navigate('/admin')
        } else {
          navigate('/dashboard')
        }
      } else {
        const errorMsg = result.error || 'Login failed'
        setError(errorMsg)
        toast.error(errorMsg)

        // Try to identify which field has the error
        const lowerError = errorMsg.toLowerCase()
        if (lowerError.includes('email') || lowerError.includes('user not found') || lowerError.includes('user not found with email')) {
          setFieldErrors(prev => ({ ...prev, email: errorMsg }))
        } else if (lowerError.includes('secret key') || lowerError.includes('invalid secret')) {
          setFieldErrors(prev => ({ ...prev, secretKey: errorMsg }))
        } else if (lowerError.includes('password') || (lowerError.includes('invalid') && !lowerError.includes('secret') && !lowerError.includes('email'))) {
          setFieldErrors(prev => ({ ...prev, password: errorMsg }))
        } else if (lowerError.includes('not approved') || lowerError.includes('pending') || lowerError.includes('not active')) {
          setError(errorMsg)
        } else if (lowerError.includes('bad credentials') || lowerError.includes('authentication failed')) {
          // Could be either email or password, show general error
          setError('Invalid email or password. Please check your credentials.')
        }
      }
    } catch (err) {
      const errorMsg = 'An unexpected error occurred. Please try again.'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Login to CivicPulse Hub</h2>
        <form onSubmit={handleSubmit}>
          {error && !Object.values(fieldErrors).some(err => err) && (
            <div className="error-message-box">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={fieldErrors.email ? 'input-error' : ''}
            />
            {fieldErrors.email && (
              <span className="field-error">{fieldErrors.email}</span>
            )}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={fieldErrors.password ? 'input-error' : ''}
            />
            {fieldErrors.password && (
              <span className="field-error">{fieldErrors.password}</span>
            )}
          </div>
          <div className="form-group">
            <div className="secret-key-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={isOfficerLogin}
                  onChange={(e) => {
                    setIsOfficerLogin(e.target.checked)
                    setShowSecretKey(e.target.checked)
                    if (!e.target.checked) {
                      setFormData({ ...formData, secretKey: '' })
                    }
                  }}
                />
                <span>I am an Officer</span>
              </label>
            </div>
            {isOfficerLogin && (
              <div className="secret-key-input-group">
                <label htmlFor="secretKey">Secret Key <span className="required">*</span></label>
                <div className="input-with-icon">
                  <input
                    type={showSecretKey ? 'text' : 'password'}
                    id="secretKey"
                    name="secretKey"
                    value={formData.secretKey}
                    onChange={handleChange}
                    placeholder="Enter your secret key"
                    required={isOfficerLogin}
                    className={`secret-key-input ${fieldErrors.secretKey ? 'input-error' : ''}`}
                  />
                  <button
                    type="button"
                    className="toggle-visibility"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    title={showSecretKey ? 'Hide' : 'Show'}
                  >
                    {showSecretKey ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {fieldErrors.secretKey ? (
                  <span className="field-error">{fieldErrors.secretKey}</span>
                ) : (
                  <p className="secret-key-hint">
                    Enter the secret key provided by your administrator
                  </p>
                )}
              </div>
            )}
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  )
}

export default Login


