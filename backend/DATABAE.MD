Perfect ✅
You want to give **GitHub Copilot full database awareness**, so it understands:

* Table relationships
* Business rules
* State transitions
* Financial calculations
* Validation logic

Below is a **clean, structured Database Schema Overview** you can paste at the top of your project (README or `/docs/database.md`) so Copilot understands the entire system.

---

# 🚛 Fleet Lifecycle Management System

## 🗄️ Complete Database Schema Overview (For Backend Implementation)

---

# 🎯 System Purpose

This is a **rule-driven fleet management system** that manages:

* Vehicles (assets)
* Drivers (human resources)
* Trips (delivery lifecycle)
* Maintenance logs
* Fuel logs
* Operational expenses
* Financial analytics
* Status tracking with audit history

The system is state-machine based and enforces strict validation rules.

---

# 🏗️ Database Architecture

## 1️⃣ roles

Defines user roles for RBAC.

| Column      | Type    | Description                                  |
| ----------- | ------- | -------------------------------------------- |
| id          | INT PK  | Role ID                                      |
| name        | VARCHAR | Manager, Dispatcher, Safety Officer, Analyst |
| description | TEXT    | Role description                             |

Relationship:

* One role → many users

---

## 2️⃣ users

Application users with role-based access.

| Column        | Type          |
| ------------- | ------------- |
| id            | INT PK        |
| role_id       | FK → roles.id |
| full_name     | VARCHAR       |
| email         | UNIQUE        |
| password_hash | VARCHAR       |
| is_active     | BOOLEAN       |

Business Rule:

* All endpoints must validate user role before action.

---

## 3️⃣ vehicles

Core fleet asset table.

| Column           | Type                                              |
| ---------------- | ------------------------------------------------- |
| id               | PK                                                |
| vehicle_code     | UNIQUE                                            |
| license_plate    | UNIQUE                                            |
| model            | VARCHAR                                           |
| max_capacity_kg  | DECIMAL                                           |
| acquisition_cost | DECIMAL                                           |
| odometer_km      | DECIMAL                                           |
| vehicle_type     | ENUM(Truck, Van, Bike)                            |
| region           | VARCHAR                                           |
| status           | ENUM(Available, On Trip, In Shop, Out of Service) |

Business Logic:

* Only Available vehicles can be dispatched.
* In Shop vehicles are hidden from dispatcher.
* Out of Service vehicles are permanently disabled.

---

## 4️⃣ drivers

Driver compliance & performance table.

| Column           | Type                                          |
| ---------------- | --------------------------------------------- |
| id               | PK                                            |
| full_name        | VARCHAR                                       |
| license_number   | UNIQUE                                        |
| license_category | VARCHAR                                       |
| license_expiry   | DATE                                          |
| safety_score     | DECIMAL                                       |
| status           | ENUM(Available, On Trip, Off Duty, Suspended) |

Critical Validation:

* Driver cannot be assigned if:

  * status != 'Available'
  * license_expiry < CURRENT_DATE
  * status = 'Suspended'

---

## 5️⃣ trips

Represents delivery workflow.

| Column          | Type                                          |
| --------------- | --------------------------------------------- |
| id              | PK                                            |
| trip_code       | UNIQUE                                        |
| origin          | VARCHAR                                       |
| destination     | VARCHAR                                       |
| cargo_weight_kg | DECIMAL                                       |
| revenue         | DECIMAL                                       |
| status          | ENUM(Draft, Dispatched, Completed, Cancelled) |
| start_time      | DATETIME                                      |
| end_time        | DATETIME                                      |

Trip Lifecycle:
Draft → Dispatched → Completed
Draft → Cancelled

On Dispatch:

* Vehicle.status → On Trip
* Driver.status → On Trip

On Completion:

* Vehicle.status → Available
* Driver.status → Available

---

## 6️⃣ trip_assignments

Maps vehicle + driver to a trip.

| Column     | Type |
| ---------- | ---- |
| id         | PK   |
| trip_id    | FK   |
| vehicle_id | FK   |
| driver_id  | FK   |

Validation Rules:

1. cargo_weight <= vehicle.max_capacity_kg
2. vehicle.status = 'Available'
3. driver.status = 'Available'
4. license_expiry >= CURRENT_DATE
5. Wrap dispatch in DB transaction

---

## 7️⃣ maintenance_logs

Tracks service events.

| Column       | Type    |
| ------------ | ------- |
| id           | PK      |
| vehicle_id   | FK      |
| service_type | VARCHAR |
| cost         | DECIMAL |
| service_date | DATE    |

Logic:

* Adding maintenance log automatically sets vehicle.status = 'In Shop'
* Status change must be recorded in vehicle_status_history

---

## 8️⃣ fuel_logs

Tracks fuel usage.

| Column           | Type          |
| ---------------- | ------------- |
| id               | PK            |
| vehicle_id       | FK            |
| trip_id          | FK (optional) |
| liters           | DECIMAL       |
| cost             | DECIMAL       |
| odometer_reading | DECIMAL       |
| fuel_date        | DATE          |

Used for:
Fuel Efficiency Calculation:
(distance_km / liters)

---

## 9️⃣ expenses

General operational expenses.

| Column       | Type    |
| ------------ | ------- |
| id           | PK      |
| vehicle_id   | FK      |
| trip_id      | FK      |
| expense_type | VARCHAR |
| amount       | DECIMAL |
| expense_date | DATE    |

---

## 🔟 vehicle_status_history

Audit table for vehicle state changes.

| Column     | Type      |
| ---------- | --------- |
| id         | PK        |
| vehicle_id | FK        |
| old_status | VARCHAR   |
| new_status | VARCHAR   |
| changed_at | TIMESTAMP |

Every vehicle status change MUST create a history record.

---

## 1️⃣1️⃣ driver_status_history

Audit table for driver state changes.

| Column     | Type      |
| ---------- | --------- |
| id         | PK        |
| driver_id  | FK        |
| old_status | VARCHAR   |
| new_status | VARCHAR   |
| changed_at | TIMESTAMP |

---

# 🔄 State Machine Logic

## 🚗 Vehicle State Transitions

Available → On Trip
Available → In Shop
In Shop → Available
Available → Out of Service

Invalid transitions must throw error.

---

## 👨‍✈️ Driver State Transitions

Available → On Trip
On Trip → Available
Available → Suspended
Suspended → Available

---

# 💰 Financial Computations

## Operational Cost per Vehicle

SUM(
maintenance_logs.cost +
fuel_logs.cost +
expenses.amount
)

---

## Fuel Efficiency

(total distance driven) / (total liters)

---

## Vehicle ROI

(revenue - total operational cost) / acquisition_cost

---

# ⚠️ Critical Backend Rules

* Never trust frontend validation
* Use transactions during dispatch
* Prevent double booking
* Always update status history
* Validate cargo weight
* Validate driver license expiry
* Enforce RBAC on routes

---

# 🧠 Architectural Pattern

This database supports:

* Relational integrity
* State-machine enforcement
* Audit tracking
* Financial aggregation
* Role-based access control
* Production scalability

---

# 📦 Expected Backend Modules

* Auth & RBAC
* Vehicle Service Layer
* Driver Service Layer
* Dispatch Engine
* Maintenance Service
* Expense & Fuel Service
* Analytics Engine

---
```js
/**
 * This is a rule-driven fleet lifecycle system.
 * Every entity status change must be auditable.
 * Invalid state transitions must be blocked.
 * All dispatch operations must use database transactions.
 */
```
