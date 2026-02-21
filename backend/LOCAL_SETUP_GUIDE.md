# Local MySQL Database Setup Guide

## Overview
This guide explains how to set up the Fleet Lifecycle Management system database locally using MySQL Workbench.

---

## Step 1: Prerequisites

### Install MySQL Server
- Download MySQL Community Server: https://dev.mysql.com/downloads/mysql/
- Install with default settings
- Remember the root password you set during installation

### Install MySQL Workbench
- Download MySQL Workbench: https://dev.mysql.com/downloads/workbench/
- Install and connect to your local MySQL server

---

## Step 2: Create Database Structure

### Option A: Using MySQL Workbench GUI (Easiest)

1. **Open MySQL Workbench**
2. **Create a new connection to your local MySQL** (if not already done)
3. **Open the SQL Editor** (File → New Query Tab)
4. **Copy and paste the entire SQL script** from `database-setup.sql`
5. **Execute the script** (Ctrl+Shift+Enter or click the lightning bolt icon)

### Option B: Using Command Line

```bash
# Open MySQL command line
mysql -u root -p

# Enter your root password when prompted

# Run the setup script
source C:\path\to\backend\database-setup.sql

# Verify database created
SHOW DATABASES;
USE fleet_db;
SHOW TABLES;
```

---

## Step 3: Verify Database Created

In MySQL Workbench, run:

```sql
USE fleet_db;

-- View all tables
SHOW TABLES;

-- Check roles inserted
SELECT * FROM roles;

-- Expected output: 8 roles including 'Super Admin'
```

---

## Step 4: Load Sample Data (Optional)

To populate the database with sample vehicles, drivers, trips, etc.:

1. **Open `sample-data.sql`** in MySQL Workbench
2. **Execute the script**
3. **Verify data loaded:**

```sql
SELECT 'Vehicles:' AS table_name, COUNT(*) AS count FROM vehicles
UNION ALL
SELECT 'Drivers:', COUNT(*) FROM drivers
UNION ALL
SELECT 'Trips:', COUNT(*) FROM trips;
```

---

## Step 5: Configure Backend Connection

### Check/Create .env File

Navigate to `backend/` and create or update `.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=fleet_db

# JWT Configuration
JWT_SECRET=your_random_secret_key_here
JWT_EXPIRES_IN=7d

# Server Configuration
SERVER_PORT=3000
NODE_ENV=development
```

### File Location
```
odoo-hackathon/
├── backend/
│   └── .env  ← Create this file
└── frontend/
```

---

## Step 6: Create Test Users with Hashed Passwords

### Run the RBAC Initialization Script

```powershell
# Navigate to backend directory
cd backend

# Create Super Admin + all test users
$Env:INIT_SUPER_ADMIN = 'true'
$Env:INIT_TEST_USERS = 'true'
node init-rbac.js
```

**Expected Output:**
```
🔐 Fleet Management System - RBAC Initialization

Step 1: Checking Super Admin role...
ℹ️  Super Admin role already exists

Current Roles in Database:
────────────────────────────────────────────────────────────
ID | Role Name            | Description
────────────────────────────────────────────────────────────
1  | Admin                | Full access to all features
2  | Manager              | Can manage drivers, vehicles, and trips
...
8  | Super Admin          | Full system access and role management
────────────────────────────────────────────────────────────

✅ Created: superadmin@fleet.com (Super Admin)
   Password: SuperAdmin@123
✅ Created: manager@fleet.com (Fleet Manager)
   Password: Manager@123
✅ Created: dispatcher@fleet.com (Dispatcher)
   Password: Dispatcher@123
✅ Created: safety@fleet.com (Safety Officer)
   Password: Safety@123
✅ Created: analyst@fleet.com (Financial Analyst)
   Password: Analyst@123

✅ RBAC Initialization Complete!
```

### Created Test Users

| Email | Password | Role |
|-------|----------|------|
| superadmin@fleet.com | SuperAdmin@123 | Super Admin |
| manager@fleet.com | Manager@123 | Fleet Manager |
| dispatcher@fleet.com | Dispatcher@123 | Dispatcher |
| safety@fleet.com | Safety@123 | Safety Officer |
| analyst@fleet.com | Analyst@123 | Financial Analyst |

---

## Step 7: Start Backend Server

```powershell
# Navigate to backend directory
cd backend

# Install dependencies (if not already done)
npm install

# Start the server
npm start
```

**Expected Output:**
```
Server running on http://localhost:3000
Database connected successfully
RBAC system initialized
```

---

## Step 8: Test Login

### Test Super Admin Login

```powershell
$body = @{
    email = "superadmin@fleet.com"
    password = "SuperAdmin@123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body $body

$response | ConvertTo-Json

# Save the token
$TOKEN = $response.token
Write-Host "Token saved: $TOKEN"
```

### Test Other User Login

```powershell
# Login as Fleet Manager
$body = @{
    email = "manager@fleet.com"
    password = "Manager@123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body $body | ConvertTo-Json
```

---

## Step 9: Start Frontend

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173` (or next available port)

---

## Step 10: Test the Application

### 1. Login Page
- Navigate to: `http://localhost:5173`
- Login with: `superadmin@fleet.com` / `SuperAdmin@123`
- Verify: Dashboard displays with user info

