import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 120000, // 2 min — LLM can be slow
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem('token');
      // Force reload or redirect to login
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
)

export const matcherAPI = {
  /**
   * Run a resume-JD match.
   * @param {FormData} formData - contains resume_text, jd_text, resume_file, jd_file
   */
  runMatch: (formData) =>
    api.post('/match/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  /**
   * Get a specific analysis by ID.
   */
  getAnalysis: (id) => api.get(`/match/${id}`),

  exportPDF: (id) => api.get(`/match/${id}/export`, { responseType: 'blob' }),
}

export const historyAPI = {
  /**
   * Get paginated history.
   */
  getHistory: (page = 1, pageSize = 10) =>
    api.get('/history/', { params: { page, page_size: pageSize } }),
}

export const batchAPI = {
  /**
   * Run a batch resume-JD match.
   * @param {FormData} formData - contains resume_files and jd_text/jd_file
   */
  runBatchMatch: (formData) =>
    api.post('/batch/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  getBatchResults: (batchId) => api.get(`/batch/${batchId}`),
}

export const adminAPI = {
  getAllAnalyses: (page = 1, pageSize = 10) =>
    api.get('/admin/analyses', { params: { page, page_size: pageSize } }),
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
}

export default api
