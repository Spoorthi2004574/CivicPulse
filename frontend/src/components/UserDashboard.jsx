import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import ComplaintForm from './ComplaintForm'
import ComplaintList from './ComplaintList'
import OfficerComplaintDashboard from './OfficerComplaintDashboard'

const UserDashboard = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  // Officer sees their assigned complaints
  if (user?.role === 'OFFICER') {
    if (user?.status === 'PENDING_VERIFICATION') {
      return (
        <div className="container">
          <div className="card">
            <h2>Welcome, {user?.name}!</h2>
            <div style={{ marginTop: '20px' }}>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> {user?.role}</p>
              {user?.department && (
                <p><strong>Department:</strong> {user?.department}</p>
              )}
              <div style={{
                marginTop: '20px',
                padding: '15px',
                background: '#fff3cd',
                borderRadius: '5px',
                color: '#856404'
              }}>
                <strong>Status:</strong> Your account is pending approval.
                Please wait for an admin to approve your account.
              </div>
            </div>
          </div>
        </div>
      )
    }

    return <OfficerComplaintDashboard />
  }

  // Citizen sees complaint filing and their complaints
  return (
    <div className="container">
      <div className="dashboard-tabs">
        <button
          className={activeTab === 'overview' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={activeTab === 'file' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('file')}
        >
          File Complaint
        </button>
        <button
          className={activeTab === 'my-complaints' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('my-complaints')}
        >
          My Complaints
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="card">
          <h2>Welcome, {user?.name}!</h2>
          <div style={{ marginTop: '20px' }}>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role}</p>
          </div>
        </div>
      )}

      {activeTab === 'file' && <ComplaintForm />}
      {activeTab === 'my-complaints' && <ComplaintList />}
    </div>
  )
}

export default UserDashboard




