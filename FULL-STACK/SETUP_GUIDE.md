# PrintNParcel - Complete Setup Guide

## 🚀 Quick Start (5 minutes)

This guide will help you set up and run both the frontend and backend for the PrintNParcel campus printing system with full authentication and role-based access.

---

## Part 1: Backend Setup

### Prerequisites Check

Before starting, verify you have these installed:

```bash
# Check Node.js version (should be v14+)
node --version

# Check npm version
npm --version

# PostgreSQL - check if installed
psql --version
```

If any are missing, install them:
- **Node.js**: https://nodejs.org/ (includes npm)
- **PostgreSQL**: https://www.postgresql.org/download/

### Step 1: Install Backend Dependencies

```bash
cd d:\ALL CODE\Full-stack\printNparcel-backend
npm install
```

**Expected output:**
```
added X packages in Y seconds
```

### Step 2: PostgreSQL Database Setup

#### Windows Users:

1. **Start PostgreSQL Service:**
   - Search for "Services" in Windows
   - Find "PostgreSQL" and check if it's running
   - If not, right-click → Start

2. **Open PostgreSQL Command Line:**
   - Search for "pgAdmin" or open command prompt
   - Run: `psql -U postgres`
   - Enter password when prompted (default might be empty, just press Enter)

3. **Create Database and User:**

   Copy-paste this entire block into psql:
   ```sql
   CREATE DATABASE printnparcel;
   CREATE USER printuser WITH PASSWORD 'printpassword';
   ALTER ROLE printuser WITH CREATEDB;
   GRANT ALL PRIVILEGES ON DATABASE printnparcel TO printuser;
   \q
   ```

   **If you get "role printuser already exists" error**, just continue - it's fine.

#### Mac Users:

```bash
# Install PostgreSQL using Homebrew if not already installed
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb printnparcel

# Create user
psql -d printnparcel << EOF
CREATE USER printuser WITH PASSWORD 'printpassword';
ALTER ROLE printuser WITH CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE printnparcel TO printuser;
EOF
```

#### Linux Users:

```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE printnparcel;
CREATE USER printuser WITH PASSWORD 'printpassword';
ALTER ROLE printuser WITH CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE printnparcel TO printuser;
EOF
```

### Step 3: Verify Environment Configuration

Check that `.env` file in `printNparcel-backend/` has correct settings:

```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=printnparcel
DB_USER=printuser
DB_PASSWORD=printpassword
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

### Step 4: Start Backend Server

```bash
cd d:\ALL CODE\Full-stack\printNparcel-backend
npm start
```

**Expected output:**
```
✓ Database connection successful
✓ Database schema initialized

╔════════════════════════════════════════╗
║  PrintNParcel API Server Started       ║
║  Running on: http://localhost:5000     ║
║  Environment: development              ║
╚════════════════════════════════════════╝
```

✅ **Backend is running!** Keep this terminal open.

---

## Part 2: Frontend Setup

### Option A: Using Python HTTP Server (Simple)

Open a **new terminal** and run:

```bash
cd d:\ALL CODE\Full-stack\printNparcel-html-main
python -m http.server 8000
```

Then open: **http://localhost:8000**

### Option B: Using Node.js HTTP Server

```bash
cd d:\ALL CODE\Full-stack\printNparcel-html-main
npx http-server -p 8000
```

Then open: **http://localhost:8000**

### Option C: Using VS Code Live Server Extension

1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

---

## Part 3: Test Authentication

### Demo Accounts

The system comes pre-loaded with three demo accounts:

#### 1. **Student Account**
- Email: `student@campus.com`
- Password: `demo123`
- Role: Regular User
- Credits: 150 ৳

**Expected:** Login → Redirects to `/dashboard.html`

#### 2. **Printer Owner Account**
- Email: `owner@campus.com`
- Password: `demo123`
- Roles: User + Printer Owner
- Credits: 500 ৳

**Expected:** Login → Redirects to `/printer-dashboard.html`

#### 3. **Admin Account**
- Email: `admin@campus.com`
- Password: `demo123`
- Roles: User + Printer Owner + Admin
- Credits: 1000 ৳

**Expected:** Login → Redirects to `/admin.html`

### Testing Steps

1. Open frontend (http://localhost:8000)
2. Click **"Login"**
3. Use one of the demo accounts above
4. Verify you get redirected to the correct role-based dashboard
5. Check that credits are displayed
6. Click **"Logout"** and verify redirect to login page

### Create New Account

1. Click **"Sign Up"**
2. Fill in the form with:
   - Email: `test@campus.com`
   - Password: `password123`
   - Username: `testuser`
   - Name: `Test User`
   - University: `Demo University`
3. Click **"Sign Up"**
4. Should receive 50 initial credits and be redirected to dashboard

---

## Part 4: API Testing (Optional)

Test API endpoints using curl or Postman:

### Test Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@campus.com","password":"demo123"}'
```

### Test Protected Endpoint

```bash
# First, get token from login response above, then:
curl -X GET http://localhost:5000/api/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Health Check

```bash
curl http://localhost:5000/api/health
```

---

## File Structure Overview

```
d:\ALL CODE\Full-stack\

