import React, { useState, useEffect } from 'react'
import { complaintAPI, adminAPI } from '../services/api'
import { toast } from 'react-toastify'
import './AdminComplaintDashboard.css'

const AdminComplaintDashboard = () => {
    const [complaints, setComplaints] = useState([])
    const [officers, setOfficers] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedComplaint, setSelectedComplaint] = useState(null)
    const [assignModal, setAssignModal] = useState({
        isOpen: false,
        complaintId: null,
        officerId: '',
        priority: 'MEDIUM',
    })
    const [duplicates, setDuplicates] = useState([])
    const [showDuplicates, setShowDuplicates] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [complaintsRes, officersRes] = await Promise.all([
                complaintAPI.getAllComplaints(),
                adminAPI.getApprovedOfficers(), // Get approved officers for assignment
            ])
            setComplaints(complaintsRes.data)
            setOfficers(officersRes.data)
            setLoading(false)
        } catch (error) {
            toast.error('Failed to fetch data')
            setLoading(false)
        }
    }

    const handleAssignClick = (complaint) => {
        setAssignModal({
            isOpen: true,
            complaintId: complaint.id,
            officerId: complaint.assignedOfficer?.id || '',
            priority: complaint.priority || 'MEDIUM',
        })
    }

    const handleAssignSubmit = async () => {
        try {
            await complaintAPI.assignComplaint(
                assignModal.complaintId,
                assignModal.officerId,
                assignModal.priority
            )
            toast.success('Complaint assigned successfully!')
            setAssignModal({ isOpen: false, complaintId: null, officerId: '', priority: 'MEDIUM' })
            fetchData()
        } catch (error) {
            toast.error('Failed to assign complaint')
        }
    }

    const handleCheckDuplicates = async (complaintId) => {
        try {
            const response = await complaintAPI.checkDuplicates(complaintId)
            setDuplicates(response.data)
            setSelectedComplaint(complaintId)
            setShowDuplicates(true)
            if (response.data.length === 0) {
                toast.info('No duplicates found')
            }
        } catch (error) {
            toast.error('Failed to check duplicates')
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

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <div className="admin-complaint-dashboard">
            <h2>Complaint Management</h2>

            <div className="complaints-table-container">
                <table className="complaints-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Department</th>
                            <th>Description</th>
                            <th>Citizen</th>
                            <th>Status</th>
                            <th>Priority</th>
                            <th>Assigned Officer</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {complaints.map((complaint) => (
                            <tr key={complaint.id}>
                                <td>{complaint.id}</td>
                                <td>{complaint.department}</td>
                                <td className="description-cell">{complaint.description.substring(0, 50)}...</td>
                                <td>{complaint.citizen?.name}</td>
                                <td>
                                    <span className={`status-badge ${getStatusBadgeClass(complaint.status)}`}>
                                        {complaint.status}
                                    </span>
                                </td>
                                <td>
                                    {complaint.priority ? (
                                        <span className={`priority-badge priority-${complaint.priority.toLowerCase()}`}>
                                            {complaint.priority}
                                        </span>
                                    ) : (
                                        <span className="priority-badge">Not Set</span>
                                    )}
                                </td>
                                <td>{complaint.assignedOfficer?.name || 'Unassigned'}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn-small btn-primary"
                                            onClick={() => handleAssignClick(complaint)}
                                        >
                                            Assign
                                        </button>
                                        <button
                                            className="btn-small btn-secondary"
                                            onClick={() => handleCheckDuplicates(complaint.id)}
                                        >
                                            Check Duplicates
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Assign Modal */}
            {assignModal.isOpen && (
                <div className="modal-overlay" onClick={() => setAssignModal({ ...assignModal, isOpen: false })}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Assign Complaint</h3>
                        <div className="form-group">
                            <label>Officer</label>
                            <select
                                value={assignModal.officerId}
                                onChange={(e) => setAssignModal({ ...assignModal, officerId: e.target.value })}
                            >
                                <option value="">Select Officer</option>
                                {officers.map((officer) => (
                                    <option key={officer.id} value={officer.id}>
                                        {officer.name} - {officer.department}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Priority</label>
                            <select
                                value={assignModal.priority}
                                onChange={(e) => setAssignModal({ ...assignModal, priority: e.target.value })}
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-primary" onClick={handleAssignSubmit}>
                                Assign
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setAssignModal({ ...assignModal, isOpen: false })}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Duplicates Modal */}
            {showDuplicates && (
                <div className="modal-overlay" onClick={() => setShowDuplicates(false)}>
                    <div className="modal-content duplicates-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Potential Duplicate Complaints</h3>
                        {duplicates.length === 0 ? (
                            <p>No duplicates found for this complaint.</p>
                        ) : (
                            <div className="duplicates-list">
                                {duplicates.map((dup) => (
                                    <div key={dup.id} className="duplicate-card">
                                        <p><strong>ID:</strong> {dup.id}</p>
                                        <p><strong>Department:</strong> {dup.department}</p>
                                        <p><strong>Description:</strong> {dup.description}</p>
                                        <p><strong>Location:</strong> {dup.locationAddress}</p>
                                        <p><strong>Filed:</strong> {new Date(dup.createdAt).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button className="btn btn-secondary" onClick={() => setShowDuplicates(false)}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminComplaintDashboard
