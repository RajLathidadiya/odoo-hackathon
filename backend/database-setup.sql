-- ===============================================
-- Fleet Lifecycle Management System - Database Setup
-- ===============================================
-- Run this script in MySQL Workbench to set up the complete database

-- Step 1: Create Database
-- ===============================================
DROP DATABASE IF EXISTS fleet_db;
CREATE DATABASE IF NOT EXISTS fleet_db;
USE fleet_db;

-- ===============================================
-- Step 2: Create Tables
-- ===============================================

-- 1. Roles Table
-- ===============================================
CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Users Table
-- ===============================================
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Vehicles Table
-- ===============================================
CREATE TABLE vehicles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vehicle_code VARCHAR(50) NOT NULL UNIQUE,
  license_plate VARCHAR(50) NOT NULL UNIQUE,
  model VARCHAR(100) NOT NULL,
  max_capacity_kg DECIMAL(10, 2) NOT NULL,
  acquisition_cost DECIMAL(12, 2),
  odometer_km DECIMAL(10, 2) DEFAULT 0,
  vehicle_type ENUM('Truck', 'Van', 'Bike') NOT NULL,
  region VARCHAR(100),
  status ENUM('Available', 'On Trip', 'In Shop', 'Out of Service') DEFAULT 'Available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_vehicle_code (vehicle_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Drivers Table
-- ===============================================
CREATE TABLE drivers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  license_number VARCHAR(50) NOT NULL UNIQUE,
  license_category VARCHAR(50),
  license_expiry DATE,
  safety_score DECIMAL(3, 2) DEFAULT 0,
  status ENUM('Available', 'On Trip', 'Off Duty', 'Suspended') DEFAULT 'Available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_license_expiry (license_expiry)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Trips Table
-- ===============================================
CREATE TABLE trips (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trip_code VARCHAR(50) NOT NULL UNIQUE,
  origin VARCHAR(200) NOT NULL,
  destination VARCHAR(200) NOT NULL,
  cargo_weight_kg DECIMAL(10, 2) NOT NULL,
  revenue DECIMAL(12, 2) NOT NULL,
  status ENUM('Draft', 'Dispatched', 'Completed', 'Cancelled') DEFAULT 'Draft',
  start_time DATETIME,
  end_time DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_trip_code (trip_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Trip Assignments Table
-- ===============================================
CREATE TABLE trip_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trip_id INT NOT NULL,
  vehicle_id INT NOT NULL,
  driver_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE RESTRICT,
  UNIQUE KEY unique_trip_assignment (trip_id, vehicle_id, driver_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Maintenance Logs Table
-- ===============================================
CREATE TABLE maintenance_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vehicle_id INT NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  service_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  INDEX idx_vehicle_id (vehicle_id),
  INDEX idx_service_date (service_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Fuel Logs Table
-- ===============================================
CREATE TABLE fuel_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vehicle_id INT NOT NULL,
  trip_id INT,
  liters DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  odometer_reading DECIMAL(10, 2),
  fuel_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL,
  INDEX idx_vehicle_id (vehicle_id),
  INDEX idx_fuel_date (fuel_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Expenses Table
-- ===============================================
CREATE TABLE expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vehicle_id INT NOT NULL,
  trip_id INT,
  expense_type VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL,
  INDEX idx_vehicle_id (vehicle_id),
  INDEX idx_expense_date (expense_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Vehicle Status History Table
-- ===============================================
CREATE TABLE vehicle_status_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vehicle_id INT NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  INDEX idx_vehicle_id (vehicle_id),
  INDEX idx_changed_at (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Driver Status History Table
-- ===============================================
CREATE TABLE driver_status_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  driver_id INT NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
  INDEX idx_driver_id (driver_id),
  INDEX idx_changed_at (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- Step 3: Insert Roles
-- ===============================================
INSERT INTO roles (name, description) VALUES
('Admin', 'Full access to all features'),
('Manager', 'Can manage drivers, vehicles, and trips'),
('Driver', 'Can view and update assigned trips'),
('Fleet Manager', 'Oversees vehicle health, lifecycle, and scheduling'),
('Dispatcher', 'Creates trips and assigns drivers'),
('Safety Officer', 'Monitors compliance and license validity'),
('Financial Analyst', 'Audits fuel, maintenance and ROI'),
('Super Admin', 'Full system access and role management');

-- ===============================================
-- Step 4: Verify Tables Created
-- ===============================================
-- Run these to verify all tables are created correctly:
SELECT 'Database Setup Complete!' AS status;
SHOW TABLES;
DESCRIBE roles;
