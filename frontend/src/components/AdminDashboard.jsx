import React, { useState, useEffect } from 'react'
import { adminAPI } from '../services/api'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import SecretKeyModal from './SecretKeyModal'
import AdminComplaintDashboard from './AdminComplaintDashboard'
import AnalyticsDashboard from './AnalyticsDashboard'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('officers')
  const [pendingOfficers, setPendingOfficers] = useState([])
  const [approvedOfficers, setApprovedOfficers] = useState([])
  const [stats, setStats] = useState({
    totalOfficers: 0,
    pendingOfficers: 0,
    approvedOfficers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [secretKeyModal, setSecretKeyModal] = useState({
    isOpen: false,
    secretKey: '',
    officerName: '',
    officerEmail: '',
    department: '',
  })

  useEffect(() => {
    if (activeTab === 'officers') {
      fetchOfficersData()
    }
  }, [activeTab])

  const fetchOfficersData = async () => {
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        adminAPI.getPendingOfficers(),
        adminAPI.getApprovedOfficers(),
      ])
      setPendingOfficers(pendingRes.data)
      setApprovedOfficers(approvedRes.data)
      setStats({
        totalOfficers: pendingRes.data.length + approvedRes.data.length,
        pendingOfficers: pendingRes.data.length,
        approvedOfficers: approvedRes.data.length,
      })
      setLoading(false)
    } catch (error) {
      toast.error('Failed to fetch officers data')
      setLoading(false)
    }
  }

  const handleApprove = async (officerId) => {
    if (!window.confirm('Are you sure you want to approve this officer?')) {
      return
    }

    try {
      const response = await adminAPI.approveOfficer(officerId)
      const { secretKey, officerName, officerEmail, department } = response.data

      // Show secret key in modal
      setSecretKeyModal({
        isOpen: true,
        secretKey,
        officerName,
        officerEmail,
        department,
      })

      toast.success('Officer approved successfully!')
      fetchOfficersData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to approve officer')
    }
  }

  const closeSecretKeyModal = () => {
    setSecretKeyModal({
      isOpen: false,
      secretKey: '',
      officerName: '',
      officerEmail: '',
      department: '',
    })
  }

  return (
    <>
      <div className="admin-dashboard-container">
        {/* Header Section */}
        <div className="admin-header">
          <div className="admin-header-content">
            <h1 className="admin-title">
              <span className="admin-icon">👑</span>
              Admin Dashboard
            </h1>
            <p className="admin-subtitle">
              Welcome back, <span className="admin-name">{user?.name}</span>
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">👮</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalOfficers}</div>
              <div className="stat-label">Total Officers</div>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-value">{stats.pendingOfficers}</div>
              <div className="stat-label">Pending Approvals</div>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.approvedOfficers}</div>
              <div className="stat-label">Approved Officers</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'officers' ? 'active' : ''}`}
            onClick={() => setActiveTab('officers')}
          >
            <span className="tab-icon">👮</span>
            Officer Approvals
          </button>
          <button
            className={`admin-tab ${activeTab === 'complaints' ? 'active' : ''}`}
            onClick={() => setActiveTab('complaints')}
          >
            <span className="tab-icon">📋</span>
            Complaint Management
          </button>
          <button
            className={`admin-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <span className="tab-icon">📊</span>
            Analytics
          </button>
        </div>

        {/* Content */}
        {activeTab === 'officers' && (
          <>
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading officers data...</p>
              </div>
            ) : (
              <div className="officers-content">
                <div className="content-card">
                  <div className="card-header">
                    <h2 className="card-title">
                      <span className="title-icon">⏳</span>
                      Pending Officer Approvals
                    </h2>
                    <span className="badge badge-warning">{pendingOfficers.length} Pending</span>
                  </div>
                  {pendingOfficers.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">✨</div>
                      <p className="empty-message">No pending officers to approve.</p>
                      <p className="empty-submessage">All officer registrations have been processed.</p>
                    </div>
                  ) : (
                    <div className="table-wrapper">
                      <table className="modern-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th>Created At</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingOfficers.map((officer) => (
                            <tr key={officer.id}>
                              <td>
                                <span className="id-badge">#{officer.id}</span>
                              </td>
                              <td className="officer-name">{officer.name}</td>
                              <td className="officer-email">{officer.email}</td>
                              <td>
                                <span className="department-badge">{officer.department}</span>
                              </td>
                              <td>
                                <span className={`status-badge status-${officer.status.toLowerCase()}`}>
                                  {officer.status}
                                </span>
                              </td>
                              <td className="date-cell">{new Date(officer.createdAt).toLocaleString()}</td>
                              <td>
                                <button
                                  className="btn-approve"
                                  onClick={() => handleApprove(officer.id)}
                                >
                                  <span className="btn-icon">✓</span>
                                  Approve
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'complaints' && <AdminComplaintDashboard />}

        {activeTab === 'analytics' && <AnalyticsDashboard role="ADMIN" />}
      </div>

      <SecretKeyModal
        isOpen={secretKeyModal.isOpen}
        onClose={closeSecretKeyModal}
        secretKey={secretKeyModal.secretKey}
        officerName={secretKeyModal.officerName}
        officerEmail={secretKeyModal.officerEmail}
        department={secretKeyModal.department}
      />
    </>
  )
}

export default AdminDashboard


