import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CITIZEN',
    department: '',
  })
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const signupData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      department: formData.role === 'OFFICER' ? formData.department : null,
    }

    setLoading(true)
    const result = await signup(signupData)
    setLoading(false)

    if (result.success) {
      if (result.data.role === 'OFFICER') {
        toast.info('Your account is pending approval. Please wait for admin approval.')
        navigate('/login')
      } else {
        // Citizen signup - redirect to login page
        toast.success('Signup successful! Please login to continue.')
        navigate('/login')
      }
    } else {
      toast.error(result.error || 'Signup failed')
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Sign Up for CivicPulse Hub</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="CITIZEN">Citizen</option>
              <option value="OFFICER">Officer</option>
            </select>
          </div>
          {formData.role === 'OFFICER' && (
            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                placeholder="e.g., Transportation, Health, etc."
              />
            </div>
          )}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <div className="link">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  )
}

export default Signup


