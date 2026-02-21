-- ===============================================
-- Sample Data for Testing (OPTIONAL)
-- ===============================================
-- NOTE: Run database-setup.sql FIRST before running this

USE fleet_db;

-- ===============================================
-- Sample Vehicles
-- ===============================================
INSERT INTO vehicles (vehicle_code, license_plate, model, max_capacity_kg, acquisition_cost, vehicle_type, region, status)
VALUES
('VH001', 'ABC-1234', 'Volvo FH16', 25000.00, 50000.00, 'Truck', 'North', 'Available'),
('VH002', 'XYZ-5678', 'MAN TGX', 20000.00, 45000.00, 'Truck', 'South', 'Available'),
('VH003', 'DEF-9012', 'Ford Transit', 3500.00, 25000.00, 'Van', 'East', 'Available'),
('VH004', 'GHI-3456', 'Maruti Eeco', 1500.00, 8000.00, 'Van', 'West', 'Available'),
('VH005', 'JKL-7890', 'Royal Enfield', 200.00, 1500.00, 'Bike', 'North', 'Available'),
('VH006', 'MNO-2345', 'Hino 500', 15000.00, 40000.00, 'Truck', 'South', 'In Shop'),
('VH007', 'PQR-6789', 'TATA 407', 5000.00, 15000.00, 'Truck', 'East', 'Available'),
('VH008', 'STU-0123', 'Ashok Leyland', 10000.00, 30000.00, 'Truck', 'West', 'Out of Service');

-- ===============================================
-- Sample Drivers
-- ===============================================
INSERT INTO drivers (full_name, license_number, license_category, license_expiry, safety_score, status)
VALUES
('Rajesh Kumar', 'DL-001-2020', 'HCV', '2026-12-31', 4.8, 'Available'),
('Priya Singh', 'DL-002-2020', 'HCV', '2026-06-15', 4.5, 'Available'),
('Mohammad Ahmed', 'DL-003-2021', 'HCV', '2027-03-20', 4.2, 'Available'),
('Amit Patel', 'DL-004-2019', 'HCV', '2025-11-10', 3.9, 'Suspended'),
('Sophia Desai', 'DL-005-2022', 'LMV', '2027-08-25', 4.7, 'Available'),
('Vikram Reddy', 'DL-006-2020', 'HCV', '2026-02-28', 4.1, 'On Trip'),
('Neha Sharma', 'DL-007-2021', 'HCV', '2027-05-12', 4.6, 'Available'),
('Arun Mishra', 'DL-008-2018', 'HCV', '2024-12-31', 2.0, 'Off Duty');

-- ===============================================
-- Sample Trips
-- ===============================================
INSERT INTO trips (trip_code, origin, destination, cargo_weight_kg, revenue, status)
VALUES
('TRIP001', 'Mumbai', 'Delhi', 20000.00, 50000.00, 'Draft'),
('TRIP002', 'Bangalore', 'Chennai', 15000.00, 35000.00, 'Draft'),
('TRIP003', 'Delhi', 'Kolkata', 18000.00, 45000.00, 'Dispatched'),
('TRIP004', 'Mumbai', 'Pune', 5000.00, 12000.00, 'Completed'),
('TRIP005', 'Hyderabad', 'Bangalore', 12000.00, 30000.00, 'Draft'),
('TRIP006', 'Chennai', 'Coimbatore', 8000.00, 20000.00, 'Cancelled'),
('TRIP007', 'Jaipur', 'Lucknow', 16000.00, 38000.00, 'Draft'),
('TRIP008', 'Ahmedabad', 'Vadodara', 3000.00, 8000.00, 'Draft');

-- ===============================================
-- Sample Trip Assignments
-- ===============================================
INSERT INTO trip_assignments (trip_id, vehicle_id, driver_id)
VALUES
(3, 1, 1),
(4, 3, 2),
(6, 2, 6);

-- ===============================================
-- Sample Maintenance Logs
-- ===============================================
INSERT INTO maintenance_logs (vehicle_id, service_type, cost, service_date)
VALUES
(1, 'Oil Change', 5000.00, '2024-02-15'),
(1, 'Tire Replacement', 15000.00, '2024-01-20'),
(2, 'Battery Replacement', 8000.00, '2024-02-10'),
(3, 'Regular Checkup', 3000.00, '2024-02-18'),
(4, 'Brake Pads', 2000.00, '2024-02-12'),
(6, 'Engine Service', 25000.00, '2024-02-20'),
(7, 'Transmission Fluid', 4000.00, '2024-02-05');

-- ===============================================
-- Sample Fuel Logs
-- ===============================================
INSERT INTO fuel_logs (vehicle_id, trip_id, liters, cost, odometer_reading, fuel_date)
VALUES
(1, 3, 80.00, 8000.00, 45000.00, '2024-02-19'),
(2, 4, 40.00, 4000.00, 28500.00, '2024-02-18'),
(3, NULL, 25.00, 2500.00, 12000.00, '2024-02-17'),
(1, NULL, 100.00, 10000.00, 46200.00, '2024-02-20'),
(5, NULL, 10.00, 1000.00, 5000.00, '2024-02-16'),
(7, NULL, 60.00, 6000.00, 32000.00, '2024-02-19');

-- ===============================================
-- Sample Expenses
-- ===============================================
INSERT INTO expenses (vehicle_id, trip_id, expense_type, amount, expense_date)
VALUES
(1, 3, Toll', 500.00, '2024-02-19'),
(1, 3, 'Food & Stay', 1500.00, '2024-02-19'),
(2, 4, 'Parking', 200.00, '2024-02-18'),
(3, NULL, 'Insurance', 5000.00, '2024-02-15'),
(4, NULL, 'Documentation', 1000.00, '2024-02-20'),
(7, NULL, 'Repair', 3000.00, '2024-02-17');

-- ===============================================
-- Verification Queries
-- ===============================================
-- Verify all data inserted correctly:

SELECT 'Vehicles Count:' AS info, COUNT(*) AS count FROM vehicles
UNION ALL
SELECT 'Drivers Count:', COUNT(*) FROM drivers
UNION ALL
SELECT 'Trips Count:', COUNT(*) FROM trips
UNION ALL
SELECT 'Trip Assignments:', COUNT(*) FROM trip_assignments
UNION ALL
SELECT 'Maintenance Logs:', COUNT(*) FROM maintenance_logs
UNION ALL
SELECT 'Fuel Logs:', COUNT(*) FROM fuel_logs
UNION ALL
SELECT 'Expenses:', COUNT(*) FROM expenses;

-- View sample data
SHOW TABLES;
