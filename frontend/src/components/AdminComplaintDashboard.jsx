import React, { useState, useEffect } from 'react'
import { complaintAPI, adminAPI } from '../services/api'
import { toast } from 'react-toastify'
import './AdminComplaintDashboard.css'
import './AdminDashboardExtras.css'

const AdminComplaintDashboard = () => {
    const [complaints, setComplaints] = useState([])
    const [filteredComplaints, setFilteredComplaints] = useState([])
    const [officers, setOfficers] = useState([])
    const [loading, setLoading] = useState(true)
    const [statistics, setStatistics] = useState(null)
    const [selectedComplaint, setSelectedComplaint] = useState(null)
    const [assignModal, setAssignModal] = useState({
        isOpen: false,
        complaintId: null,
        officerId: '',
        priority: 'MEDIUM',
        deadline: '',
    })
    const [duplicates, setDuplicates] = useState([])
    const [showDuplicates, setShowDuplicates] = useState(false)
    const [validationModal, setValidationModal] = useState({
        isOpen: false,
        complaint: null,
        locationCheck: false,
        imageQualityCheck: false,
        departmentMatchCheck: false,
    })
    const [rejectionModal, setRejectionModal] = useState({
        isOpen: false,
        complaintId: null,
        reason: '',
    })

    // Filter states
    const [filters, setFilters] = useState({
        department: '',
        status: '',
        priority: '',
        search: '',
        validationStatus: '',
    })

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        applyFilters()
    }, [complaints, filters])

    const fetchData = async () => {
        try {
            const [complaintsRes, officersRes, statsRes] = await Promise.all([
                complaintAPI.getAllComplaints(),
                adminAPI.getApprovedOfficers(),
                complaintAPI.getStatistics(),
            ])
            setComplaints(complaintsRes.data)
            setOfficers(officersRes.data)
            setStatistics(statsRes.data)
            setLoading(false)
        } catch (error) {
            toast.error('Failed to fetch data')
            setLoading(false)
        }
    }

    const applyFilters = () => {
        let filtered = [...complaints]

        if (filters.department) {
            filtered = filtered.filter(c => c.department === filters.department)
        }
        if (filters.status) {
            filtered = filtered.filter(c => c.status === filters.status)
        }
        if (filters.priority) {
            filtered = filtered.filter(c => c.priority === filters.priority)
        }
        if (filters.validationStatus) {
            filtered = filtered.filter(c => c.validationStatus === filters.validationStatus)
        }
        if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            filtered = filtered.filter(c =>
                c.id.toString().includes(searchLower) ||
                c.description.toLowerCase().includes(searchLower) ||
                c.citizen?.name.toLowerCase().includes(searchLower)
            )
        }

        setFilteredComplaints(filtered)
    }

    const handleAssignClick = (complaint) => {
        setAssignModal({
            isOpen: true,
            complaintId: complaint.id,
            officerId: complaint.assignedOfficer?.id || '',
            priority: complaint.priority || 'MEDIUM',
            deadline: complaint.deadline ? complaint.deadline.substring(0, 16) : '',
        })
    }

    const handleAssignSubmit = async () => {
        try {
            await complaintAPI.assignComplaint(
                assignModal.complaintId,
                assignModal.officerId,
                assignModal.priority,
                assignModal.deadline
            )
            toast.success('Complaint assigned successfully!')
            setAssignModal({ isOpen: false, complaintId: null, officerId: '', priority: 'MEDIUM', deadline: '' })
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

    const handleValidateClick = (complaint) => {
        const hasLocation = !!(complaint.latitude && complaint.longitude) || !!complaint.locationAddress
        setValidationModal({
            isOpen: true,
            complaint: complaint,
            locationCheck: hasLocation,
            imageQualityCheck: false,
            departmentMatchCheck: false,
        })
    }

    const handleValidateSubmit = async () => {
        try {
            await complaintAPI.validateComplaint(validationModal.complaint.id)
            toast.success('Complaint validated successfully!')
            setValidationModal({ isOpen: false, complaint: null, locationCheck: false, imageQualityCheck: false, departmentMatchCheck: false })
            fetchData()
        } catch (error) {
            toast.error('Failed to validate complaint')
        }
    }

    const handleRejectClick = (complaint) => {
        setRejectionModal({
            isOpen: true,
            complaintId: complaint.id,
            reason: '',
        })
        setValidationModal({ isOpen: false, complaint: null, locationCheck: false, imageQualityCheck: false, departmentMatchCheck: false })
    }

    const handleRejectSubmit = async () => {
        if (!rejectionModal.reason.trim()) {
            toast.error('Please provide a rejection reason')
            return
        }
        try {
            await complaintAPI.rejectComplaint(rejectionModal.complaintId, rejectionModal.reason)
            toast.success('Complaint rejected successfully!')
            setRejectionModal({ isOpen: false, complaintId: null, reason: '' })
            fetchData()
        } catch (error) {
            toast.error('Failed to reject complaint')
        }
    }

    const getValidationStatusBadgeClass = (validationStatus) => {
        switch (validationStatus) {
            case 'PENDING_VALIDATION': return 'validation-pending'
            case 'VALIDATED': return 'validation-validated'
            case 'REJECTED_BY_ADMIN': return 'validation-rejected'
            default: return ''
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

    const isOverdue = (deadline) => {
        if (!deadline) return false
        return new Date(deadline) < new Date()
    }

    const getDepartments = () => {
        return [...new Set(complaints.map(c => c.department))]
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
            <h2>📊 Complaint Management</h2>

            {/* Statistics Cards */}
            {statistics && (
                <div className="stats-grid">
                    <div className="stat-card stat-total">
                        <div className="stat-icon">📋</div>
                        <div className="stat-content">
                            <h3>{statistics.total}</h3>
                            <p>Total Complaints</p>
                        </div>
                    </div>
                    <div className="stat-card stat-pending">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-content">
                            <h3>{statistics.byStatus.PENDING}</h3>
                            <p>Pending</p>
                        </div>
                    </div>
                    <div className="stat-card stat-progress">
                        <div className="stat-icon">🔄</div>
                        <div className="stat-content">
                            <h3>{statistics.byStatus.IN_PROGRESS}</h3>
                            <p>In Progress</p>
                        </div>
                    </div>
                    <div className="stat-card stat-resolved">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <h3>{statistics.byStatus.RESOLVED}</h3>
                            <p>Resolved</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="filters-container">
                <div className="filter-group">
                    <input
                        type="text"
                        placeholder="🔍 Search by ID, description, or citizen..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="filter-input search-input"
                    />
                </div>
                <div className="filter-group">
                    <select
                        value={filters.department}
                        onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                        className="filter-select"
                    >
                        <option value="">All Departments</option>
                        {getDepartments().map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="filter-select"
                    >
                        <option value="">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
                <div className="filter-group">
                    <select
                        value={filters.priority}
                        onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                        className="filter-select"
                    >
                        <option value="">All Priorities</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                    </select>
                </div>
                <div className="filter-group">
                    <select
                        value={filters.validationStatus}
                        onChange={(e) => setFilters({ ...filters, validationStatus: e.target.value })}
                        className="filter-select"
                    >
                        <option value="">All Validation Statuses</option>
                        <option value="PENDING_VALIDATION">Pending Validation</option>
                        <option value="VALIDATED">Validated</option>
                        <option value="REJECTED_BY_ADMIN">Rejected by Admin</option>
                    </select>
                </div>
                {(filters.department || filters.status || filters.priority || filters.search || filters.validationStatus) && (
                    <button
                        className="btn-clear-filters"
                        onClick={() => setFilters({ department: '', status: '', priority: '', search: '', validationStatus: '' })}
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            <div className="results-count">
                Showing {filteredComplaints.length} of {complaints.length} complaints
            </div>

            <div className="complaints-table-container">
                <table className="complaints-table">
                    <thead>
                        <tr>
                            <th title="Unique complaint identifier">
                                <span className="th-content">
                                    <span className="th-icon">🎫</span>
                                    ID
                                </span>
                            </th>
                            <th title="Service department responsible for this complaint">
                                <span className="th-content">
                                    <span className="th-icon">🏢</span>
                                    Department
                                </span>
                            </th>
                            <th title="Brief description of the complaint">
                                <span className="th-content">
                                    <span className="th-icon">📝</span>
                                    Description
                                </span>
                            </th>
                            <th title="Photo uploaded by citizen">
                                <span className="th-content">
                                    <span className="th-icon">📷</span>
                                    Photo
                                </span>
                            </th>
                            <th title="Citizen who filed this complaint">
                                <span className="th-content">
                                    <span className="th-icon">👤</span>
                                    Citizen
                                </span>
                            </th>
                            <th title="Current status of the complaint">
                                <span className="th-content">
                                    <span className="th-icon">📊</span>
                                    Status
                                </span>
                            </th>
                            <th title="Validation status by admin">
                                <span className="th-content">
                                    <span className="th-icon">✅</span>
                                    Validation
                                </span>
                            </th>
                            <th title="Urgency level (HIGH: 48h, MEDIUM: 96h, LOW: 168h)">
                                <span className="th-content">
                                    <span className="th-icon">⚡</span>
                                    Priority
                                </span>
                            </th>
                            <th title="Officer assigned to resolve this complaint">
                                <span className="th-content">
                                    <span className="th-icon">👮</span>
                                    Assigned Officer
                                </span>
                            </th>
                            <th title="Due date for resolution">
                                <span className="th-content">
                                    <span className="th-icon">⏰</span>
                                    Deadline
                                </span>
                            </th>
                            <th title="Submission date (most recent first)">
                                <span className="th-content">
                                    <span className="th-icon">📅</span>
                                    Created
                                </span>
                            </th>
                            <th title="Available actions for this complaint">
                                <span className="th-content">
                                    <span className="th-icon">⚙️</span>
                                    Actions
                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredComplaints.map((complaint) => (
                            <tr key={complaint.id} className={isOverdue(complaint.deadline) ? 'overdue-row' : ''}>
                                <td>{complaint.id}</td>
                                <td>{complaint.department}</td>
                                <td className="description-cell">{complaint.description.substring(0, 50)}...</td>
                                <td className="photo-cell">
                                    {complaint.photoUrl ? (
                                        <img
                                            src={`http://localhost:8081/uploads/${complaint.photoUrl}`}
                                            alt="Complaint"
                                            className="complaint-thumbnail"
                                            onClick={() => window.open(`http://localhost:8081/uploads/${complaint.photoUrl}`, '_blank')}
                                            title="Click to view full size"
                                        />
                                    ) : (
                                        <span className="no-photo">No photo</span>
                                    )}
                                </td>
                                <td>{complaint.citizen?.name}</td>
                                <td>
                                    <span className={`status-badge ${getStatusBadgeClass(complaint.status)}`}>
                                        {complaint.status}
                                    </span>
                                </td>
                                <td>
                                    <span className={`validation-badge ${getValidationStatusBadgeClass(complaint.validationStatus)}`}>
                                        {complaint.validationStatus
                                            ? complaint.validationStatus.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
                                            : 'N/A'}
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
                                    {complaint.deadline ? (
                                        <span className={`deadline-badge ${isOverdue(complaint.deadline) ? 'overdue' : ''}`}>
                                            {new Date(complaint.deadline).toLocaleDateString()}
                                            {isOverdue(complaint.deadline) && ' ⚠️'}
                                        </span>
                                    ) : (
                                        <span className="deadline-badge no-deadline">Not Set</span>
                                    )}
                                </td>
                                <td className="created-cell">
                                    {new Date(complaint.createdAt).toLocaleDateString()}
                                    <br />
                                    <small className="time-text">{new Date(complaint.createdAt).toLocaleTimeString()}</small>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        {complaint.validationStatus === 'PENDING_VALIDATION' && (
                                            <button
                                                className="btn-small btn-success"
                                                onClick={() => handleValidateClick(complaint)}
                                            >
                                                Validate
                                            </button>
                                        )}
                                        {(complaint.validationStatus === 'VALIDATED' || !complaint.validationStatus) && (
                                            <button
                                                className="btn-small btn-primary"
                                                onClick={() => handleAssignClick(complaint)}
                                            >
                                                Assign
                                            </button>
                                        )}
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
                        <div className="form-group">
                            <label>Deadline</label>
                            <input
                                type="datetime-local"
                                value={assignModal.deadline}
                                onChange={(e) => setAssignModal({ ...assignModal, deadline: e.target.value })}
                                className="deadline-input"
                            />
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

            {/* Validation Modal */}
            {validationModal.isOpen && validationModal.complaint && (
                <div className="modal-overlay" onClick={() => setValidationModal({ ...validationModal, isOpen: false })}>
                    <div className="modal-content validation-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Validate Complaint #{validationModal.complaint.id}</h3>

                        <div className="complaint-details">
                            <div className="detail-row">
                                <strong>Department:</strong> {validationModal.complaint.department}
                            </div>
                            <div className="detail-row">
                                <strong>Description:</strong> {validationModal.complaint.description}
                            </div>
                            <div className="detail-row">
                                <strong>Location:</strong> {validationModal.complaint.locationAddress ||
                                    (validationModal.complaint.latitude && validationModal.complaint.longitude
                                        ? `${validationModal.complaint.latitude}, ${validationModal.complaint.longitude}`
                                        : 'Not provided')}
                            </div>
                            {validationModal.complaint.photoUrl && (
                                <div className="detail-row">
                                    <strong>Photo:</strong>
                                    <img
                                        src={`http://localhost:8081/uploads/${validationModal.complaint.photoUrl}`}
                                        alt="Complaint"
                                        style={{ maxWidth: '300px', marginTop: '10px', borderRadius: '8px' }}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="validation-checklist">
                            <h4>Validation Criteria</h4>
                            <div className="checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={validationModal.locationCheck}
                                        onChange={(e) => setValidationModal({ ...validationModal, locationCheck: e.target.checked })}
                                        disabled={validationModal.locationCheck}
                                    />
                                    <span>Location is provided (address or coordinates)</span>
                                </label>
                            </div>
                            <div className="checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={validationModal.imageQualityCheck}
                                        onChange={(e) => setValidationModal({ ...validationModal, imageQualityCheck: e.target.checked })}
                                    />
                                    <span>Image is clear and not blurry</span>
                                </label>
                            </div>
                            <div className="checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={validationModal.departmentMatchCheck}
                                        onChange={(e) => setValidationModal({ ...validationModal, departmentMatchCheck: e.target.checked })}
                                    />
                                    <span>Description matches the selected department</span>
                                </label>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button
                                className="btn btn-success"
                                onClick={handleValidateSubmit}
                                disabled={!validationModal.locationCheck || !validationModal.imageQualityCheck || !validationModal.departmentMatchCheck}
                            >
                                Approve Complaint
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={() => handleRejectClick(validationModal.complaint)}
                            >
                                Reject Complaint
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setValidationModal({ ...validationModal, isOpen: false })}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {rejectionModal.isOpen && (
                <div className="modal-overlay" onClick={() => setRejectionModal({ ...rejectionModal, isOpen: false })}>
                    <div className="modal-content rejection-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Reject Complaint</h3>
                        <p>Please select or provide a reason for rejecting this complaint:</p>

                        <div className="rejection-reasons">
                            <label>
                                <input
                                    type="radio"
                                    name="rejectionReason"
                                    value="Location not mentioned or incomplete"
                                    checked={rejectionModal.reason === "Location not mentioned or incomplete"}
                                    onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
                                />
                                Location not mentioned or incomplete
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="rejectionReason"
                                    value="Uploaded image is blurry or unclear"
                                    checked={rejectionModal.reason === "Uploaded image is blurry or unclear"}
                                    onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
                                />
                                Uploaded image is blurry or unclear
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="rejectionReason"
                                    value="Complaint description does not match the selected department"
                                    checked={rejectionModal.reason === "Complaint description does not match the selected department"}
                                    onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
                                />
                                Complaint description does not match the selected department
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="rejectionReason"
                                    value="custom"
                                    checked={rejectionModal.reason !== "" &&
                                        rejectionModal.reason !== "Location not mentioned or incomplete" &&
                                        rejectionModal.reason !== "Uploaded image is blurry or unclear" &&
                                        rejectionModal.reason !== "Complaint description does not match the selected department"}
                                    onChange={() => setRejectionModal({ ...rejectionModal, reason: '' })}
                                />
                                Other (specify below)
                            </label>
                        </div>

                        <textarea
                            placeholder="Additional notes or custom reason..."
                            value={rejectionModal.reason}
                            onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
                            rows="4"
                            className="rejection-textarea"
                        />

                        <div className="modal-actions">
                            <button
                                className="btn btn-danger"
                                onClick={handleRejectSubmit}
                            >
                                Confirm Rejection
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setRejectionModal({ ...rejectionModal, isOpen: false })}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminComplaintDashboard
