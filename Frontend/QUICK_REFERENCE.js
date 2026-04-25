/* ===========================================
   QUICK REFERENCE GUIDE
   CampusPrint HTML/CSS/JavaScript Version
   =========================================== */

// ============================================
// 1. AUTHENTICATION
// ============================================

// Check if user is logged in
if (authManager.isAuthenticated()) {
  // User is logged in
}

// Get current user
const user = authManager.user;
// Properties: id, email, username, firstName, lastName, credits, roles, university, hall

// Login with credentials
authManager.login(email, password)
  .then(() => {
    // Success - redirect to dashboard
  })
  .catch(err => {
    // Show error
  });

// Demo login (no credentials needed)
authManager.loginDemo('user');        // Student
authManager.loginDemo('printer_owner'); // Printer Owner
authManager.loginDemo('admin');         // Admin

// Signup
authManager.signup({
  email, password, username, firstName, lastName,
  university, hall, phoneNumber
});

// Logout
authManager.logout(); // Clears data and redirects to home

// Check current role
const role = authManager.currentRole; // 'user', 'printer_owner', or 'admin'

// Require authentication (use in pages)
if (!authManager.requireAuth()) {
  // Will redirect to login if not authenticated
}

// Update user credits
authManager.updateCredits(10.50); // Adds 10.50 to current balance

// ============================================
// 2. NAVIGATION / ROUTING
// ============================================

// Navigate to a page
router.navigate('/pages/dashboard.html');
router.navigate('/pages/printers.html');

// Navigate with replace (no history entry)
router.navigate('/pages/login.html', true);

// Go back
router.back();

// Get current path
const currentPath = router.getCurrentPath();

// Get query parameter
const userId = router.getQueryParam('id');

// Save redirect location (for after login)
sessionStorage.setItem('redirectAfterLogin', '/pages/printers.html');

// ============================================
// 3. THEME MANAGEMENT
// ============================================

// Toggle theme
themeManager.toggle();

// Get current theme
const theme = themeManager.theme; // 'dark' or 'light'

// Check if dark mode
if (themeManager.theme === 'dark') {
  // Dark mode is active
}

// Apply theme (automatically called)
themeManager.applyTheme();

// ============================================
// 4. NOTIFICATIONS
// ============================================

// Show success message
app.showSuccess('Printer registered successfully!');

// Show error message
app.showError('Failed to load data');

// Messages auto-dismiss after 3 seconds

// ============================================
// 5. UTILITY FUNCTIONS
// ============================================

// Format currency
const formatted = app.formatCurrency(123.45); // "৳123.45"

// Format date
const dateStr = app.formatDate(new Date()); // "Jan 15, 2024"
const dateStr = app.formatDate('2024-01-15'); // "Jan 15, 2024"

// Format date and time
const dateTimeStr = app.formatDateTime(new Date()); // "Jan 15, 2024, 10:30 AM"

// ============================================
// 6. UI MANIPULATION
// ============================================

// Show/hide elements
element.classList.add('hidden');
element.classList.remove('hidden');
element.classList.toggle('hidden');

// Update UI after auth changes
authManager.updateUI();

// Update profile menu
const profileButtons = document.querySelectorAll('.profile-button');
profileButtons.forEach(button => {
  // Update button
});

// ============================================
// 7. FORM HANDLING
// ============================================

// Basic form submit
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = {
    field1: document.getElementById('field1').value,
    field2: document.getElementById('field2').value
  };
  
  try {
    // Process form
    app.showSuccess('Form submitted!');
  } catch (err) {
    app.showError(err.message);
  }
});

// Form validation
function validateForm() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  if (!email || !password) {
    app.showError('Please fill all fields');
    return false;
  }
  
  if (password.length < 6) {
    app.showError('Password must be at least 6 characters');
    return false;
  }
  
  return true;
}

// Show loading state
function setLoading(loading) {
  const submitBtn = document.getElementById('submitBtn');
  if (loading) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span>Loading...';
  } else {
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Submit';
  }
}

// ============================================
// 8. LOCAL STORAGE
// ============================================

// Save data
localStorage.setItem('key', 'value');
localStorage.setItem('object', JSON.stringify({ data: 'value' }));

// Get data
const value = localStorage.getItem('key');
const object = JSON.parse(localStorage.getItem('object'));

// Remove data
localStorage.removeItem('key');

// Clear all
localStorage.clear();

// ============================================
// 9. SVG ICONS (from app.js)
// ============================================

