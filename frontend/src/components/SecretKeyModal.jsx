import React, { useState } from 'react'
import './SecretKeyModal.css'

const SecretKeyModal = ({ isOpen, onClose, secretKey, officerName, officerEmail, department }) => {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(secretKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Officer Approved Successfully!</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="officer-info">
            <div className="info-item">
              <span className="info-label">Name:</span>
              <span className="info-value">{officerName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{officerEmail}</span>
            </div>
            {department && (
              <div className="info-item">
                <span className="info-label">Department:</span>
                <span className="info-value">{department}</span>
              </div>
            )}
          </div>
          
          <div className="secret-key-section">
            <label className="secret-key-label">Secret Key</label>
            <div className="secret-key-container">
              <code className="secret-key-value">{secretKey}</code>
              <button 
                className="copy-button" 
                onClick={handleCopy}
                title="Copy to clipboard"
              >
                {copied ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
            <p className="secret-key-warning">
              ⚠️ Important: Share this secret key securely with the officer. They will need it to login.
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default SecretKeyModal
