/**
 * API Client Helper
 * Compatibility adapter between legacy frontend pages and v1 backend API.
 */

class APIClient {
  constructor() {
    const defaultHost = window.location.hostname || "localhost";
    this.baseURL = window.CAMPUSPRINT_API_BASE_URL || `http://${defaultHost}:4000/api/v1`;
    this.fallbackBaseURLs = [];
    this.tokenKey = "authToken";
    this.refreshTokenKey = "refreshToken";
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token) {
    if (token) {
      localStorage.setItem(this.tokenKey, token);
    } else {
      localStorage.removeItem(this.tokenKey);
    }
  }

  getRefreshToken() {
    return localStorage.getItem(this.refreshTokenKey);
  }

  setRefreshToken(token) {
    if (token) {
      localStorage.setItem(this.refreshTokenKey, token);
    } else {
      localStorage.removeItem(this.refreshTokenKey);
    }
  }

  clearToken() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  getHeaders() {
    const headers = {
      "Content-Type": "application/json"
    };

    const token = this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  normalizeRoleToBackend(role) {
    if (!role) {
      return "STUDENT";
    }

    const value = String(role).toUpperCase();
    if (value === "USER" || value === "STUDENT") {
      return "STUDENT";
    }
    if (value === "PRINTER_OWNER" || value === "OWNER") {
      return "PRINTER_OWNER";
    }
    if (value === "ADMIN") {
      return "ADMIN";
    }

    return "STUDENT";
  }

  normalizeRoleToFrontend(role) {
    const value = String(role || "").toUpperCase();
    if (value === "PRINTER_OWNER") {
      return "printer_owner";
    }
    if (value === "ADMIN") {
      return "admin";
    }
    return "user";
  }

  normalizePrinterStatusToBackend(status) {
    const value = String(status || "").toUpperCase();
    if (value === "ACTIVE" || value === "ONLINE") {
      return "ONLINE";
    }
    if (value === "INACTIVE" || value === "OFFLINE") {
      return "OFFLINE";
    }
    if (value === "PENDING" || value === "PENDING_APPROVAL" || value === "MAINTENANCE") {
      return "MAINTENANCE";
    }
    return "OFFLINE";
  }

  normalizePrinterStatusToFrontend(status) {
    const value = String(status || "").toUpperCase();
    if (value === "ONLINE") {
      return "active";
    }
    if (value === "OFFLINE") {
      return "inactive";
    }
    return "pending";
  }

  normalizeJobStatusToFrontend(status) {
    const value = String(status || "").toUpperCase();
    if (value === "IN_PROGRESS") {
      return "in_progress";
    }
    if (value === "COMPLETED") {
      return "completed";
    }
    if (value === "CANCELLED") {
      return "cancelled";
    }
    return "pending";
  }

  normalizeJobStatusToBackend(status) {
    const value = String(status || "").toUpperCase();
    if (value === "PROCESSING") {
      return "IN_PROGRESS";
    }
    if (value === "IN_PROGRESS") {
      return "IN_PROGRESS";
    }
    if (value === "COMPLETED") {
      return "COMPLETED";
    }
    if (value === "CANCELLED") {
      return "CANCELLED";
    }
    return "PENDING";
  }

  mapUser(user) {
    const frontendRole = this.normalizeRoleToFrontend(user.role);
    const fullName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : (user.username || user.email || "User");

    return {
      id: user.id,
      email: user.email,
      username: user.username || user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      fullName: fullName,
      roles: [frontendRole],
      role: frontendRole,
      credits: Number(user.credits ?? user.balance ?? 0)
    };
  }

  mapPrinter(printer) {
    const caps = printer.capabilities || {};
    let type = "bw";
    if (caps.color && caps.bw) type = "both";
    else if (caps.color) type = "color";

    return {
      id: String(printer.id),
      ownerId: String(printer.ownerId || ""),
      name: printer.name,
      location: printer.location,
      model: printer.model,
      type: type,
      pricePerPage: Number(printer.pricePerPage || 0),
      priceColor: printer.priceColor ? Number(printer.priceColor) : null,
      status: this.normalizePrinterStatusToFrontend(printer.status),
      capabilities: caps
    };
  }

  mapJob(job) {
    return {
      id: String(job.id),
      userId: String(job.userId || ""),
      printerId: String(job.printerId || job.printer?.id || ""),
      fileName: job.fileName || job.fileUrl || "document.pdf",
      pages: Number(job.pageCount || job.pages || 0),
      cost: Number(job.totalCost || job.cost || 0),
      createdAt: job.createdAt,
      status: this.normalizeJobStatusToFrontend(job.status),
      printerName: job.printer?.name || `Printer #${job.printerId}`
    };
  }

  async request(method, endpoint, body = null, retryOnFallback = true) {
    const url = `${this.baseURL}${endpoint}`;
    const options = {
      method,
      headers: this.getHeaders()
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    let response;
    let data = null;

    try {
      response = await fetch(url, options);
      const text = await response.text();
      data = text ? JSON.parse(text) : null;
    } catch (error) {
      if (retryOnFallback && this.fallbackBaseURLs.length > 0) {
        this.baseURL = this.fallbackBaseURLs.shift();
        return this.request(method, endpoint, body, true);
      }
      const err = new Error(`Cannot connect to server at ${this.baseURL}. Make sure backend is running.`);
      err.status = 0;
      err.code = "NETWORK_ERROR";
      throw err;
    }

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        localStorage.removeItem("user");
      }

      const message = data?.message || `Request failed with status ${response.status}`;
      const err = new Error(message);
      err.status = response.status;
      err.code = data?.code;
      throw err;
    }

    if (data && data.status === "error") {
      const err = new Error(data.message || "Request failed");
      err.status = data.status;
      err.code = data.code;
      throw err;
    }

    return data?.data !== undefined ? data.data : data;
  }

