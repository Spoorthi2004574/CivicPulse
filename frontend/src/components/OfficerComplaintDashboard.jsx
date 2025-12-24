import React, { useState, useEffect } from 'react'
import { complaintAPI } from '../services/api'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import './OfficerComplaintDashboard.css'

const OfficerComplaintDashboard = () => {
    const [complaints, setComplaints] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
    })
    const { user } = useAuth()

    useEffect(() => {
        fetchComplaints()
    }, [])

    const fetchComplaints = async () => {
        try {
            const response = await complaintAPI.getAllComplaints()
            const assignedComplaints = response.data.filter(
                (c) => c.assignedOfficer?.id === user.id
            )
            setComplaints(assignedComplaints)

            // Calculate stats
            setStats({
                total: assignedComplaints.length,
                pending: assignedComplaints.filter(c => c.status === 'PENDING').length,
                inProgress: assignedComplaints.filter(c => c.status === 'IN_PROGRESS').length,
                resolved: assignedComplaints.filter(c => c.status === 'RESOLVED').length,
            })

            setLoading(false)
        } catch (error) {
            toast.error('Failed to fetch complaints')
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (complaintId, newStatus) => {
        try {
            await complaintAPI.updateStatus(complaintId, newStatus)
            toast.success('Status updated successfully!')
            fetchComplaints()
        } catch (error) {
            toast.error('Failed to update status')
        }
    }

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'PENDING': return 'status-pending'
            case 'IN_PROGRESS': return 'status-in-progress'
            case 'RESOLVED': return 'status-resolved'
            case 'REJECTED': return 'status-rejected'
            default: return ''
        }
    }

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'HIGH': return '🔴'
            case 'MEDIUM': return '🟡'
            case 'LOW': return '🟢'
            default: return '⚪'
        }
    }

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading your complaints...</p>
            </div>
        )
    }

    return (
        <div className="officer-dashboard-container">
            {/* Header Section */}
            <div className="officer-header">
                <div className="officer-header-content">
                    <h1 className="officer-title">
                        <span className="officer-icon">👮</span>
                        Officer Dashboard
                    </h1>
                    <p className="officer-subtitle">
                        Welcome, <span className="officer-name">{user?.name}</span> - {user?.department}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card stat-card-total">
                    <div className="stat-icon">📋</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Total Assigned</div>
                    </div>
                </div>
                <div className="stat-card stat-card-pending">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.pending}</div>
                        <div className="stat-label">Pending</div>
                    </div>
                </div>
                <div className="stat-card stat-card-progress">
                    <div className="stat-icon">⚙️</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.inProgress}</div>
                        <div className="stat-label">In Progress</div>
                    </div>
                </div>
                <div className="stat-card stat-card-resolved">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.resolved}</div>
                        <div className="stat-label">Resolved</div>
                    </div>
                </div>
            </div>

            {/* Complaints Section */}
            <div className="complaints-section">
                <div className="section-header">
                    <h2 className="section-title">
                        <span className="title-icon">📝</span>
                        My Assigned Complaints
                    </h2>
                    <span className="badge badge-info">{complaints.length} Total</span>
                </div>

                {complaints.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <p className="empty-message">No complaints assigned to you yet.</p>
                        <p className="empty-submessage">Check back later for new assignments.</p>
                    </div>
                ) : (
                    <div className="complaints-grid">
                        {complaints.map((complaint) => (
                            <div key={complaint.id} className="complaint-card">
                                <div className="complaint-header">
                                    <span className="complaint-id">
                                        <span className="id-icon">🎫</span>
                                        #{complaint.id}
                                    </span>
                                    <span className={`status-badge ${getStatusBadgeClass(complaint.status)}`}>
                                        {complaint.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <div className="complaint-body">
                                    <div className="department-badge-wrapper">
                                        <span className="department-badge">
                                            <span className="dept-icon">🏢</span>
                                            {complaint.department}
                                        </span>
                                        {complaint.priority && (
                                            <span className={`priority-badge priority-${complaint.priority.toLowerCase()}`}>
                                                {getPriorityIcon(complaint.priority)} {complaint.priority}
                                            </span>
                                        )}
                                    </div>

                                    <p className="complaint-description">{complaint.description}</p>

                                    <div className="complaint-details">
                                        <div className="detail-item">
                                            <span className="detail-icon">👤</span>
                                            <span className="detail-label">Citizen:</span>
                                            <span className="detail-value">{complaint.citizen?.name}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-icon">📍</span>
                                            <span className="detail-label">Location:</span>
                                            <span className="detail-value">
                                                {complaint.locationAddress || `${complaint.latitude}, ${complaint.longitude}`}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-icon">📅</span>
                                            <span className="detail-label">Filed:</span>
                                            <span className="detail-value">
                                                {new Date(complaint.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="status-actions">
                                        <label className="action-label">
                                            <span className="action-icon">🔄</span>
                                            Update Status
                                        </label>
                                        <div className="status-buttons">
                                            <button
                                                className={`status-btn status-btn-progress ${complaint.status === 'IN_PROGRESS' ? 'active' : ''}`}
                                                onClick={() => handleStatusUpdate(complaint.id, 'IN_PROGRESS')}
                                                disabled={complaint.status === 'IN_PROGRESS' || complaint.status === 'RESOLVED'}
                                            >
                                                <span className="btn-icon">⚙️</span>
                                                In Progress
                                            </button>
                                            <button
                                                className={`status-btn status-btn-resolved ${complaint.status === 'RESOLVED' ? 'active' : ''}`}
                                                onClick={() => handleStatusUpdate(complaint.id, 'RESOLVED')}
                                                disabled={complaint.status === 'RESOLVED'}
                                            >
                                                <span className="btn-icon">✓</span>
                                                Resolved
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default OfficerComplaintDashboard
