# Backend API Testing - cURL Documentation

## Base URL
```
http://localhost:3000/api
```

## Note
- Replace `{TOKEN}` with the actual JWT token received from login
- Replace `{ID}` with actual resource IDs
- Replace `{vehicleId}` with actual vehicle IDs
- All protected endpoints require the `Authorization: Bearer {TOKEN}` header

---

## 1. AUTH ENDPOINTS

### 1.1 Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "role_id": 2
  }'
```

### 1.2 Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 1.3 Refresh Token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "{REFRESH_TOKEN}"
  }'
```

### 1.4 Get Current User Info
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer {TOKEN}"
```

---

## 2. ROLES ENDPOINTS

### 2.1 Get All Roles
```bash
curl -X GET http://localhost:3000/api/roles \
  -H "Authorization: Bearer {TOKEN}"
```

### 2.2 Get Role by ID
```bash
curl -X GET http://localhost:3000/api/roles/1 \
  -H "Authorization: Bearer {TOKEN}"
```

### 2.3 Create Role (Admin Only)
```bash
curl -X POST http://localhost:3000/api/roles \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "role_name": "SuperAdmin",
    "description": "Super Administrator role"
  }'
```

### 2.4 Update Role (Admin Only)
```bash
curl -X PUT http://localhost:3000/api/roles/1 \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "role_name": "Administrator",
    "description": "System Administrator"
  }'
```

### 2.5 Delete Role (Admin Only)
```bash
curl -X DELETE http://localhost:3000/api/roles/1 \
  -H "Authorization: Bearer {TOKEN}"
```

---

## 3. VEHICLES ENDPOINTS

### 3.1 Get All Vehicles
```bash
curl -X GET http://localhost:3000/api/vehicles \
  -H "Authorization: Bearer {TOKEN}"
```

### 3.2 Get Vehicle by ID
```bash
curl -X GET http://localhost:3000/api/vehicles/1 \
  -H "Authorization: Bearer {TOKEN}"
```

### 3.3 Create Vehicle
```bash
curl -X POST http://localhost:3000/api/vehicles \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_code": "VH001",
    "license_plate": "ABC-1234",
    "model": "Toyota Hiace",
    "max_capacity_kg": 2000,
    "acquisition_cost": 500000,
    "odometer_km": 0,
    "vehicle_type": "Van",
    "region": "North"
  }'
```

### 3.4 Update Vehicle
```bash
curl -X PUT http://localhost:3000/api/vehicles/1 \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "license_plate": "XYZ-5678",
    "odometer_km": 5000
  }'
```

### 3.5 Update Vehicle Status
```bash
curl -X PATCH http://localhost:3000/api/vehicles/1/status \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Available"
  }'
```

### 3.6 Delete Vehicle
```bash
curl -X DELETE http://localhost:3000/api/vehicles/1 \
  -H "Authorization: Bearer {TOKEN}"
```

---

## 4. DRIVERS ENDPOINTS

### 4.1 Get All Drivers
```bash
curl -X GET http://localhost:3000/api/drivers \
  -H "Authorization: Bearer {TOKEN}"
```

### 4.2 Get Driver by ID
```bash
curl -X GET http://localhost:3000/api/drivers/1 \
  -H "Authorization: Bearer {TOKEN}"
```

### 4.3 Create Driver
```bash
curl -X POST http://localhost:3000/api/drivers \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "license_number": "DL123456",
    "phone": "555-1234",
    "email": "john@example.com",
    "license_expiry": "2025-12-31",
    "region": "North"
  }'
```

### 4.4 Update Driver
```bash
curl -X PUT http://localhost:3000/api/drivers/1 \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "555-5678",
    "email": "john.doe@example.com"
  }'
```

### 4.5 Update Driver Status
```bash
curl -X PATCH http://localhost:3000/api/drivers/1/status \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Active"
  }'
```

### 4.6 Delete Driver
```bash
curl -X DELETE http://localhost:3000/api/drivers/1 \
  -H "Authorization: Bearer {TOKEN}"
```

---

## 5. TRIPS ENDPOINTS

### 5.1 Get All Trips
```bash
curl -X GET http://localhost:3000/api/trips \
  -H "Authorization: Bearer {TOKEN}"
```

### 5.2 Get Trip by ID
```bash
curl -X GET http://localhost:3000/api/trips/1 \
  -H "Authorization: Bearer {TOKEN}"
```

### 5.3 Create Trip
```bash
curl -X POST http://localhost:3000/api/trips \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "Warehouse A",
    "destination": "Store B",
    "trip_date": "2026-02-21",
    "status": "Pending",
    "cargo_kg": 500
  }'
```

### 5.4 Update Trip
```bash
curl -X PUT http://localhost:3000/api/trips/1 \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "cargo_kg": 600,
    "destination": "Store C"
  }'
```

### 5.5 Update Trip Status
```bash
curl -X PATCH http://localhost:3000/api/trips/1/status \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "In Progress"
  }'
```

### 5.6 Delete Trip
```bash
curl -X DELETE http://localhost:3000/api/trips/1 \
  -H "Authorization: Bearer {TOKEN}"
