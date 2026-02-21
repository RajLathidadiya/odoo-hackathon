# 🚛 FleetFlow

## Modular Fleet & Logistics Management System

FleetFlow is a centralized, rule-based fleet management system built to replace inefficient manual logbooks with a scalable digital platform. It helps organizations manage vehicle lifecycle, monitor driver compliance, track operational costs, and generate data-driven insights.

> Built using **React (Frontend)** and **Node.js + Express (Backend)**.

---

## 🎯 Objective

To optimize delivery fleet operations by:

* Managing vehicle availability & lifecycle
* Monitoring driver safety & license compliance
* Automating dispatch validation rules
* Tracking fuel & maintenance expenses
* Generating operational analytics & ROI reports

---

## 🛠 Tech Stack

### Frontend

* React
* Modular component architecture
* Role-based UI rendering
* Dynamic data tables with filters

### Backend

* Node.js
* Express.js
* RESTful API architecture
* Business logic validation layer

### Database

* Relational database
* Structured linking between:

  * Vehicles
  * Drivers
  * Trips
  * Maintenance Logs
  * Fuel & Expense Records

---

## 👥 Target Users

* **Fleet Managers** – Vehicle health, lifecycle, scheduling
* **Dispatchers** – Trip creation & driver assignment
* **Safety Officers** – License tracking & safety monitoring
* **Financial Analysts** – Fuel spend, ROI, operational cost tracking

---

## 🖥 Core Modules

### 1️⃣ Authentication & RBAC

* Secure login system
* Role-Based Access Control
* Protected routes

---

### 2️⃣ Command Center Dashboard

Provides high-level KPIs:

* Active Fleet (On Trip)
* Maintenance Alerts (In Shop)
* Fleet Utilization Rate
* Pending Cargo
* Filters by vehicle type, region, and status

---

### 3️⃣ Vehicle Registry (Asset Management)

* Add / Edit / Delete vehicles
* License Plate as unique identifier
* Max Load Capacity validation
* Odometer tracking
* Manual “Out of Service” toggle

---

### 4️⃣ Trip Dispatcher

* Create trips by assigning:

  * Available vehicle
  * Available driver
* Validation Rule:

  * Prevent trip if `CargoWeight > MaxCapacity`
* Trip Lifecycle:

  * Draft → Dispatched → Completed → Cancelled
* Auto status updates for vehicle & driver

---

### 5️⃣ Maintenance & Service Logs

* Log maintenance entries
* Automatic status change to "In Shop"
* Removes vehicle from dispatch pool

---

### 6️⃣ Fuel & Expense Logging

* Record fuel liters & cost
* Track maintenance expenses
* Automatic calculation:

```
Total Operational Cost = Fuel + Maintenance
```

---

### 7️⃣ Driver Performance & Safety

* License expiry validation (blocks assignment if expired)
* Safety score tracking
* Trip completion metrics
* Status toggle:

  * On Duty
  * Off Duty
  * Suspended

---

### 8️⃣ Operational Analytics

* Fuel Efficiency (km / L)
* Vehicle ROI:

```
(Revenue - (Maintenance + Fuel)) / Acquisition Cost
```

* Export reports (CSV / PDF)

---

## 🔄 System Workflow

1. Add Vehicle → Status: Available
2. Add Driver → License Verified
3. Assign Trip → Capacity Validation Applied
4. Trip Completed → Odometer Updated
5. Maintenance Logged → Status → In Shop
6. Analytics Updated Automatically

---



## 🚀 Getting Started

### 1️⃣ Clone Repository

```bash
git clone https://github.com/RajLathidadiya/odoo-hackathon.git
cd fleetflow
```

### 2️⃣ Setup Backend

```bash
cd backend
npm install
npm run dev
```

### 3️⃣ Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🧠 Key Business Logic

* Capacity-based trip validation
* License expiry enforcement
* Automatic vehicle availability tracking
* Maintenance state blocking dispatch
* Per-vehicle cost aggregation

---

## 📌 Future Enhancements

* Real-time socket updates
* Predictive maintenance alerts
* AI-based fuel anomaly detection
* Fleet heatmap tracking
* Advanced analytics dashboard

---

## 📄 License

This project is built for academic and portfolio purposes.
