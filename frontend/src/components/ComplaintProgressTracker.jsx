import React from 'react'
import './ComplaintProgressTracker.css'

const ComplaintProgressTracker = ({ complaint }) => {
    const getStages = () => {
        const stages = [
            {
                name: 'Submitted',
                icon: '📝',
                completed: true,
                timestamp: complaint.createdAt,
                description: 'Complaint filed'
            },
            {
                name: 'Assigned',
                icon: '👮',
                completed: complaint.assignedOfficer !== null,
                timestamp: complaint.assignedOfficer ? complaint.updatedAt : null,
                description: complaint.assignedOfficer
                    ? `Assigned to ${complaint.assignedOfficer.name}`
                    : 'Waiting for assignment'
            },
            {
                name: 'In Progress',
                icon: '⚙️',
                completed: complaint.status === 'IN_PROGRESS' || complaint.status === 'RESOLVED',
                timestamp: complaint.status === 'IN_PROGRESS' || complaint.status === 'RESOLVED'
                    ? complaint.updatedAt
                    : null,
                description: complaint.status === 'IN_PROGRESS' || complaint.status === 'RESOLVED'
                    ? 'Officer working on resolution'
                    : 'Not started yet'
            },
            {
                name: 'Resolved',
                icon: '✅',
                completed: complaint.status === 'RESOLVED',
                timestamp: complaint.status === 'RESOLVED' ? complaint.updatedAt : null,
                description: complaint.status === 'RESOLVED'
                    ? 'Complaint resolved'
                    : 'Pending resolution'
            }
        ]

        return stages
    }

    const getCurrentStage = () => {
        const stages = getStages()
        for (let i = stages.length - 1; i >= 0; i--) {
            if (stages[i].completed) {
                return i
            }
        }
        return 0
    }

    const stages = getStages()
    const currentStageIndex = getCurrentStage()

    const formatDate = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className="progress-tracker">
            <div className="progress-tracker-header">
                <h4 className="tracker-title">
                    <span className="tracker-icon">📊</span>
                    Complaint Progress
                </h4>
            </div>

            <div className="progress-bar-container">
                <div className="progress-bar-bg">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
                    ></div>
                </div>
            </div>

            <div className="stages-container">
                {stages.map((stage, index) => (
                    <div
                        key={index}
                        className={`stage ${stage.completed ? 'completed' : ''} ${index === currentStageIndex ? 'current' : ''}`}
                    >
                        <div className="stage-marker">
                            <div className="stage-circle">
                                {stage.completed ? (
                                    <span className="checkmark">✓</span>
                                ) : (
                                    <span className="stage-number">{index + 1}</span>
                                )}
                            </div>
                            {index < stages.length - 1 && (
                                <div className={`stage-line ${stages[index + 1].completed ? 'completed' : ''}`}></div>
                            )}
                        </div>

                        <div className="stage-content">
                            <div className="stage-icon">{stage.icon}</div>
                            <div className="stage-name">{stage.name}</div>
                            <div className="stage-description">{stage.description}</div>
                            {stage.timestamp && (
                                <div className="stage-timestamp">{formatDate(stage.timestamp)}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Proof of Work Section */}
            {complaint.proofOfWorkUrl && (
                <div className="proof-section">
                    <div className="proof-header">
                        <span className="proof-icon">📸</span>
                        <span className="proof-title">Proof of Work</span>
                    </div>
                    <div className="proof-content">
                        <img
                            src={`http://localhost:8081/uploads/${complaint.proofOfWorkUrl}`}
                            alt="Proof of work"
                            className="proof-image"
                            onClick={() => window.open(`http://localhost:8081/uploads/${complaint.proofOfWorkUrl}`, '_blank')}
                        />
                        <div className="proof-info">
                            <p className="proof-label">Uploaded by officer</p>
                            {complaint.proofOfWorkUploadedAt && (
                                <p className="proof-date">
                                    {formatDate(complaint.proofOfWorkUploadedAt)}
                                </p>
                            )}
                            <button
                                className="btn-view-proof"
                                onClick={() => window.open(`http://localhost:8081/uploads/${complaint.proofOfWorkUrl}`, '_blank')}
                            >
                                View Full Size
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ComplaintProgressTracker
