import React, { useState, useEffect } from 'react'
import { complaintAPI } from '../services/api'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import './OfficerComplaintDashboard.css'
import './OfficerDashboardExtras.css'

const OfficerComplaintDashboard = () => {
    const [complaints, setComplaints] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        overdue: 0,
    })
    const [showProofModal, setShowProofModal] = useState(false)
    const [selectedComplaint, setSelectedComplaint] = useState(null)
    const [proofFile, setProofFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const { user } = useAuth()

    useEffect(() => {
        fetchComplaints()
    }, [])

    const fetchComplaints = async () => {
        try {
            const response = await complaintAPI.getOfficerComplaints()
            setComplaints(response.data)

            // Calculate stats including overdue
            const now = new Date()
            const overdueCount = response.data.filter(c => {
                if (c.status === 'RESOLVED' || c.status === 'REJECTED') return false
                if (!c.deadline) return false
                return new Date(c.deadline) < now
            }).length

            setStats({
                total: response.data.length,
                pending: response.data.filter(c => c.status === 'PENDING').length,
                inProgress: response.data.filter(c => c.status === 'IN_PROGRESS').length,
                resolved: response.data.filter(c => c.status === 'RESOLVED').length,
                overdue: overdueCount,
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

    const handleProofUpload = async () => {
        if (!proofFile) {
            toast.error('Please select a file to upload')
            return
        }

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('proof', proofFile)

            await complaintAPI.uploadProof(selectedComplaint.id, formData)
            toast.success('Proof uploaded successfully!')
            setShowProofModal(false)
            setProofFile(null)
            setSelectedComplaint(null)
            fetchComplaints()
        } catch (error) {
            toast.error('Failed to upload proof')
        } finally {
            setUploading(false)
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

    const getDeadlineStatus = (deadline, status) => {
        if (status === 'RESOLVED' || status === 'REJECTED') return 'completed'
        if (!deadline) return 'none'

        const now = new Date()
        const deadlineDate = new Date(deadline)
        const diff = deadlineDate - now
        const hoursLeft = diff / (1000 * 60 * 60)

        if (hoursLeft < 0) return 'overdue'
        if (hoursLeft < 24) return 'urgent'
        return 'active'
    }

    const getTimeRemaining = (deadline, status) => {
        if (status === 'RESOLVED' || status === 'REJECTED') return 'Completed'
        if (!deadline) return 'No deadline'

        const now = new Date()
        const deadlineDate = new Date(deadline)
        const diff = deadlineDate - now

        if (diff < 0) {
            const hours = Math.floor(Math.abs(diff) / (1000 * 60 * 60))
            const days = Math.floor(hours / 24)
            if (days > 0) return `Overdue by ${days} day${days > 1 ? 's' : ''}`
            return `Overdue by ${hours} hour${hours > 1 ? 's' : ''}`
        } else {
            const hours = Math.floor(diff / (1000 * 60 * 60))
            const days = Math.floor(hours / 24)
            if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`
            return `${hours} hour${hours > 1 ? 's' : ''} left`
        }
    }

    // Sort complaints: overdue first, then by creation date
    const sortedComplaints = [...complaints].sort((a, b) => {
        const aOverdue = getDeadlineStatus(a.deadline, a.status) === 'overdue'
        const bOverdue = getDeadlineStatus(b.deadline, b.status) === 'overdue'

        if (aOverdue && !bOverdue) return -1
        if (!aOverdue && bOverdue) return 1

        return new Date(b.createdAt) - new Date(a.createdAt)
    })

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
                {stats.overdue > 0 && (
                    <div className="stat-card stat-card-overdue">
                        <div className="stat-icon">⚠️</div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.overdue}</div>
                            <div className="stat-label">Overdue</div>
                        </div>
                    </div>
                )}
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
                        {sortedComplaints.map((complaint) => {
                            const deadlineStatus = getDeadlineStatus(complaint.deadline, complaint.status)
                            const isOverdue = deadlineStatus === 'overdue'

                            return (
                                <div
                                    key={complaint.id}
                                    className={`complaint-card ${isOverdue ? 'overdue-card' : ''}`}
                                >
                                    <div className="complaint-header">
                                        <span className="complaint-id">
                                            <span className="id-icon">🎫</span>
                                            #{complaint.id}
                                        </span>
                                        <div className="header-badges">
                                            <span className={`status-badge ${getStatusBadgeClass(complaint.status)}`}>
                                                {complaint.status.replace('_', ' ')}
                                            </span>
                                            {isOverdue && (
                                                <span className="overdue-badge">
                                                    ⚠️ OVERDUE
                                                </span>
                                            )}
                                        </div>
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
                                            {complaint.deadline && (
                                                <div className="detail-item">
                                                    <span className="detail-icon">⏰</span>
                                                    <span className="detail-label">Deadline:</span>
                                                    <span className={`detail-value deadline-${deadlineStatus}`}>
                                                        {new Date(complaint.deadline).toLocaleString()}
                                                        <br />
                                                        <small>{getTimeRemaining(complaint.deadline, complaint.status)}</small>
                                                    </span>
                                                </div>
                                            )}
                                            {complaint.proofOfWorkUrl && (
                                                <div className="detail-item">
                                                    <span className="detail-icon">📎</span>
                                                    <span className="detail-label">Proof:</span>
                                                    <span className="detail-value">
                                                        <a
                                                            href={`http://localhost:8081/uploads/${complaint.proofOfWorkUrl}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="proof-link"
                                                        >
                                                            View Uploaded Proof
                                                        </a>
                                                    </span>
                                                </div>
                                            )}
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
                                                {complaint.status !== 'RESOLVED' && (
                                                    <button
                                                        className="status-btn status-btn-proof"
                                                        onClick={() => {
                                                            setSelectedComplaint(complaint)
                                                            setShowProofModal(true)
                                                        }}
                                                    >
                                                        <span className="btn-icon">📸</span>
                                                        Upload Proof
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Proof Upload Modal */}
            {showProofModal && (
                <div className="modal-overlay" onClick={() => setShowProofModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Upload Proof of Work</h3>
                            <button className="close-btn" onClick={() => setShowProofModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p className="modal-description">
                                Upload photo evidence of the work completed for complaint #{selectedComplaint?.id}
                            </p>
                            <div className="file-upload-area">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setProofFile(e.target.files[0])}
                                    className="file-input"
                                    id="proof-file"
                                />
                                <label htmlFor="proof-file" className="file-label">
                                    <span className="upload-icon">📁</span>
                                    {proofFile ? proofFile.name : 'Choose a file...'}
                                </label>
                            </div>
                            {proofFile && (
                                <div className="file-preview">
                                    <img
                                        src={URL.createObjectURL(proofFile)}
                                        alt="Preview"
                                        className="preview-image"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowProofModal(false)}
                                disabled={uploading}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleProofUpload}
                                disabled={!proofFile || uploading}
                            >
                                {uploading ? 'Uploading...' : 'Upload Proof'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OfficerComplaintDashboard