// Available icons:
icons.printer
icons.truck
icons.plus
icons.users
icons.clock
icons.shield
icons.mail
icons.lock
icons.user
icons.eye
icons.eyeOff
icons.mapPin
icons.building
icons.phone
icons.creditCard
icons.menu
icons.x
icons.logout
icons.settings
icons.edit
icons.userPlus

// Usage in HTML:
<div innerHTML="${icons.printer}"></div>

// Or direct SVG:
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <!-- SVG path here -->
</svg>

// ============================================
// 10. CSS CLASSES
// ============================================

// Glassmorphic Components
.glass-card           // Container with glass effect
.glass-card.hover     // Glass card with hover effect
.glass-button         // Button with glass styling
.glass-button.primary // Primary button (green)
.glass-button.secondary // Secondary button
.glass-button.ghost   // Ghost button (transparent)
.glass-button.danger  // Danger button (red)
.glass-input          // Input with glass effect

// Layout
.container            // Max-width container with padding
.flex                 // Display flex
.grid                 // Display grid
.hidden               // Display none
.relative / .absolute // Position

// Spacing
.mb-1, .mb-2, .mb-3, .mb-4, .mb-6  // Margin bottom
.mt-1, .mt-2, .mt-4, .mt-6          // Margin top
.pt-16                               // Padding top

// Typography
.gradient-text        // Gradient text effect
.text-center          // Text align center

// Sizing
.w-full               // Width 100%
.max-w-md, .max-w-lg  // Max width

// ============================================
// 11. CSS VARIABLES (Customizable)
// ============================================

:root {
  // Colors
  --theme-bg
  --theme-text
  --theme-text-secondary
  --theme-text-muted
  --glass-bg
  --glass-border
  --glass-hover
  --campus-green
  --success
  --warning
  --danger
  --info
}

// Usage in custom styles:
.custom-element {
  background: var(--glass-bg);
  color: var(--theme-text);
  border: 1px solid var(--glass-border);
}

// ============================================
// 12. PAGE STRUCTURE TEMPLATE
// ============================================

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title - CampusPrint</title>
  <link rel="stylesheet" href="../css/styles.css">
</head>
<body>
  <!-- Header (copy from existing pages) -->
  <header class="header">
    <!-- Header content -->
  </header>

  <!-- Main Content -->
  <div class="pt-16">
    <div class="container">
      <h1>Page Title</h1>
      <!-- Your content -->
    </div>
  </div>

  <!-- Scripts -->
  <script src="../js/theme.js"></script>
  <script src="../js/router.js"></script>
  <script src="../js/auth.js"></script>
  <script src="../js/app.js"></script>
  
  <!-- Page-specific script -->
  <script>
    // Require authentication
    if (!authManager.requireAuth()) {
      // Redirects to login
    }

    // Your page logic
    document.addEventListener('DOMContentLoaded', () => {
      // Initialize page
    });
  </script>
</body>
</html>

// ============================================
// 13. COMMON PATTERNS
// ============================================

// Loading Data Pattern
async function loadData() {
  try {
    // Show loading state
    setLoading(true);
    
    // Fetch data (mock or API)
    const data = getMockData();
    
    // Update UI
    renderData(data);
    
  } catch (err) {
    app.showError('Failed to load data');
  } finally {
    setLoading(false);
  }
}

// Search/Filter Pattern
function filterData() {
  const searchQuery = document.getElementById('search').value.toLowerCase();
  const filterType = document.getElementById('filter').value;
  
  const filtered = allData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery);
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });
  
  renderData(filtered);
}

// Tab Navigation Pattern
function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.style.display = 'none';
  });
  
  // Remove active class from all buttons
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected tab
  document.getElementById(tabName + '-tab').style.display = 'block';
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

// Modal Pattern
function showModal(modalId) {
  document.getElementById(modalId).classList.remove('hidden');
}

function hideModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

// ============================================
// 14. DEMO DATA EXAMPLES
// ============================================

// Mock Users
const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    status: 'active',
    joined: '2024-01-15'
  }
];

// Mock Printers
const mockPrinters = [
  {
    id: 1,
    name: 'Fast Print Hub',
    type: 'both',
    location: {
      university: 'Demo University',
      hall: 'North Hall',
      room: '205'
    },
    pricePerPage: {
      bw: 2.00,
      color: 5.00
    },
    status: 'active'
  }
];

// Mock Orders
const mockOrders = [
  {
    id: 'ORD-001',
    printerName: 'Fast Print Hub',
    pages: 15,
    cost: 30.00,
    status: 'completed',
    date: '2024-01-15T10:30:00'
  }
];

// ============================================
// END OF QUICK REFERENCE
// ============================================
