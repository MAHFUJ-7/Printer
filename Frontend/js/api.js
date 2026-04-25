/**
 * API Client Helper
 * Handles all API requests to the backend with JWT token management
 */

class APIClient {
  constructor() {
    // Default to local backend (5001), with fallback support for 5000.
    const defaultHost = window.location.hostname || 'localhost';
    const defaultBaseUrl = `http://${defaultHost}:5001/api`;
    this.baseURL = window.CAMPUSPRINT_API_BASE_URL || defaultBaseUrl;
    this.fallbackBaseURLs = [
      `http://${defaultHost}:5000/api`,
    ].filter(url => url !== this.baseURL);
    this.tokenKey = 'authToken';
  }

  /**
   * Get stored JWT token from localStorage
   */
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Store JWT token in localStorage
   */
  setToken(token) {
    if (token) {
      localStorage.setItem(this.tokenKey, token);
    } else {
      localStorage.removeItem(this.tokenKey);
    }
  }

  /**
   * Clear token (logout)
   */
  clearToken() {
    localStorage.removeItem(this.tokenKey);
  }

  /**
   * Build headers with JWT token
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Generic fetch wrapper with proper error handling
   */
  async request(method, endpoint, body = null, retryOnFallback = true) {
    const url = `${this.baseURL}${endpoint}`;
    const options = {
      method,
      headers: this.getHeaders(),
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    console.log(`[API] ${method} ${url}`, body ? { body } : '');

    let response;
    let data;
    
    try {
      response = await fetch(url, options);
      data = await response.json();
    } catch (error) {
      console.error('[API] Network error:', error.message);
      if (retryOnFallback && this.fallbackBaseURLs.length > 0) {
        this.baseURL = this.fallbackBaseURLs.shift();
        console.warn('[API] Retrying request with fallback base URL:', this.baseURL);
        return this.request(method, endpoint, body, true);
      }
      const err = new Error(`Cannot connect to server at ${this.baseURL}. Make sure backend is running.`);
      err.status = 0;
      err.code = 'NETWORK_ERROR';
      throw err;
    }

    // Check HTTP status
    if (!response.ok) {
      console.error('[API] HTTP error:', response.status, data);
      
      // Handle 401 - token expired or invalid
      if (response.status === 401) {
        this.clearToken();
        localStorage.removeItem('user');
      }

      const err = new Error(data.message || `Request failed with status ${response.status}`);
      err.status = response.status;
      err.code = data.code;
      throw err;
    }

    // Check API status in response body
    if (data.status === 'error') {
      console.error('[API] API error:', data.message, data.code);
      const err = new Error(data.message || 'Request failed');
      err.status = data.status;
      err.code = data.code;
      throw err;
    }

    console.log('[API] Response:', data);
    return data;
  }

  // ===== AUTHENTICATION ENDPOINTS =====

  /**
   * POST /api/auth/login
   */
  async login(email, password, role = null) {
    const payload = { email, password };
    if (role) {
      payload.role = role;
    }
    const data = await this.request('POST', '/auth/login', payload);
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  /**
   * POST /api/auth/signup
   */
  async signup(signupData) {
    const data = await this.request('POST', '/auth/signup', signupData);
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  /**
   * POST /api/auth/verify
   */
  async verify() {
    return this.request('POST', '/auth/verify');
  }

  /**
   * POST /api/auth/refresh
   */
  async refreshToken() {
    const data = await this.request('POST', '/auth/refresh');
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  // ===== USER ENDPOINTS =====

  /**
   * GET /api/users/:id
   */
  async getUserProfile(userId) {
    return this.request('GET', `/users/${userId}`);
  }

  /**
   * PUT /api/users/:id
   */
  async updateUserProfile(userId, profileData) {
    return this.request('PUT', `/users/${userId}`, profileData);
  }

  /**
   * GET /api/users/:id/credits
   */
  async getUserCredits(userId) {
    return this.request('GET', `/users/${userId}/credits`);
  }

  /**
   * POST /api/users/:id/credits/deduct
   */
  async deductCredits(userId, amount) {
    return this.request('POST', `/users/${userId}/credits/deduct`, { amount });
  }

  // ===== PRINTER ENDPOINTS =====

  /**
   * GET /api/printers
   */
  async listPrinters(filters = {}) {
    let endpoint = '/printers';
    const params = new URLSearchParams(filters);
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    return this.request('GET', endpoint);
  }

  /**
   * GET /api/printers/:id
   */
  async getPrinterDetails(printerId) {
    return this.request('GET', `/printers/${printerId}`);
  }

  /**
   * POST /api/printers
   */
  async registerPrinter(printerData) {
    return this.request('POST', '/printers', printerData);
  }

  /**
   * PUT /api/printers/:id
   */
  async updatePrinter(printerId, printerData) {
    return this.request('PUT', `/printers/${printerId}`, printerData);
  }

  /**
   * DELETE /api/printers/:id
   */
  async deletePrinter(printerId) {
    return this.request('DELETE', `/printers/${printerId}`);
  }

  // ===== PRINT JOB ENDPOINTS =====

  /**
   * GET /api/print-jobs
   */
  async listPrintJobs(filters = {}) {
    let endpoint = '/print-jobs';
    const params = new URLSearchParams(filters);
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    return this.request('GET', endpoint);
  }

  /**
   * GET /api/print-jobs/:id
   */
  async getPrintJobDetails(jobId) {
    return this.request('GET', `/print-jobs/${jobId}`);
  }

  /**
   * POST /api/print-jobs
   */
  async submitPrintJob(jobData) {
    return this.request('POST', '/print-jobs', jobData);
  }

  /**
   * PUT /api/print-jobs/:id/status
   */
  async updatePrintJobStatus(jobId, status) {
    return this.request('PUT', `/print-jobs/${jobId}/status`, { status });
  }

  // ===== ADMIN ENDPOINTS =====

  /**
   * GET /api/admin/users
   */
  async listAllUsers() {
    return this.request('GET', '/admin/users');
  }

  /**
   * GET /api/admin/printers
   */
  async listAllPrinters() {
    return this.request('GET', '/admin/printers');
  }

  /**
   * PUT /api/admin/users/:id/credits
   */
  async adjustUserCredits(userId, amount, operation = 'add') {
    return this.request('PUT', `/admin/users/${userId}/credits`, { amount, operation });
  }

  /**
   * PUT /api/admin/users/:id/roles
   */
  async updateUserRoles(userId, roles) {
    return this.request('PUT', `/admin/users/${userId}/roles`, { roles });
  }

  /**
   * PUT /api/admin/printers/:id/status
   */
  async updatePrinterStatus(printerId, status) {
    return this.request('PUT', `/admin/printers/${printerId}/status`, { status });
  }

  /**
   * GET /api/admin/stats
   */
  async getAdminStats() {
    return this.request('GET', '/admin/stats');
  }
}

// Export singleton instance
window.apiClient = new APIClient();
