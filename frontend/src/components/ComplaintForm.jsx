import React, { useState, useEffect } from 'react'
import { complaintAPI } from '../services/api'
import { toast } from 'react-toastify'
import './ComplaintForm.css'

const ComplaintForm = () => {
    const [formData, setFormData] = useState({
        department: '',
        description: '',
        latitude: null,
        longitude: null,
        locationAddress: '',
    })
    const [photo, setPhoto] = useState(null)
    const [loading, setLoading] = useState(false)
    const [useGPS, setUseGPS] = useState(false)

    const departments = [
        'Roads',
        'Sanitation',
        'Water Supply',
        'Electricity',
        'Street Lights',
        'Drainage',
        'Parks',
        'Other'
    ]

    useEffect(() => {
        if (useGPS && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    }))
                    toast.success('Location detected successfully!')
                },
                (error) => {
                    toast.error('Failed to get location. Please enter manually.')
                    setUseGPS(false)
                }
            )
        }
    }, [useGPS])

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handlePhotoChange = (e) => {
        setPhoto(e.target.files[0])
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formDataToSend = new FormData()

            // Append individual fields
            formDataToSend.append('department', formData.department)
            formDataToSend.append('description', formData.description)

            if (formData.latitude) {
                formDataToSend.append('latitude', formData.latitude)
            }
            if (formData.longitude) {
                formDataToSend.append('longitude', formData.longitude)
            }
            if (formData.locationAddress) {
                formDataToSend.append('locationAddress', formData.locationAddress)
            }

            if (photo) {
                formDataToSend.append('photo', photo)
            }

            await complaintAPI.fileComplaint(formDataToSend)
            toast.success('Complaint filed successfully!')

            // Reset form
            setFormData({
                department: '',
                description: '',
                latitude: null,
                longitude: null,
                locationAddress: '',
            })
            setPhoto(null)
            setUseGPS(false)
            e.target.reset()
        } catch (error) {
            console.error('Error filing complaint:', error)
            console.error('Error response:', error.response)
            console.error('Error data:', error.response?.data)
            toast.error(error.response?.data || error.message || 'Failed to file complaint')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="complaint-form-container">
            <div className="complaint-form-card">
                <h2>File a Complaint</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Department *</label>
                        <select
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Department</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Description *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="5"
                            placeholder="Describe your complaint in detail..."
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Photo (Optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={useGPS}
                                onChange={(e) => setUseGPS(e.target.checked)}
                            />
                            Use GPS to detect location
                        </label>
                    </div>

                    {!useGPS && (
                        <div className="form-group">
                            <label>Location Address *</label>
                            <input
                                type="text"
                                name="locationAddress"
                                value={formData.locationAddress}
                                onChange={handleChange}
                                placeholder="Enter location address"
                                required
                            />
                        </div>
                    )}

                    {useGPS && formData.latitude && (
                        <div className="location-info">
                            <p><strong>Latitude:</strong> {formData.latitude}</p>
                            <p><strong>Longitude:</strong> {formData.longitude}</p>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Complaint'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ComplaintForm
