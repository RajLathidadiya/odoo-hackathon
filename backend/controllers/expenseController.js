const Expense = require('../models/Expense');
const Joi = require('joi');

// Validation schema for expense creation
const expenseCreateSchema = Joi.object({
  vehicle_id: Joi.number().required(),
  description: Joi.string().max(500).required(),
  amount: Joi.number().positive().required(),
  expense_date: Joi.date().required(),
  expense_type: Joi.string().valid('Maintenance', 'Fuel', 'Insurance', 'Registration', 'Other').optional()
});

// Validation schema for expense update
const expenseUpdateSchema = Joi.object({
  description: Joi.string().max(500).optional(),
  amount: Joi.number().positive().optional(),
  expense_date: Joi.date().optional(),
  expense_type: Joi.string().valid('Maintenance', 'Fuel', 'Insurance', 'Registration', 'Other').optional()
});

// GET /api/expenses - Get all expenses
exports.getAll = (req, res) => {
  Expense.getAll((err, expenses) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    res.status(200).json({
      message: 'Expenses retrieved successfully',
      count: expenses.length,
      data: expenses
    });
  });
};

// GET /api/expenses/:vehicleId - Get expenses by vehicle ID
exports.getByVehicleId = (req, res) => {
  const vehicleId = req.params.vehicleId;

  if (!vehicleId) {
    return res.status(400).json({ message: 'Vehicle ID is required' });
  }

  Expense.getByVehicleId(vehicleId, (err, expenses) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    res.status(200).json({
      message: 'Expenses retrieved successfully',
      vehicle_id: vehicleId,
      count: expenses.length,
      data: expenses
    });
  });
};

// POST /api/expenses - Create new expense
exports.create = (req, res) => {
  // Validate request
  const { error, value } = expenseCreateSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ 
      message: 'Validation error',
      details: error.details
    });
  }

  const newExpense = new Expense({
    id: null,
    vehicle_id: value.vehicle_id,
    description: value.description,
    amount: value.amount,
    expense_date: value.expense_date,
    expense_type: value.expense_type || 'Other',
    created_at: new Date()
  });

  Expense.create(newExpense, (err, expense) => {
    if (err) {
      console.error('Error creating expense:', err);
      return res.status(500).json({ message: 'Error creating expense' });
    }

    res.status(201).json({
      message: 'Expense created successfully',
      data: expense
    });
  });
};

// GET /api/expenses/:id - Get expense by ID
exports.getById = (req, res) => {
  const expenseId = req.params.id;

  if (!expenseId) {
    return res.status(400).json({ message: 'Expense ID is required' });
  }

  Expense.getById(expenseId, (err, expense) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.status(200).json({
      message: 'Expense retrieved successfully',
      data: expense
    });
  });
};

// PUT /api/expenses/:id - Update expense
exports.update = (req, res) => {
  const expenseId = req.params.id;

  if (!expenseId) {
    return res.status(400).json({ message: 'Expense ID is required' });
  }

  // Validate request
  const { error, value } = expenseUpdateSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ 
      message: 'Validation error',
      details: error.details
    });
  }

  Expense.update(expenseId, value, (err, result) => {
    if (err) {
      console.error('Error updating expense:', err);
      return res.status(500).json({ message: 'Error updating expense' });
    }

    res.status(200).json({
      message: 'Expense updated successfully',
      id: expenseId
    });
  });
};

// DELETE /api/expenses/:id - Delete expense
exports.delete = (req, res) => {
  const expenseId = req.params.id;

  if (!expenseId) {
    return res.status(400).json({ message: 'Expense ID is required' });
  }

  Expense.delete(expenseId, (err, result) => {
    if (err) {
      console.error('Error deleting expense:', err);
      return res.status(500).json({ message: 'Error deleting expense' });
    }

    res.status(200).json({
      message: 'Expense deleted successfully',
      id: expenseId
    });
  });
};
