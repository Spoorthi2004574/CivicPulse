import React, { useState, useEffect } from 'react'
import { complaintAPI } from '../services/api'
import { toast } from 'react-toastify'
import './AssignComplaintModal.css'

const AssignComplaintModal = ({ complaint, onClose, onAssigned }) => {
    const [officers, setOfficers] = useState([])
    const [selectedOfficer, setSelectedOfficer] = useState('')
    const [priority, setPriority] = useState(complaint.priority || 'MEDIUM')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetchOfficersWithWorkload()
    }, [])

    const fetchOfficersWithWorkload = async () => {
        try {
            const response = await complaintAPI.getOfficersWithWorkload()
            setOfficers(response.data)
            // Auto-select the recommended officer (least busy)
            const recommended = response.data.find(o => o.recommended)
            if (recommended) {
                setSelectedOfficer(recommended.officerId.toString())
            }
            setLoading(false)
        } catch (error) {
            console.error('Error fetching officers:', error)
            toast.error('Failed to load officers')
            setLoading(false)
        }
    }

    const getDeadlineHours = (priority) => {
        switch (priority) {
            case 'HIGH':
                return 48
            case 'MEDIUM':
                return 96
            case 'LOW':
                return 168
            default:
                return 96
        }
    }

    const getDeadlineText = (priority) => {
        const hours = getDeadlineHours(priority)
        const days = hours / 24
        return `${days} day${days > 1 ? 's' : ''} (${hours} hours)`
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!selectedOfficer) {
            toast.error('Please select an officer')
            return
        }

        setSubmitting(true)
        try {
            await complaintAPI.assignComplaint(
                complaint.id,
                parseInt(selectedOfficer),
                priority,
                null // Let backend auto-calculate deadline
            )
            toast.success('Complaint assigned successfully!')
            onAssigned()
            onClose()
        } catch (error) {
            console.error('Error assigning complaint:', error)
            toast.error('Failed to assign complaint')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Assign Complaint #{complaint.id}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <div className="complaint-summary">
                        <h4>{complaint.department}</h4>
                        <p>{complaint.description}</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Priority Level</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="form-control"
                            >
                                <option value="HIGH">HIGH</option>
                                <option value="MEDIUM">MEDIUM</option>
                                <option value="LOW">LOW</option>
                            </select>
                            <small className="form-text">
                                Auto-deadline: {getDeadlineText(priority)}
                            </small>
                        </div>

                        <div className="form-group">
                            <label>Assign to Officer</label>
                            {loading ? (
                                <p>Loading officers...</p>
                            ) : (
                                <select
                                    value={selectedOfficer}
                                    onChange={(e) => setSelectedOfficer(e.target.value)}
                                    className="form-control"
                                    required
                                >
                                    <option value="">Select an officer...</option>
                                    {officers.map((officer) => (
                                        <option
                                            key={officer.officerId}
                                            value={officer.officerId}
                                        >
                                            {officer.name} - {officer.activeComplaintCount} active complaint{officer.activeComplaintCount !== 1 ? 's' : ''}
                                            {officer.recommended ? ' ⭐ (Recommended)' : ''}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <small className="form-text">
                                Officers are sorted by workload (least busy first)
                            </small>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting || !selectedOfficer}
                            >
                                {submitting ? 'Assigning...' : 'Assign Complaint'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AssignComplaintModal
