🚛 FleetFlow
Modular Fleet & Logistics Management System

FleetFlow is a centralized, rule-based digital fleet management system designed to replace inefficient manual logbooks. It optimizes vehicle lifecycle management, driver safety monitoring, trip dispatching, and financial performance tracking.

🎯 Objective

To build a structured logistics hub that:

Optimizes delivery fleet operations

Ensures driver compliance & safety

Tracks maintenance & fuel expenses

Provides actionable analytics & ROI insights

🛠 Tech Stack

Frontend

React

Modular Component Architecture

Role-Based UI

Data Tables with Filters

Backend

Node.js

Express.js

RESTful APIs

Real-time state updates (vehicle/driver availability)

Database

Relational Database (Trips, Vehicles, Drivers, Expenses linked via IDs)

👥 Target Users

Fleet Managers – Monitor vehicles, lifecycle, and utilization

Dispatchers – Assign drivers & vehicles, manage trips

Safety Officers – Track compliance and license validity

Financial Analysts – Monitor cost, ROI, fuel efficiency

🖥 Core System Modules
🔐 1. Authentication & RBAC

Secure login system

Role-Based Access Control

Manager / Dispatcher / Safety / Finance roles

📊 2. Command Center (Dashboard)

High-level fleet overview with KPIs:

Active Fleet (On Trip)

Maintenance Alerts

Fleet Utilization %

Pending Cargo

Filters by vehicle type, region, status

🚚 3. Vehicle Registry

Asset management with:

CRUD operations

License Plate (Unique ID)

Load Capacity

Odometer Tracking

Manual "Out of Service" toggle

📦 4. Trip Dispatcher & Management

Trip lifecycle:

Draft → Dispatched → Completed → Cancelled

Validation rule:

Prevent trip creation if CargoWeight > MaxCapacity

Auto status updates:

Vehicle → On Trip

Driver → On Duty

🔧 5. Maintenance & Service Logs

Add service entries (Oil change, repairs, etc.)

Auto logic:

Vehicle status → "In Shop"

Removed from dispatcher selection

⛽ 6. Fuel & Expense Logging

Record:

Liters

Cost

Date

Auto calculation:

Total Operational Cost = Fuel + Maintenance
👨‍✈️ 7. Driver Performance & Safety

License expiry validation (blocks assignment if expired)

Safety Score

Trip completion rate

Status:

On Duty

Off Duty

Suspended

📈 8. Operational Analytics

Advanced insights:

Fuel Efficiency → km / L

Vehicle ROI:

(Revenue - (Maintenance + Fuel)) / Acquisition Cost

CSV/PDF exports for reports

🔄 System Workflow

Add Vehicle → Status: Available

Add Driver → License Validated

Assign Trip → Capacity Check Applied

Trip Completed → Odometer Updated

Maintenance Logged → Status switches to In Shop

Analytics auto-update cost per km

🧠 Key Business Logic

Capacity validation before dispatch

License expiry blocks driver assignment

Maintenance auto-removes vehicle from dispatch pool

Real-time availability tracking

Automatic cost aggregation per vehicle
🚀 Getting Started
1️⃣ Clone the Repository
git clone https://github.com/yourusername/fleetflow.git
cd fleetflow
2️⃣ Backend Setup
cd server
npm install
npm run dev
3️⃣ Frontend Setup
cd client
npm install
npm start
📌 Future Improvements

Real-time WebSocket updates

Predictive maintenance alerts

AI-based fuel anomaly detection

Fleet heatmap tracking

Multi-branch logistics support

📄 License

This project is built for academic and portfolio purposes.