├── printNparcel-backend/              ← Backend (Node.js)
│   ├── server.js                      ← Main app
│   ├── package.json                   ← Dependencies
│   ├── .env                           ← Configuration
│   ├── db-schema.sql                  ← Database schema
│   ├── config/db.js                   ← Database connection
│   ├── middleware/auth.js             ← JWT middleware
│   ├── routes/                        ← API endpoints
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── printers.js
│   │   ├── print-jobs.js
│   │   └── admin.js
│   └── utils/password.js              ← Password hashing
│
└── printNparcel-html-main/            ← Frontend (HTML/JS)
    ├── index.html                     ← Landing page
    ├── css/styles.css                 ← Styling
    ├── js/
    │   ├── api.js                     ← API client (NEW)
    │   ├── auth.js                    ← Authentication (UPDATED)
    │   ├── app.js
    │   ├── router.js
    │   └── theme.js
    └── pages/
        ├── login.html                 ← Login (UPDATED)
        ├── signup.html                ← Signup (UPDATED)
        ├── dashboard.html             ← User dashboard
        ├── printer-dashboard.html     ← Printer dashboard
        ├── admin.html                 ← Admin panel
        ├── printers.html
        ├── orders.html
        └── printer-register.html
```

---

## Troubleshooting

### ❌ "npm: command not found"
**Solution:** Node.js not installed. Download from https://nodejs.org/

### ❌ "error: connect ECONNREFUSED 127.0.0.1:5432"
**Solution:** PostgreSQL not running
- **Windows:** Open Services → Start PostgreSQL
- **Mac:** `brew services start postgresql@14`
- **Linux:** `sudo systemctl start postgresql`

### ❌ "Error: connect ECONNREFUSED 127.0.0.1:5000"
**Solution:** Backend not running. Make sure `npm start` is running in the backend terminal.

### ❌ "Blank page when opening frontend"
**Solution:** Frontend server not running
- Option A: `python -m http.server 8000`
- Option B: `npx http-server -p 8000`
- Option C: Use VS Code Live Server

### ❌ "login fails with 'Invalid credentials'"
**Solution:** Backend not connected or database not initialized. Check:
1. PostgreSQL is running
2. Backend is running and shows "✓ Database schema initialized"
3. You're using correct demo credentials

### ❌ "API returns 401 Unauthorized"
**Solution:** JWT token issue
- Token expired? Refresh by logging in again
- Token not in header? Frontend should auto-include it
- Backend JWT_SECRET changed? Update .env and restart

### ❌ "CORS error in console"
**Solution:** Frontend and backend ports mismatch
- Frontend should be on different port than backend (e.g., 8000 vs 5000)
- Check CORS_ORIGIN in .env

### ❌ "Port 5000 already in use"
**Solution:** Kill process using port 5000
- **Windows:** `netstat -ano | findstr :5000` → `taskkill /PID <PID> /F`
- **Mac:** `lsof -i :5000` → `kill -9 <PID>`
- **Linux:** `lsof -i :5000` → `kill -9 <PID>`
- Or change PORT in .env to 5001, 5002, etc.

---

## What's Been Implemented

### ✅ Backend (Node.js + PostgreSQL)
- Complete Express API with JWT authentication
- Role-based access control (user, printer_owner, admin)
- User authentication (login, signup, token verification)
- User management (profiles, credits)
- Printer management (register, list, update)
- Print job system (submit, track, update status)
- Admin panel (user management, statistics)
- PBKDF2 password hashing for security

### ✅ Frontend Updates
- Login page now calls real API instead of demo
- Signup page creates accounts on backend
- Automatic role-based routing after login:
  - User role → `/dashboard.html`
  - Printer owner → `/printer-dashboard.html`
  - Admin role → `/admin.html`
- JWT token management (stored securely)
- Logout clears tokens
- All pages ready for API integration

---

## Next Steps

### For Development
1. ✅ Both servers running?
2. ✅ Can login with demo accounts?
3. ✅ Role-based routing working?
4. Next: Implement dashboard functionality to call API endpoints

### For Production
1. Update JWT_SECRET to strong random value
2. Update database password
3. Set NODE_ENV=production
4. Deploy backend to cloud (Heroku, AWS, DigitalOcean, etc.)
5. Deploy frontend to static hosting (Vercel, Netlify, S3, etc.)
6. Update CORS_ORIGIN to production domain
7. Set up HTTPS/SSL certificates

---

## Support Resources

- **Backend Docs:** See `printNparcel-backend/README.md`
- **API Docs:** See inline comments in `routes/*.js`
- **PostgreSQL:** https://www.postgresql.org/docs/
- **Express:** https://expressjs.com/
- **JWT:** https://jwt.io/
- **Node.js:** https://nodejs.org/docs/

---

## Quick Command Reference

```bash
# Start backend
cd d:\ALL CODE\Full-stack\printNparcel-backend
npm start

# Start frontend (in new terminal)
cd d:\ALL CODE\Full-stack\printNparcel-html-main
python -m http.server 8000

# Test API
curl http://localhost:5000/api/health

# View frontend
http://localhost:8000

# PostgreSQL
psql -U printuser -d printnparcel
```

---

**Happy coding! 🚀**
