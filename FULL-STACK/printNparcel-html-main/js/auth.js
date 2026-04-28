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

    normalizeUser(user) {
      const role = user.role || (Array.isArray(user.roles) ? user.roles[0] : 'user');
      const roleValue = String(role || '').toUpperCase();
      let normalizedRole = 'user';
      let roles = ['user'];

      if (roleValue === 'ADMIN') {
        normalizedRole = 'admin';
        roles = ['admin', 'printer_owner', 'user'];
      } else if (roleValue === 'PRINTER_OWNER') {
        normalizedRole = 'printer_owner';
        roles = ['printer_owner', 'user'];
      }

      return {
        ...user,
        role: normalizedRole,
        roles,
        credits: Number(user.credits || 0)
      };
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
          this.user = this.normalizeUser(this.user);
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
      this.user = this.normalizeUser(this.user);
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
        hall: formData.hall || '',
        role: formData.role
      });
      if (!response || !response.user) throw new Error('Invalid response');
      
      this.user = response.user;
      this.user = this.normalizeUser(this.user);
      this.currentRole = this.user.roles[0];
      this.saveUser();
      console.log('[Auth] Signed up:', this.user.username);
      return true;
    }

    updateCredits(delta) {
      if (!this.user) return;
      this.user.credits = Number(this.user.credits || 0) + Number(delta || 0);
      if (this.user.credits < 0) {
        this.user.credits = 0;
      }
      this.saveUser();
      this.updateUI();
    }

    logout() {
      this.clearSession();
      if (window.apiClient) window.apiClient.clearToken();
      this.updateUI();
      window.location.href = this.getPagePath('login.html');
    }

    async editProfile(data) {
      const updatedUser = await window.apiClient.updateUserProfile(data);
      this.user = { ...this.user, ...updatedUser };
      this.saveUser();
      this.updateUI();
      return this.user;
    }

    async switchToRole(role) {
      if (role === 'printer_owner' && !this.hasRole('printer_owner')) {
        // Redirect to registration page for upgrade
        window.location.href = this.getPagePath('printer-register.html');
        return;
      }

      this.setActiveRole(role);
      window.location.href = this.getRoleBasedRedirectUrl();
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
          if (el) el.textContent = this.user.fullName || this.user.username || '';
        });
        document.querySelectorAll('.user-credits').forEach(el => {
          if (el) el.textContent = `৳${(this.user.credits || 0).toFixed(2)}`;
        });
        document.querySelectorAll('.profile-name').forEach(el => {
          if (el) el.textContent = this.user.fullName || this.user.username || '';
        });
        document.querySelectorAll('.profile-email').forEach(el => {
          if (el) el.textContent = this.user.email || '';
        });
        
        // Update role-based dropdown items
        const dropdown = document.querySelector('.profile-dropdown');
        if (dropdown) {
          this.renderDropdownItems(dropdown);
        }

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

    renderDropdownItems(container) {
      const userIcon = window.icons?.user || '';
      const logoutIcon = window.icons?.logout || '';

      // Find or create the custom items container
      let itemsContainer = container.querySelector('.custom-dropdown-items');
      if (!itemsContainer) {
        // If it doesn't exist, we'll replace the static list with a dynamic one
        // For simplicity in this legacy setup, we'll find the div after profile-info
        itemsContainer = container.querySelector('div:nth-child(2)');
        if (itemsContainer) itemsContainer.className = 'custom-dropdown-items';
      }

      if (!itemsContainer) return;

      const roles = this.user.roles || ['user'];
      const isAdmin = roles.includes('admin');
      const isOwner = roles.includes('printer_owner');

      let html = `
        <div style="padding: 0.5rem 1rem; font-size: 0.75rem; font-weight: 700; color: var(--theme-text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">
          Account
        </div>
        <button onclick="authManager.showProfileEditor()" class="dropdown-item">
          ${userIcon} Edit Profile
        </button>
        
        <div style="height: 1px; background: var(--glass-border); margin: 0.5rem 0;"></div>
        
        <div style="padding: 0.5rem 1rem; font-size: 0.75rem; font-weight: 700; color: var(--theme-text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">
          Switch Role
        </div>
      `;

      // Role Switching Options
      if (isAdmin) {
        html += `
          <button onclick="authManager.switchToRole('admin')" class="dropdown-item ${this.currentRole === 'admin' ? 'active' : ''}" style="${this.currentRole === 'admin' ? 'background: var(--glass-bg); color: var(--primary); font-weight: 600;' : ''}">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: ${this.currentRole === 'admin' ? 'var(--primary)' : 'transparent'}; border: 1px solid var(--glass-border); margin-right: 0.5rem;"></div>
            Admin
          </button>
          <button onclick="authManager.switchToRole('printer_owner')" class="dropdown-item ${this.currentRole === 'printer_owner' ? 'active' : ''}" style="${this.currentRole === 'printer_owner' ? 'background: var(--glass-bg); color: var(--primary); font-weight: 600;' : ''}">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: ${this.currentRole === 'printer_owner' ? 'var(--primary)' : 'transparent'}; border: 1px solid var(--glass-border); margin-right: 0.5rem;"></div>
            Printer Owner
          </button>
          <button onclick="authManager.switchToRole('user')" class="dropdown-item ${this.currentRole === 'user' ? 'active' : ''}" style="${this.currentRole === 'user' ? 'background: var(--glass-bg); color: var(--primary); font-weight: 600;' : ''}">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: ${this.currentRole === 'user' ? 'var(--primary)' : 'transparent'}; border: 1px solid var(--glass-border); margin-right: 0.5rem;"></div>
            User (Student)
          </button>
        `;
      } else if (isOwner) {
        html += `
          <button onclick="authManager.switchToRole('printer_owner')" class="dropdown-item ${this.currentRole === 'printer_owner' ? 'active' : ''}" style="${this.currentRole === 'printer_owner' ? 'background: var(--glass-bg); color: var(--primary); font-weight: 600;' : ''}">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: ${this.currentRole === 'printer_owner' ? 'var(--primary)' : 'transparent'}; border: 1px solid var(--glass-border); margin-right: 0.5rem;"></div>
            Printer Owner
          </button>
          <button onclick="authManager.switchToRole('user')" class="dropdown-item ${this.currentRole === 'user' ? 'active' : ''}" style="${this.currentRole === 'user' ? 'background: var(--glass-bg); color: var(--primary); font-weight: 600;' : ''}">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: ${this.currentRole === 'user' ? 'var(--primary)' : 'transparent'}; border: 1px solid var(--glass-border); margin-right: 0.5rem;"></div>
            User (Student)
          </button>
        `;
      } else {
        html += `
          <button onclick="authManager.switchToRole('user')" class="dropdown-item active" style="background: var(--glass-bg); color: var(--primary); font-weight: 600;">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--primary); border: 1px solid var(--glass-border); margin-right: 0.5rem;"></div>
            User (Student)
          </button>
          <button onclick="authManager.switchToRole('printer_owner')" class="dropdown-item">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: transparent; border: 1px solid var(--glass-border); margin-right: 0.5rem;"></div>
            Become Printer Owner
          </button>
        `;
      }

      html += `
        <div style="height: 1px; background: var(--glass-border); margin: 0.5rem 0;"></div>
        <button class="dropdown-item danger logout-button" onclick="authManager.logout()">
          ${logoutIcon} Sign Out
        </button>
      `;

      itemsContainer.innerHTML = html;
    }

    showProfileEditor() {
      // Remove any existing modal
      const existingModal = document.getElementById('profileEditorModal');
      if (existingModal) existingModal.remove();

      // Create modal overlay
      const modal = document.createElement('div');
      modal.id = 'profileEditorModal';
      modal.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
        display: flex; align-items: center; justify-content: center;
        z-index: 9999; animation: fadeIn 0.3s ease;
      `;

      // Create modal content
      modal.innerHTML = `
        <div class="glass-card" style="width: 90%; max-width: 450px; padding: 2rem; position: relative; animation: slideUp 0.3s ease;">
          <h2 style="margin-bottom: 1.5rem; font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Edit Profile</h2>
          
          <form id="profileEditForm">
            <div class="form-group">
              <label class="form-label">First Name</label>
              <input type="text" id="editFirstName" class="form-input" value="${this.user.firstName || ''}" placeholder="Enter first name">
            </div>
            
            <div class="form-group">
              <label class="form-label">Last Name</label>
              <input type="text" id="editLastName" class="form-input" value="${this.user.lastName || ''}" placeholder="Enter last name">
            </div>
            
            <div class="form-group">
              <label class="form-label">Username</label>
              <input type="text" id="editUsername" class="form-input" value="${this.user.username || ''}" placeholder="Enter username" required>
            </div>

            <div style="display: flex; gap: 1rem; margin-top: 2rem;">
              <button type="button" class="glass-button secondary" style="flex: 1;" onclick="document.getElementById('profileEditorModal').remove()">Cancel</button>
              <button type="submit" class="glass-button primary" style="flex: 1;">Save Changes</button>
            </div>
          </form>

          <style>
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          </style>
        </div>
      `;

      document.body.appendChild(modal);

      // Handle form submission
      document.getElementById('profileEditForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const firstName = document.getElementById('editFirstName').value;
        const lastName = document.getElementById('editLastName').value;
        const username = document.getElementById('editUsername').value;

        const saveBtn = e.target.querySelector('button[type="submit"]');
        const originalText = saveBtn.textContent;
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        try {
          await this.editProfile({ firstName, lastName, username });
          modal.remove();
          // Show toast if available, else alert
          if (window.showToast) {
            window.showToast('Profile updated successfully!', 'success');
          } else {
            alert('Profile updated successfully!');
          }
        } catch (err) {
          saveBtn.disabled = false;
          saveBtn.textContent = originalText;
          alert('Error updating profile: ' + err.message);
        }
      });
    }
  }

  // Initialize
  window.AuthManager = AuthManager;
  window.authManager = new AuthManager();
  globalThis.authManager = window.authManager;
  
  console.log('[Auth] Initialized, user:', window.authManager.user?.username || 'none');
})();