  async login(email, password) {
    const data = await this.request("POST", "/auth/login", { email, password });
    const token = data.accessToken || data.token;
    if (token) {
      this.setToken(token);
    }
    if (data.refreshToken) {
      this.setRefreshToken(data.refreshToken);
    }

    return {
      ...data,
      user: this.mapUser(data.user)
    };
  }

  async signup(signupData) {
    const payload = {
      email: signupData.email,
      password: signupData.password,
      username: signupData.username,
      firstName: signupData.firstName,
      lastName: signupData.lastName,
      role: this.normalizeRoleToBackend(signupData.role)
    };

    const data = await this.request("POST", "/auth/register", payload);
    const token = data.accessToken || data.token;
    if (token) {
      this.setToken(token);
    }
    if (data.refreshToken) {
      this.setRefreshToken(data.refreshToken);
    }

    return {
      ...data,
      user: this.mapUser(data.user)
    };
  }

  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    const data = await this.request("POST", "/auth/refresh-token", { refreshToken });
    if (data.accessToken) {
      this.setToken(data.accessToken);
    }
    if (data.refreshToken) {
      this.setRefreshToken(data.refreshToken);
    }
    return data;
  }

  async logout() {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      await this.request("POST", "/auth/logout", { refreshToken });
    }
    this.clearToken();
  }

  async getUserProfile() {
    const profile = await this.request("GET", "/users/me");
    return this.mapUser(profile);
  }

  async getUserCredits() {
    const profile = await this.request("GET", "/users/me");
    return { credits: Number(profile.balance || 0) };
  }

  async updateUserProfile(data) {
    const profile = await this.request("PATCH", "/users/profile", data);
    return this.mapUser(profile);
  }

  async upgradeToPrinterOwner() {
    const user = await this.request("POST", "/users/upgrade-to-owner");
    return this.mapUser(user);
  }

  async listPrinters(filters = {}) {
    if (filters.ownerId) {
      const printers = await this.request("GET", "/printers/mine");
      return { printers: (printers || []).map((item) => this.mapPrinter(item)) };
    }

    let endpoint = "/printers";
    const params = new URLSearchParams();
    if (filters.model) {
      params.set("model", filters.model);
    }
    if (filters.location) {
      params.set("location", filters.location);
    }
    if (filters.minPrice != null) {
      params.set("minPrice", filters.minPrice);
    }
    if (filters.maxPrice != null) {
      params.set("maxPrice", filters.maxPrice);
    }
    if (filters.cursor) {
      params.set("cursor", filters.cursor);
    }
    if (filters.limit) {
      params.set("limit", filters.limit);
    }

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    const response = await this.request("GET", endpoint);
    const items = Array.isArray(response?.data) ? response.data : [];

    return {
      printers: items.map((item) => this.mapPrinter(item)),
      nextCursor: response?.nextCursor || null
    };
  }

  async registerPrinter(printerData) {
    const payload = {
      name: printerData.name,
      model: printerData.model,
      location: printerData.location,
      pricePerPage: Number(printerData.pricePerPage || 0),
      priceColor: printerData.priceColor ? Number(printerData.priceColor) : null,
      capabilities: printerData.capabilities || { color: true, duplex: true },
      status: this.normalizePrinterStatusToBackend(printerData.status || "active")
    };

    const printer = await this.request("POST", "/printers", payload);
    return this.mapPrinter(printer);
  }

  async updatePrinter(printerId, printerData) {
    const payload = {};
    if (printerData.name !== undefined) {
      payload.name = printerData.name;
    }
    if (printerData.location !== undefined) {
      payload.location = printerData.location;
    }
    if (printerData.model !== undefined) {
      payload.model = printerData.model;
    }
    if (printerData.pricePerPage !== undefined) {
      payload.pricePerPage = Number(printerData.pricePerPage);
    }
    if (printerData.priceColor !== undefined) {
      payload.priceColor = printerData.priceColor ? Number(printerData.priceColor) : null;
    }
    if (printerData.status !== undefined) {
      payload.status = this.normalizePrinterStatusToBackend(printerData.status);
    }

    return this.request("PATCH", `/printers/${printerId}`, payload);
  }

  async deletePrinter(printerId) {
    return this.request("DELETE", `/admin/printers/${printerId}`);
  }

  async listPrintJobs(scope = "auto") {
    const currentUser = JSON.parse(localStorage.getItem("user") || "null");
    const isAdmin = !!currentUser?.roles?.includes("admin");
    const currentRole = localStorage.getItem("currentRole") || "user";

    let endpoint = "/jobs";

    if (scope === "admin" || (scope === "auto" && isAdmin && currentRole === "admin")) {
      endpoint = "/admin/jobs";
    } else if (scope === "owner") {
      endpoint = "/jobs/owner";
    }

    const response = await this.request("GET", endpoint);

    const items = Array.isArray(response) ? response : [];
    return { printJobs: items.map((item) => this.mapJob(item)) };
  }

  async submitPrintJob(jobData) {
    const payload = {
      printerId: jobData.printerId,
      fileUrl: jobData.fileUrl || jobData.fileName || "uploaded.pdf",
      pageCount: Number(jobData.pageCount || jobData.pages || 1),
      isColor: !!(jobData.isColor || jobData.printType === "color")
    };

    const job = await this.request("POST", "/jobs", payload);
    return this.mapJob(job);
  }

  async updatePrintJobStatus(jobId, status) {
    return this.request("PATCH", `/jobs/${jobId}/status`, {
      status: this.normalizeJobStatusToBackend(status)
    });
  }

  async listAllUsers() {
    const users = await this.request("GET", "/admin/users");
    return { users: (users || []).map((item) => this.mapUser(item)) };
  }

  async listAllPrinters() {
    const printers = await this.request("GET", "/admin/printers");
    return { printers: (printers || []).map((item) => this.mapPrinter(item)) };
  }

  async adjustUserCredits(userId, amount, operation = "add") {
    let delta = Number(amount || 0);

    if (operation === "set") {
      const usersResult = await this.listAllUsers();
      const current = usersResult.users.find((item) => String(item.id) === String(userId));
      if (!current) {
        throw new Error("User not found");
      }
      delta = Number(amount) - Number(current.credits || 0);
      if (delta === 0) {
        return { unchanged: true };
      }
    }

    return this.request("PATCH", `/admin/users/${userId}/credits`, { amount: delta });
  }

  async updateUserRoles(userId, roles) {
    const roleList = Array.isArray(roles) ? roles : [roles];
    let role = "STUDENT";
    if (roleList.includes("admin")) {
      role = "ADMIN";
    } else if (roleList.includes("printer_owner")) {
      role = "PRINTER_OWNER";
    }

    return this.request("PATCH", `/admin/users/${userId}/role`, { role });
  }

  async updatePrinterStatus(printerId, status) {
    return this.request("PATCH", `/admin/printers/${printerId}/status`, {
      status: this.normalizePrinterStatusToBackend(status)
    });
  }

  async getAdminStats() {
    const stats = await this.request("GET", "/admin/stats");

    return {
      stats: {
        totalUsers: Number(stats.activeUsers || 0),
        totalRevenue: Number(stats.globalRevenue || 0),
        totalOrders: 0,
        totalPrinters: 0,
        adminCredits: 0,
        jobSuccessRate: Number(stats.jobSuccessRate || 0)
      }
    };
  }
}

window.apiClient = new APIClient();
