// Authentication Management - Professional Implementation
(function() {
  'use strict';

  class AuthManager {
    constructor() {
      this.user = null;
      this.currentRole = null;
      this.loadUser();
      this.updateUI();
    }

    loadUser() {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          this.user = JSON.parse(userData);
          if (!this.user || !this.user.email) {
            this.clearSession();
            return;
          }
          const roles = Array.isArray(this.user.roles) && this.user.roles.length > 0 ? this.user.roles : ['user'];
          const storedRole = localStorage.getItem('currentRole');
          this.currentRole = storedRole && roles.includes(storedRole) ? storedRole : roles[0];
        } catch (e) {
          console.error('[Auth] Load error:', e);
          this.clearSession();
        }
      }
    }

    clearSession() {
      this.user = null;
      this.currentRole = null;
      localStorage.removeItem('user');
      localStorage.removeItem('currentRole');
    }

    saveUser() {
      if (this.user) {
        localStorage.setItem('user', JSON.stringify(this.user));
        localStorage.setItem('currentRole', this.currentRole);
      }
    }

    isAuthenticated() {
      const hasUser = this.user && this.user.email;
      const hasToken = window.apiClient && window.apiClient.getToken();
      return hasUser && hasToken;
    }

    hasRole(role) {
      if (!this.user || !Array.isArray(this.user.roles)) return false;
      return this.user.roles.includes(role);
    }

    setActiveRole(role) {
      if (!this.hasRole(role)) {
        throw new Error(`Access denied for role: ${role}`);
      }
      this.currentRole = role;
      this.saveUser();
    }

    getPagePath(pageFile) {
      const inPagesDir = (window.location.pathname || '').includes('/pages/');
      return inPagesDir ? pageFile : `pages/${pageFile}`;
    }

    getRoleBasedRedirectUrl() {
      if (!this.user) return this.getPagePath('dashboard.html');
      if (this.currentRole === 'admin') return this.getPagePath('admin.html');
      if (this.currentRole === 'printer_owner') return this.getPagePath('printer-dashboard.html');
      return this.getPagePath('dashboard.html');
    }

    requireAuth() {
      if (this.isAuthenticated()) {
        return true;
      }

      const currentPath = window.location.pathname || '';
      if (!currentPath.endsWith('/login.html')) {
        const redirectPath = currentPath.includes('/pages/')
          ? currentPath.substring(currentPath.lastIndexOf('/') + 1)
          : currentPath;
        if (redirectPath) {
          sessionStorage.setItem('redirectAfterLogin', redirectPath);
        }
        window.location.href = this.getPagePath('login.html');
      }
      return false;
    }

    requireRole(role) {
      if (!this.requireAuth()) {
        return false;
      }
      if (this.hasRole(role)) {
        if (!this.currentRole || this.currentRole !== role) {
          this.setActiveRole(role);
        }
        return true;
      }
      const fallback = this.getRoleBasedRedirectUrl();
      window.location.href = fallback;
      return false;
    }

    async login(email, password, requestedRole = null) {
      console.log('[Auth] Login:', email);
      const response = await window.apiClient.login(email, password, requestedRole);
      if (!response || !response.user) throw new Error('Invalid response');

      this.user = response.user;
      const roles = Array.isArray(this.user.roles) && this.user.roles.length > 0 ? this.user.roles : ['user'];

      if (requestedRole && !roles.includes(requestedRole)) {
        this.clearSession();
        if (window.apiClient) window.apiClient.clearToken();
        throw new Error(`Your account does not have ${requestedRole.replace('_', ' ')} access.`);
      }

      this.currentRole = requestedRole && roles.includes(requestedRole) ? requestedRole : roles[0];
      this.saveUser();
      console.log('[Auth] Logged in:', this.user.username);
      return true;
    }

    async loginDemo(role) {
      const creds = {
        user: { email: 'student@campus.com', password: 'demo123' },
        printer_owner: { email: 'owner@campus.com', password: 'demo123' },
        admin: { email: 'admin@campus.com', password: 'demo123' }
      }[role] || { email: 'student@campus.com', password: 'demo123' };
      
      console.log('[Auth] Demo:', role);
      return this.login(creds.email, creds.password, role);
    }

    async signup(formData) {
      console.log('[Auth] Signup:', formData.email);
      const response = await window.apiClient.signup({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber || '',
        university: formData.university || '',
        hall: formData.hall || ''
      });
      if (!response || !response.user) throw new Error('Invalid response');
      
      this.user = response.user;
      this.currentRole = this.user.roles[0];
      this.saveUser();
      console.log('[Auth] Signed up:', this.user.username);
      return true;
    }

    logout() {
      this.clearSession();
      if (window.apiClient) window.apiClient.clearToken();
      this.updateUI();
      window.location.href = this.getPagePath('login.html');
    }

    updateUI() {
      const isAuth = this.isAuthenticated();
      
      document.querySelectorAll('.auth-buttons').forEach(el => {
        if (el) el.style.display = isAuth ? 'none' : 'flex';
      });
      document.querySelectorAll('.profile-menu').forEach(el => {
        if (el) el.style.display = isAuth ? 'block' : 'none';
      });

      if (isAuth && this.user) {
        document.querySelectorAll('.user-username').forEach(el => {
          if (el) el.textContent = this.user.username || '';
        });
        document.querySelectorAll('.user-credits').forEach(el => {
          if (el) el.textContent = `৳${(this.user.credits || 0).toFixed(2)}`;
        });
        document.querySelectorAll('.profile-name').forEach(el => {
          if (el) el.textContent = `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim();
        });
        document.querySelectorAll('.profile-email').forEach(el => {
          if (el) el.textContent = this.user.email || '';
        });
        document.querySelectorAll('.profile-avatar').forEach(el => {
          if (el) {
            if (this.user.profilePicture) {
              el.innerHTML = `<img src="${this.user.profilePicture}" alt="${this.user.username}">`;
            } else {
              const initial = (this.user.firstName || this.user.username || 'U').charAt(0).toUpperCase();
              el.innerHTML = `<span>${initial}</span>`;
            }
          }
        });
      }
    }
  }

  // Initialize
  window.AuthManager = AuthManager;
  window.authManager = new AuthManager();
  
  console.log('[Auth] Initialized, user:', window.authManager.user?.username || 'none');
})();
