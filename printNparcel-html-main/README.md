# CampusPrint - HTML/CSS/JavaScript Version

This is a converted version of the CampusPrint React application, rebuilt using vanilla HTML, CSS, and JavaScript. It maintains the same UI/UX, styling, and functionality as the original React version.

## 🎯 Project Structure

```
printNparcel-html/
├── index.html              # Home page
├── css/
│   └── styles.css          # Main stylesheet (converted from Tailwind CSS)
├── js/
│   ├── app.js             # Main application logic & utilities
│   ├── auth.js            # Authentication management
│   ├── theme.js           # Dark/Light theme toggle
│   └── router.js          # Client-side routing
├── pages/
│   ├── login.html         # Login page
│   ├── signup.html        # Sign up page
│   ├── dashboard.html     # User dashboard
│   ├── printers.html      # Browse printers
│   ├── orders.html        # View orders
│   ├── printer-register.html    # Register new printer
│   ├── printer-dashboard.html   # Printer owner dashboard
│   └── admin.html         # Admin dashboard
├── data/                  # JSON data files (if needed)
└── assets/                # Images and icons
```

## ✨ Features

### Pages Included:
✅ **Home Page** - Hero section with quick actions and about section
✅ **Login Page** - Email/password login + demo mode (Student/Owner/Admin)
✅ **Signup Page** - Complete registration form
✅ **Dashboard** - User dashboard with stats and recent activity
✅ **Printers Page** - Browse and search available printers
✅ **Orders Page** - View all print orders with status filters
✅ **Printer Register** - Form to add new printer
✅ **Printer Owner Dashboard** - Manage printers and view jobs
✅ **Admin Dashboard** - Manage users, printers, and orders

### Key Features:
- 🎨 **Glassmorphism Design** - Beautiful frosted glass UI
- 🌓 **Dark/Light Theme Toggle** - Persistent theme preference
- 🔐 **Authentication System** - Login, signup, and demo modes
- 💾 **LocalStorage State** - Persistent user data and preferences
- 📱 **Fully Responsive** - Mobile, tablet, and desktop layouts
- 🎯 **Client-Side Routing** - SPA-like navigation
- 👤 **Role-Based Access** - User, Printer Owner, Admin roles
- 💳 **Credit System** - Display user credits in header

## 🚀 Getting Started

### Option 1: Open Directly
Simply open `index.html` in your web browser:
```bash
# Windows
start index.html

# Mac
open index.html

# Linux
xdg-open index.html
```

### Option 2: Use a Local Server
For better development experience:

**Using Python:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Using Node.js (http-server):**
```bash
npx http-server -p 8000
```

**Using PHP:**
```bash
php -S localhost:8000
```

Then visit: `http://localhost:8000`

## 🔑 Demo Login Credentials

### Regular Login:
- **Email:** demo@campus.com
- **Password:** demo123

### Demo Mode (One-Click Login):
- **Student Demo** - Basic user access
- **Owner Demo** - Printer owner + user access
- **Admin Demo** - Full admin access

## 📖 Usage Guide

### Authentication System
The authentication is handled by `auth.js`:
- User data stored in `localStorage` as JSON
- Supports multiple roles: `user`, `printer_owner`, `admin`
- Demo mode for quick testing
- Auto-redirect after login

### Theme System
Dark/Light mode toggle (`theme.js`):
- Preference saved in `localStorage`
- Applies CSS class to `<html>` and `<body>`
- Dynamic icon updates (sun/moon)

### Router System
Client-side navigation (`router.js`):
- Programmatic navigation: `router.navigate('/path')`
- Back navigation: `router.back()`
- Query parameters support

### State Management
Using `localStorage` instead of React Context:
- User data: `localStorage.getItem('user')`
- Theme: `localStorage.getItem('theme')`
- Current role: `localStorage.getItem('currentRole')`

## 🎨 Styling System

### CSS Variables
All colors and theme values use CSS custom properties:
```css
:root {
  --theme-bg: #F7F8FA;
  --campus-green: #34A853;
  --glass-bg: rgba(255, 255, 255, 0.65);
  /* ... more variables */
}

.dark {
  --theme-bg: #0a0a0a;
  /* ... dark theme overrides */
}
```

### Glassmorphic Components
- `.glass-card` - Container with frosted glass effect
- `.glass-button` - Button with glass styling
- `.glass-input` - Input fields with glass effect

### Utility Classes
- Spacing: `.mb-1`, `.mt-2`, `.pt-16`
- Layout: `.flex`, `.grid`, `.container`
- Typography: `.gradient-text`, `.text-center`

## 🔧 Customization

### Adding New Pages
1. Create HTML file in `pages/` directory
2. Include standard scripts:
   ```html
   <script src="../js/theme.js"></script>
   <script src="../js/router.js"></script>
   <script src="../js/auth.js"></script>
   <script src="../js/app.js"></script>
   ```
3. Add authentication check if needed:
   ```javascript
   if (!authManager.requireAuth()) {
     // Redirects to login
   }
   ```

### Modifying Styles
Edit `css/styles.css`:
- Change colors in CSS variables
- Add new component styles
- Modify responsive breakpoints

### Adding Features
Use the existing JavaScript APIs:
```javascript
// Show notifications
app.showSuccess('Success message');
app.showError('Error message');

// Navigate programmatically
router.navigate('/path');

// Update user credits
authManager.updateCredits(10.50);

// Check authentication
if (authManager.isAuthenticated()) {
  // User is logged in
}
```

## 📝 Key Differences from React Version

### Removed Features:
❌ Delivery-related pages (as requested)
❌ React Router → Replaced with custom router
❌ Context API → Replaced with localStorage
❌ React Components → Vanilla HTML/JS
❌ Tailwind CSS → Custom CSS
❌ TypeScript → JavaScript

### Maintained Features:
✅ All UI/UX design
✅ Glassmorphism styling
✅ Dark/Light theme
✅ Authentication flow
✅ Role-based access
✅ All non-delivery pages
✅ Responsive design

## 🛠️ Browser Compatibility

Tested and working on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📱 Mobile Support

Fully responsive design with breakpoints:
- Mobile: < 480px
- Tablet: 481px - 768px
- Desktop: > 768px

## 🐛 Troubleshooting

### Theme not persisting:
- Check browser localStorage is enabled
- Clear cache and reload

### Navigation not working:
- Ensure all script files are loaded
- Check browser console for errors

### Styling looks broken:
- Verify `styles.css` is loaded correctly
- Check if CSS custom properties are supported

## 📄 License

This project is a conversion of the original CampusPrint React application.

## 🤝 Contributing

To add features or fix bugs:
1. Modify the appropriate files
2. Test in multiple browsers
3. Ensure mobile responsiveness
4. Update this README if needed

## 📧 Support

For issues or questions about this HTML version, please refer to the original React project documentation.

---

**Note:** This is a static HTML/CSS/JS version. For a production application with real backend integration, consider using the original React version with proper API endpoints and database connectivity.
