-- Add escalation fields to complaints table
ALTER TABLE complaints 
ADD COLUMN IF NOT EXISTS escalated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS escalation_reason VARCHAR(500);

-- Create escalations table
CREATE TABLE IF NOT EXISTS complaint_escalations (
    id BIGSERIAL PRIMARY KEY,
    complaint_id BIGINT NOT NULL REFERENCES complaints(id),
    original_officer_id BIGINT REFERENCES users(id),
    escalated_to_id BIGINT REFERENCES users(id),
    escalation_reason TEXT,
    escalated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_complaints_escalated ON complaints(escalated);
CREATE INDEX IF NOT EXISTS idx_complaints_deadline ON complaints(deadline);
CREATE INDEX IF NOT EXISTS idx_complaints_officer_status ON complaints(officer_id, status);
CREATE INDEX IF NOT EXISTS idx_complaint_escalations_complaint_id ON complaint_escalations(complaint_id);

-- Add comment for documentation
COMMENT ON COLUMN complaints.escalated IS 'Indicates if the complaint has been escalated';
COMMENT ON COLUMN complaints.escalated_at IS 'Timestamp when the complaint was escalated';
COMMENT ON COLUMN complaints.escalation_reason IS 'Reason for escalation';
COMMENT ON TABLE complaint_escalations IS 'Tracks the history of complaint escalations';
