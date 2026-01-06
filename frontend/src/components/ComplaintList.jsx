import React, { useState, useEffect } from 'react'
import { complaintAPI } from '../services/api'
import { toast } from 'react-toastify'
import ComplaintProgressTracker from './ComplaintProgressTracker'
import './ComplaintList.css'

const ComplaintList = () => {
    const [complaints, setComplaints] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedComplaint, setExpandedComplaint] = useState(null)
    const [ratingModal, setRatingModal] = useState({ isOpen: false, complaintId: null, rating: 0, feedback: '' })
    const [reopenModal, setReopenModal] = useState({ isOpen: false, complaintId: null, reason: '' })

    useEffect(() => {
        fetchComplaints()
    }, [])

    const fetchComplaints = async () => {
        try {
            const response = await complaintAPI.getMyComplaints()
            setComplaints(response.data)
            setLoading(false)
        } catch (error) {
            toast.error('Failed to fetch complaints')
            setLoading(false)
        }
    }

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'PENDING':
                return 'status-pending'
            case 'IN_PROGRESS':
                return 'status-in-progress'
            case 'RESOLVED':
                return 'status-resolved'
            case 'REJECTED':
                return 'status-rejected'
            default:
                return ''
        }
    }

    const getPriorityBadgeClass = (priority) => {
        switch (priority) {
            case 'HIGH':
                return 'priority-high'
            case 'MEDIUM':
                return 'priority-medium'
            case 'LOW':
                return 'priority-low'
            default:
                return ''
        }
    }

    const getDeadlineClass = (deadline, status) => {
        if (status === 'RESOLVED' || status === 'REJECTED') {
            return 'deadline-completed'
        }
        const now = new Date()
        const deadlineDate = new Date(deadline)
        if (deadlineDate < now) {
            return 'deadline-overdue'
        }
        return 'deadline-active'
    }

    const getTimeRemaining = (deadline, status) => {
        if (status === 'RESOLVED' || status === 'REJECTED') {
            return ''
        }
        const now = new Date()
        const deadlineDate = new Date(deadline)
        const diff = deadlineDate - now

        if (diff < 0) {
            const hours = Math.floor(Math.abs(diff) / (1000 * 60 * 60))
            const days = Math.floor(hours / 24)
            if (days > 0) {
                return ` (Overdue by ${days} day${days > 1 ? 's' : ''})`
            }
            return ` (Overdue by ${hours} hour${hours > 1 ? 's' : ''})`
        } else {
            const hours = Math.floor(diff / (1000 * 60 * 60))
            const days = Math.floor(hours / 24)
            if (days > 0) {
                return ` (${days} day${days > 1 ? 's' : ''} left)`
            }
            return ` (${hours} hour${hours > 1 ? 's' : ''} left)`
        }
    }

    const handleRateClick = (complaintId) => {
        setRatingModal({ isOpen: true, complaintId, rating: 0, feedback: '' })
    }

    const handleRateSubmit = async () => {
        if (ratingModal.rating === 0) {
            toast.error('Please select a rating')
            return
        }
        try {
            await complaintAPI.rateComplaint(ratingModal.complaintId, ratingModal.rating, ratingModal.feedback)
            toast.success('Thank you for your feedback!')
            setRatingModal({ isOpen: false, complaintId: null, rating: 0, feedback: '' })
            fetchComplaints()
        } catch (error) {
            toast.error('Failed to submit rating')
        }
    }

    const handleReopenClick = (complaintId) => {
        setReopenModal({ isOpen: true, complaintId, reason: '' })
    }

    const handleReopenSubmit = async () => {
        if (!reopenModal.reason.trim()) {
            toast.error('Please provide a reason for reopening')
            return
        }
        try {
            await complaintAPI.reopenComplaint(reopenModal.complaintId, reopenModal.reason)
            toast.success('Complaint reopened successfully')
            setReopenModal({ isOpen: false, complaintId: null, reason: '' })
            fetchComplaints()
        } catch (error) {
            toast.error('Failed to reopen complaint')
        }
    }

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading complaints...</p>
            </div>
        )
    }

    return (
        <div className="complaint-list-container">
            <h2>My Complaints</h2>
            {complaints.length === 0 ? (
                <p className="no-complaints">No complaints filed yet.</p>
            ) : (
                <div className="complaints-grid">
                    {complaints.map((complaint) => (
                        <div
                            key={complaint.id}
                            className={`complaint-card ${complaint.escalated ? 'escalated' : ''}`}
                        >
                            <div className="complaint-header">
                                <span className="complaint-id">#{complaint.id}</span>
                                <div className="badge-group">
                                    <span className={`status-badge ${getStatusBadgeClass(complaint.status)}`}>
                                        {complaint.status}
                                    </span>
                                    {complaint.escalated && (
                                        <span className="escalation-badge">
                                            ⚠️ ESCALATED
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="complaint-body">
                                <h3>{complaint.department}</h3>
                                <p className="complaint-description">{complaint.description}</p>
                                <div className="complaint-details">
                                    <p><strong>Location:</strong> {complaint.locationAddress || `${complaint.latitude}, ${complaint.longitude}`}</p>
                                    {complaint.priority && (
                                        <p>
                                            <strong>Priority:</strong>{' '}
                                            <span className={`priority-badge ${getPriorityBadgeClass(complaint.priority)}`}>
                                                {complaint.priority}
                                            </span>
                                        </p>
                                    )}
                                    {complaint.assignedOfficer && (
                                        <p><strong>Assigned Officer:</strong> {complaint.assignedOfficer.name}</p>
                                    )}
                                    {complaint.deadline && (
                                        <p>
                                            <strong>Deadline:</strong>{' '}
                                            <span className={getDeadlineClass(complaint.deadline, complaint.status)}>
                                                {new Date(complaint.deadline).toLocaleString()}
                                                {getTimeRemaining(complaint.deadline, complaint.status)}
                                            </span>
                                        </p>
                                    )}
                                    {complaint.escalated && complaint.escalationReason && (
                                        <p className="escalation-reason">
                                            <strong>Escalation Reason:</strong> {complaint.escalationReason}
                                        </p>
                                    )}
                                    <p className="complaint-date">
                                        Filed on: {new Date(complaint.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                {complaint.status === 'RESOLVED' && !complaint.rating && (
                                    <div className="complaint-actions">
                                        <button className="btn-rate" onClick={() => handleRateClick(complaint.id)}>
                                            ⭐ Rate Service
                                        </button>
                                        <button className="btn-reopen" onClick={() => handleReopenClick(complaint.id)}>
                                            🔄 Reopen Complaint
                                        </button>
                                    </div>
                                )}
                                {complaint.rating && (
                                    <div className="rating-display">
                                        <strong>Your Rating:</strong> {'⭐'.repeat(complaint.rating)}
                                        {complaint.feedback && <p><em>"{complaint.feedback}"</em></p>}
                                    </div>
                                )}
                                {complaint.reopened && (
                                    <div className="reopen-notice">
                                        ⚠️ This complaint was reopened on {new Date(complaint.reopenedAt).toLocaleString()}
                                        <br /><strong>Reason:</strong> {complaint.reopenReason}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* Rating Modal */}
            {ratingModal.isOpen && (
                <div className="modal-overlay" onClick={() => setRatingModal({ ...ratingModal, isOpen: false })}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Rate Your Experience</h3>
                        <p>How satisfied are you with the resolution?</p>
                        <div className="star-rating">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`star ${ratingModal.rating >= star ? 'filled' : ''}`}
                                    onClick={() => setRatingModal({ ...ratingModal, rating: star })}
                                >
                                    ⭐
                                </span>
                            ))}
                        </div>
                        <textarea
                            placeholder="Optional feedback..."
                            value={ratingModal.feedback}
                            onChange={(e) => setRatingModal({ ...ratingModal, feedback: e.target.value })}
                            rows="4"
                            className="feedback-textarea"
                        />
                        <div className="modal-actions">
                            <button className="btn btn-primary" onClick={handleRateSubmit}>
                                Submit Rating
                            </button>
                            <button className="btn btn-secondary" onClick={() => setRatingModal({ ...ratingModal, isOpen: false })}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reopen Modal */}
            {reopenModal.isOpen && (
                <div className="modal-overlay" onClick={() => setReopenModal({ ...reopenModal, isOpen: false })}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Reopen Complaint</h3>
                        <p>Please explain why you're not satisfied with the resolution:</p>
                        <textarea
                            placeholder="Reason for reopening..."
                            value={reopenModal.reason}
                            onChange={(e) => setReopenModal({ ...reopenModal, reason: e.target.value })}
                            rows="4"
                            className="reopen-textarea"
                        />
                        <div className="modal-actions">
                            <button className="btn btn-warning" onClick={handleReopenSubmit}>
                                Reopen Complaint
                            </button>
                            <button className="btn btn-secondary" onClick={() => setReopenModal({ ...reopenModal, isOpen: false })}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ComplaintList
