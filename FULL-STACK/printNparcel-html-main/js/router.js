// Simple Router for SPA-like navigation
class Router {
  constructor() {
    this.routes = {
      '/': '/index.html',
      '/login': '/pages/login.html',
      '/signup': '/pages/signup.html',
      '/dashboard': '/pages/dashboard.html',
      '/printers': '/pages/printers.html',
      '/orders': '/pages/orders.html',
      '/admin': '/pages/admin.html',
      '/printer-register': '/pages/printer-register.html',
      '/printer-dashboard': '/pages/printer-dashboard.html'
    };
  }

  navigate(path, replace = false) {
    // Handle both absolute and relative paths
    if (!path.startsWith('/') && !path.startsWith('http')) {
      path = '/' + path;
    }

    // Check if it's a full path or route key
    let targetPath = this.routes[path] || path;
    
    // Convert to absolute path if needed
    if (targetPath.startsWith('/pages/') || targetPath === '/index.html') {
      const baseUrl = window.location.origin;
      const currentPath = window.location.pathname;
      const basePath = currentPath.includes('/pages/') 
        ? currentPath.substring(0, currentPath.lastIndexOf('/pages/'))
        : currentPath.substring(0, currentPath.lastIndexOf('/'));
      
      if (targetPath === '/index.html') {
        targetPath = basePath + targetPath;
      } else {
        targetPath = basePath + targetPath;
      }
    }

    if (replace) {
      window.location.replace(targetPath);
    } else {
      window.location.href = targetPath;
    }
  }

  back() {
    window.history.back();
  }

  getCurrentPath() {
    return window.location.pathname;
  }

  getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
}

// Initialize router
const router = new Router();

// Back button functionality
document.addEventListener('DOMContentLoaded', () => {
  const backButtons = document.querySelectorAll('.back-button');
  backButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      router.back();
    });
  });
});
