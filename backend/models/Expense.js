const db = require('../config/database');

const Expense = function(expense) {
  this.id = expense.id;
  this.vehicle_id = expense.vehicle_id;
  this.trip_id = expense.trip_id || null;
  this.amount = expense.amount;
  this.expense_date = expense.expense_date;
  this.expense_type = expense.expense_type;
};

// Get all expenses
Expense.getAll = (result) => {
  const query = `
    SELECT 
      e.id,
      e.vehicle_id,
      e.trip_id,
      e.amount,
      e.expense_date,
      e.expense_type,
      v.vehicle_code,
      v.license_plate,
      v.model
    FROM expenses e
    LEFT JOIN vehicles v ON e.vehicle_id = v.id
    ORDER BY e.expense_date DESC
  `;
  
  db.query(query, (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

// Get expenses by vehicle ID
Expense.getByVehicleId = (vehicleId, result) => {
  const query = `
    SELECT 
      e.id,
      e.vehicle_id,
      e.trip_id,
      e.amount,
      e.expense_date,
      e.expense_type,
      v.vehicle_code,
      v.license_plate,
      v.model
    FROM expenses e
    LEFT JOIN vehicles v ON e.vehicle_id = v.id
    WHERE e.vehicle_id = ?
    ORDER BY e.expense_date DESC
  `;
  
  db.query(query, [vehicleId], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

// Create new expense
Expense.create = (newExpense, result) => {
  const query = `
    INSERT INTO expenses
    (vehicle_id, trip_id, amount, expense_date, expense_type)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  db.query(
    query,
    [
      newExpense.vehicle_id,
      newExpense.trip_id || null,
      newExpense.amount,
      newExpense.expense_date,
      newExpense.expense_type
    ],
    (err, res) => {
      if (err) {
        console.log('error: ', err);
        result(err, null);
      } else {
        result(null, { id: res.insertId, ...newExpense });
      }
    }
  );
};

// Get expense by ID
Expense.getById = (id, result) => {
  const query = `
    SELECT 
      e.id,
      e.vehicle_id,
      e.trip_id,
      e.amount,
      e.expense_date,
      e.expense_type,
      v.vehicle_code,
      v.license_plate,
      v.model
    FROM expenses e
    LEFT JOIN vehicles v ON e.vehicle_id = v.id
    WHERE e.id = ?
  `;
  
  db.query(query, [id], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else if (res.length) {
      result(null, res[0]);
    } else {
      result(null, null);
    }
  });
};

// Update expense
Expense.update = (id, updateData, result) => {
  const query = `
    UPDATE expenses
    SET amount = ?, expense_date = ?, expense_type = ?
    WHERE id = ?
  `;
  
  db.query(
    query,
    [
      updateData.amount,
      updateData.expense_date,
      updateData.expense_type,
      id
    ],
    (err, res) => {
      if (err) {
        console.log('error: ', err);
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};

// Delete expense
Expense.delete = (id, result) => {
  const query = 'DELETE FROM expenses WHERE id = ?';
  
  db.query(query, [id], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

module.exports = Expense;
