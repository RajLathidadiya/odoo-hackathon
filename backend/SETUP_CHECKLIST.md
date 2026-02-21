# Database Setup Checklist

## Quick Start (5 Minutes)

### ✅ Step 1: Create Database Structure (2 min)
```
1. Open MySQL Workbench
2. File → New Query Tab
3. Copy & paste: backend/database-setup.sql
4. Execute (Ctrl+Shift+Enter)
5. Wait for completion
```

### ✅ Step 2: Load Sample Data (Optional, 1 min)
```
1. Open: backend/sample-data.sql
2. Execute
```

### ✅ Step 3: Create Backend .env File (1 min)
```
Create file: backend/.env

Content:
─────────────────────────────
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=fleet_db
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
SERVER_PORT=3000
NODE_ENV=development
─────────────────────────────
```

### ✅ Step 4: Create Test Users (1 min)
```powershell
cd backend
$Env:INIT_SUPER_ADMIN = 'true'
$Env:INIT_TEST_USERS = 'true'
node init-rbac.js
```

### ✅ Step 5: Start Backend (1 min)
```powershell
npm start
# Wait for: "Database connected successfully"
```

### ✅ Step 6: Start Frontend (1 min)
```powershell
cd frontend
npm run dev
# Wait for: "Local: http://localhost:5173"
```

### ✅ Step 7: Login & Test
```
URL: http://localhost:5173
Email: superadmin@fleet.com
Password: SuperAdmin@123
```

---

## Detailed Verification Steps

### Verify MySQL Connection
```powershell
# Test MySQL is running
mysql -u root -p -e "SELECT 1;"
# Should output: 1
```

### Verify Database Created
```sql
SHOW DATABASES;
-- Should see: fleet_db
```

### Verify Tables Created
```sql
USE fleet_db;
SHOW TABLES;
-- Should show 11 tables
```

### Verify Roles Inserted
```sql
SELECT * FROM roles;
-- Should show 8 roles including 'Super Admin'
```

### Verify Users Created
```sql
SELECT id, full_name, email, role_id, is_active FROM users;
-- Should show 5+ users with Super Admin

-- View with role names:
SELECT u.id, u.full_name, u.email, r.name as role
FROM users u
LEFT JOIN roles r ON u.role_id = r.id;
```

### Verify Backend Connected
```powershell
# Check if server is running
curl http://localhost:3000/api/
# Should return: {"message":"API is working"}
```

### Verify Frontend Running
```
Open browser: http://localhost:5173
Should show login page
```

---

## Test Logins

### Super Admin
```
Email: superadmin@fleet.com
Password: SuperAdmin@123
Expected: Full access to all features + User Management
```

### Fleet Manager
```
Email: manager@fleet.com
Password: Manager@123
Expected: Can manage vehicles, drivers, trips
```

### Dispatcher
```
Email: dispatcher@fleet.com
Password: Dispatcher@123
Expected: Can assign and dispatch trips
```

### Safety Officer
```
Email: safety@fleet.com
Password: Safety@123
Expected: Can update driver status
```

### Financial Analyst
```
Email: analyst@fleet.com
Password: Analyst@123
Expected: Can view financial reports
```

---

## Common Issues & Fixes

### ❌ MySQL Connection Failed
```powershell
# Check MySQL service
Get-Service | findstr MySQL
# Start service if not running
Start-Service MySQL80
```

### ❌ Port 3000 Already in Use
```powershell
# Find process
netstat -ano | findstr :3000
# Kill it
taskkill /PID <number> /F
```

### ❌ Database Already Exists
```sql
-- Drop and recreate
DROP DATABASE fleet_db;
-- Then run database-setup.sql again
```

### ❌ Users Not Created
```powershell
# Make sure you're in backend directory
cd backend
# Verify init-rbac.js exists
ls init-rbac.js
# Run with environment variables
$Env:INIT_SUPER_ADMIN = 'true'
node init-rbac.js
```