### 2. User Management (Super Admin Only)
- Click "Users" in navigation
- View all users
- Create new user (test form)
- Update user role
- Deactivate/Activate user

### 3. Try Different Roles
- Logout and login as: `manager@fleet.com` / `Manager@123`
- Verify: User Management menu is hidden (only Super Admin sees it)
- Verify: Can see vehicles but cannot access Users page

---

## Troubleshooting

### Problem: "Connection refused" on Database

**Solution:**
1. Verify MySQL is running:
```powershell
# Check if MySQL service is running
Get-Service | Where-Object {$_.Name -like "*MySQL*"}

# If not running, start it
Start-Service MySQL80  # or whichever version you have
```

2. Verify credentials in `.env` match your MySQL setup

3. Test connection:
```powershell
mysql -u root -p
# Should prompt for password and connect
```

### Problem: "Unknown database 'fleet_db'"

**Solution:**
1. Ensure `database-setup.sql` was executed completely
2. Run verification query:
```sql
SHOW DATABASES;  -- Should list 'fleet_db'
```

### Problem: "Access denied for user 'root'@'localhost'"

**Solution:**
- Check password in `.env` matches MySQL root password
- Reset MySQL root password if forgotten:
```bash
mysql -u root --skip-password
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

### Problem: Port 3000 already in use

**Solution:**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or use different port in .env
SERVER_PORT=3001
```

### Problem: "init-rbac.js not found"

**Solution:**
- Ensure you're in the `backend/` directory
- File should be at: `backend/init-rbac.js`
- Run: `ls init-rbac.js` to verify

---

## Database Management

### View Current Database State

```sql
USE fleet_db;

-- Count records
SELECT 'Users' AS table_name, COUNT(*) AS count FROM users
UNION ALL
SELECT 'Vehicles', COUNT(*) FROM vehicles
UNION ALL
SELECT 'Drivers', COUNT(*) FROM drivers
UNION ALL
SELECT 'Trips', COUNT(*) FROM trips
UNION ALL
SELECT 'Roles', COUNT(*) FROM roles;

-- View all users with roles
SELECT u.id, u.full_name, u.email, r.name as role, u.is_active
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
ORDER BY u.created_at DESC;

-- View all vehicles
SELECT * FROM vehicles;

-- View all drivers
SELECT * FROM drivers;
```

### Backup Database

```powershell
# Backup to file
mysqldump -u root -p fleet_db > C:\backups\fleet_db_backup.sql

# This creates a backup file you can restore later if needed
```

### Restore from Backup

```powershell
# Restore from backup file
mysql -u root -p fleet_db < C:\backups\fleet_db_backup.sql
```

---

## Database Architecture

```
fleet_db/
├── roles (8 rows)
│   ├── Admin
│   ├── Manager
│   ├── Driver
│   ├── Fleet Manager
│   ├── Dispatcher
│   ├── Safety Officer
│   ├── Financial Analyst
│   └── Super Admin
│
├── users (FK: role_id)
│   - Stores user credentials & role assignments
│
├── vehicles
│   ├── Tracks fleet assets
│   ├── Status: Available, On Trip, In Shop, Out of Service
│   └── Relationships: maintenance_logs, fuel_logs, expenses, trip_assignments
│
├── drivers
│   ├── Personnel management
│   ├── Status: Available, On Trip, Off Duty, Suspended
│   └── Relationships: trip_assignments, driver_status_history
│
├── trips
│   ├── Delivery workflows
│   ├── Status: Draft, Dispatched, Completed, Cancelled
│   └── Relationships: trip_assignments, fuel_logs, expenses
│
├── trip_assignments
│   └── Maps vehicle + driver to trip
│
├── maintenance_logs
│   └── Service history for each vehicle
│
├── fuel_logs
│   └── Fuel consumption tracking
│
├── expenses
│   └── Operational expense tracking
│
├── vehicle_status_history
│   └── Audit trail for vehicle status changes
│
└── driver_status_history
    └── Audit trail for driver status changes
```

---

## Quick Commands Reference

```powershell
# Start MySQL service
Start-Service MySQL80

# Stop MySQL service
Stop-Service MySQL80

# Connect to MySQL
mysql -u root -p

# List all databases
SHOW DATABASES;

# Use fleet database
USE fleet_db;

# Show all tables
SHOW TABLES;

# Show table structure
DESCRIBE users;
DESCRIBE vehicles;
DESCRIBE drivers;

# Count records
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM vehicles;
```

---

## Summary

✅ **Database Setup Complete!**

You now have:
- ✅ Local MySQL database configured
- ✅ All tables created with proper relationships
- ✅ Roles defined (8 total)
- ✅ Test users created with bcrypt-hashed passwords
- ✅ Sample data for testing (optional)
- ✅ RBAC system fully functional
- ✅ Backend API accessible at `http://localhost:3000`

**Next Steps:**
1. Start backend: `npm start` (in `backend/` directory)
2. Start frontend: `npm run dev` (in `frontend/` directory)
3. Login with test users
4. Test RBAC functionality across different roles

---

**For Help or Issues:** Refer to Troubleshooting section above or check log files in backend output.
