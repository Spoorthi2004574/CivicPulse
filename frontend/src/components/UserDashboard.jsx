import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import ComplaintForm from './ComplaintForm'
import ComplaintList from './ComplaintList'
import OfficerComplaintDashboard from './OfficerComplaintDashboard'
import AnalyticsDashboard from './AnalyticsDashboard'

const UserDashboard = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  // Officer/Operator sees their specific dashboards
  if (user?.role === 'OFFICER' || user?.role === 'OPERATOR') {
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

    if (user?.role === 'OPERATOR') {
      return <OfficerComplaintDashboard />
    }

    // Role is OFFICER - Show Analytics and link to complaints
    return (
      <div className="container" style={{ padding: '0' }}>
        <div className="dashboard-tabs" style={{ padding: '0 20px', margin: '20px 0' }}>
          <button
            className={activeTab === 'analytics' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('analytics')}
          >
            Zone Analytics
          </button>
          <button
            className={activeTab === 'complaints' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('complaints')}
          >
            Detailed Complaints
          </button>
        </div>

        {activeTab === 'analytics' || activeTab === 'overview' ? (
          <AnalyticsDashboard role="OFFICER" />
        ) : (
          <OfficerComplaintDashboard />
        )}
      </div>
    )
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