### ❌ "npm: not found"
```powershell
# Verify Node.js installed
node --version
# Should show v14 or higher
```

---

## File Structure
```
odoo-hackathon/
├── backend/
│   ├── .env                      ← Create this
│   ├── database-setup.sql        ← Run in MySQL
│   ├── sample-data.sql           ← Optional
│   ├── init-rbac.js              ← Run with env vars
│   ├── LOCAL_SETUP_GUIDE.md      ← Full guide
│   ├── server.js
│   ├── config/
│   │   └── database.js           ← Uses .env
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── middleware/
│
├── frontend/
│   └── src/
│       └── pages/
│
└── README.md
```

---

## What Gets Created

### Database Tables (11 total)
- ✅ roles
- ✅ users
- ✅ vehicles
- ✅ drivers
- ✅ trips
- ✅ trip_assignments
- ✅ maintenance_logs
- ✅ fuel_logs
- ✅ expenses
- ✅ vehicle_status_history
- ✅ driver_status_history

### Roles (8 total)
- ✅ Admin
- ✅ Manager
- ✅ Driver
- ✅ Fleet Manager
- ✅ Dispatcher
- ✅ Safety Officer
- ✅ Financial Analyst
- ✅ Super Admin

### Test Users (5 total)
- ✅ superadmin@fleet.com (Super Admin)
- ✅ manager@fleet.com (Fleet Manager)
- ✅ dispatcher@fleet.com (Dispatcher)
- ✅ safety@fleet.com (Safety Officer)
- ✅ analyst@fleet.com (Financial Analyst)

### Sample Data (Optional)
- ✅ 8 Vehicles
- ✅ 8 Drivers
- ✅ 8 Trips
- ✅ 3 Trip Assignments
- ✅ 7 Maintenance Logs
- ✅ 6 Fuel Logs
- ✅ 6 Expenses

---

## Success Indicators

### ✅ Database Setup Complete When:
1. No errors in MySQL Workbench after running database-setup.sql
2. `SHOW TABLES;` returns 11 tables
3. `SELECT COUNT(*) FROM roles;` returns 8

### ✅ Backend Running When:
1. Terminal shows "Database connected successfully"
2. Terminal shows "Server running on http://localhost:3000"
3. `curl http://localhost:3000/api/` succeeds

### ✅ Frontend Running When:
1. Terminal shows "Local: http://localhost:5173" (or similar)
2. Browser shows login page at http://localhost:5173

### ✅ Login Works When:
1. Can login with superadmin@fleet.com / SuperAdmin@123
2. Can see dashboard with user info
3. Can navigate between pages

### ✅ RBAC Works When:
1. Super Admin sees "Users" menu
2. Other roles don't see "Users" menu
3. Logout and login as different role works

---

## Quick Verification Script

Run this to verify everything is set up:

```sql
USE fleet_db;

SELECT 'Table Count' AS check_name, COUNT(*) AS result FROM (
  SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'fleet_db'
) t
UNION ALL
SELECT 'Roles', COUNT(*) FROM roles
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Vehicles', COUNT(*) FROM vehicles
UNION ALL
SELECT 'Drivers', COUNT(*) FROM drivers;
```

Expected Results:
```
Table Count | 11
Roles       | 8
Users       | 5+ (depending on if you ran init-rbac.js)
Vehicles    | 8 (if you loaded sample data)
Drivers     | 8 (if you loaded sample data)
```

---

## Support Resources

- **Full Setup Guide:** LOCAL_SETUP_GUIDE.md
- **RBAC Documentation:** RBAC_SETUP.md
- **RBAC Testing Guide:** RBAC_API_TESTING.md
- **RBAC Quick Reference:** RBAC_QUICK_REFERENCE.md
- **Database Schema:** DATABAE.MD

---

**Status: ✅ Ready to Deploy Locally**

All files are prepared and documented. Follow the Quick Start checklist above to get running in ~5 minutes!
