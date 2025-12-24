import React, { useState, useEffect } from 'react'
import { complaintAPI } from '../services/api'
import { toast } from 'react-toastify'
import './ComplaintList.css'

const ComplaintList = () => {
    const [complaints, setComplaints] = useState([])
    const [loading, setLoading] = useState(true)

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
                        <div key={complaint.id} className="complaint-card">
                            <div className="complaint-header">
                                <span className="complaint-id">#{complaint.id}</span>
                                <span className={`status-badge ${getStatusBadgeClass(complaint.status)}`}>
                                    {complaint.status}
                                </span>
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
                                    <p className="complaint-date">
                                        Filed on: {new Date(complaint.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ComplaintList
