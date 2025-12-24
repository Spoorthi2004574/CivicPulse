import axios from 'axios'

const API_URL = 'http://localhost:8081'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
}

export const adminAPI = {
  getPendingOfficers: () => api.get('/admin/officers/pending'),
  getApprovedOfficers: () => api.get('/admin/officers/approved'),
  approveOfficer: (id) => api.post(`/admin/officers/${id}/approve`),
}

export const complaintAPI = {
  fileComplaint: (formData) => {
    return api.post('/api/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  getMyComplaints: () => api.get('/api/complaints/my'),
  getAllComplaints: () => api.get('/api/complaints/all'),
  assignComplaint: (id, officerId, priority) =>
    api.put(`/api/complaints/${id}/assign?officerId=${officerId}&priority=${priority}`),
  updateStatus: (id, status) =>
    api.put(`/api/complaints/${id}/status?status=${status}`),
  checkDuplicates: (id) => api.get(`/api/complaints/${id}/duplicates`),
}

export default api