```

---

## 6. DISPATCH ENDPOINTS

### 6.1 Assign Trip to Driver/Vehicle
```bash
curl -X POST http://localhost:3000/api/dispatch/assign \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "trip_id": 1,
    "driver_id": 1,
    "vehicle_id": 1
  }'
```

### 6.2 Complete Dispatch
```bash
curl -X POST http://localhost:3000/api/dispatch/complete \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "trip_assignment_id": 1,
    "completion_time": "2026-02-21 14:30:00"
  }'
```

### 6.3 Cancel Dispatch
```bash
curl -X POST http://localhost:3000/api/dispatch/cancel \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "trip_assignment_id": 1,
    "cancellation_reason": "Vehicle breakdown"
  }'
```

---

## 7. MAINTENANCE ENDPOINTS

### 7.1 Get All Maintenance Records
```bash
curl -X GET http://localhost:3000/api/maintenance \
  -H "Authorization: Bearer {TOKEN}"
```

### 7.2 Get Maintenance by Vehicle ID
```bash
curl -X GET http://localhost:3000/api/maintenance/1 \
  -H "Authorization: Bearer {TOKEN}"
```

### 7.3 Create Maintenance Record
```bash
curl -X POST http://localhost:3000/api/maintenance \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id": 1,
    "description": "Oil change and filter replacement",
    "cost": 350,
    "maintenance_date": "2026-02-21",
    "maintenance_type": "Routine"
  }'
```

---

## 8. FUEL ENDPOINTS

### 8.1 Get All Fuel Logs
```bash
curl -X GET http://localhost:3000/api/fuel \
  -H "Authorization: Bearer {TOKEN}"
```

### 8.2 Get Fuel Logs by Vehicle ID
```bash
curl -X GET http://localhost:3000/api/fuel/1 \
  -H "Authorization: Bearer {TOKEN}"
```

### 8.3 Create Fuel Log
```bash
curl -X POST http://localhost:3000/api/fuel \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id": 1,
    "trip_id": 1,
    "liters": 50,
    "cost": 3500,
    "odometer_reading": 12500,
    "fuel_date": "2026-02-21"
  }'
```

---

## 9. EXPENSES ENDPOINTS

### 9.1 Get All Expenses
```bash
curl -X GET http://localhost:3000/api/expenses \
  -H "Authorization: Bearer {TOKEN}"
```

### 9.2 Get Expenses by Vehicle ID
```bash
curl -X GET http://localhost:3000/api/expenses/1 \
  -H "Authorization: Bearer {TOKEN}"
```

### 9.3 Create Expense
```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id": 1,
    "trip_id": 1,
    "amount": 2500,
    "expense_date": "2026-02-21",
    "expense_type": "Maintenance"
  }'
```

---

## 10. ANALYTICS ENDPOINTS

### 10.1 Get Dashboard Analytics
```bash
curl -X GET http://localhost:3000/api/analytics/dashboard \
  -H "Authorization: Bearer {TOKEN}"
```

### 10.2 Get Financial Summary
```bash
curl -X GET http://localhost:3000/api/analytics/financial-summary \
  -H "Authorization: Bearer {TOKEN}"
```

### 10.3 Get Fuel Efficiency Analytics
```bash
curl -X GET http://localhost:3000/api/analytics/fuel-efficiency \
  -H "Authorization: Bearer {TOKEN}"
```

### 10.4 Get Vehicle-Specific Analytics
```bash
curl -X GET http://localhost:3000/api/analytics/vehicle/1 \
  -H "Authorization: Bearer {TOKEN}"
```

---

## 11. HEALTH CHECK

### 11.1 Health Check Endpoint
```bash
curl -X GET http://localhost:3000/health
```

Expected Response:
```json
{
  "status": "Server is running"
}
```

---

## TESTING WORKFLOW

1. **Start Server**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Register a User**
   - Use endpoint 1.1 to create a new user

3. **Login**
   - Use endpoint 1.2 to get JWT token
   - Save the token for subsequent requests

4. **Test Protected Endpoints**
   - Use the token in Authorization header for all subsequent requests

5. **Test Business Logic**
   - Create vehicles, drivers, trips
   - Assign trips with dispatch endpoint
   - Create fuel logs and maintenance records
   - Check analytics

---

## COMMON ERROR RESPONSES

### 400 Bad Request
```json
{
  "message": "Validation error",
  "details": [...]
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid token"
}
```

### 403 Forbidden
```json
{
  "message": "Unauthorized: User does not have permission"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Database error"
}
```

---

## TIPS FOR TESTING

1. Use `-v` flag for verbose output:
   ```bash
   curl -v -X GET http://localhost:3000/api/roles \
     -H "Authorization: Bearer {TOKEN}"
   ```

2. Save response to file:
   ```bash
   curl -X GET http://localhost:3000/api/vehicles \
     -H "Authorization: Bearer {TOKEN}" > response.json
   ```

3. Test with pretty JSON output (requires jq):
   ```bash
   curl -X GET http://localhost:3000/api/vehicles \
     -H "Authorization: Bearer {TOKEN}" | jq
   ```

4. Post data from file:
   ```bash
   curl -X POST http://localhost:3000/api/vehicles \
     -H "Authorization: Bearer {TOKEN}" \
     -H "Content-Type: application/json" \
     -d @vehicle.json
   ```
