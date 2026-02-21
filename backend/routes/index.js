const express = require('express');
const router = express.Router();

// Import route modules
router.use('/auth', require('./auth'));
// router.use('/users', require('./users'));
// router.use('/vehicles', require('./vehicles'));
// router.use('/drivers', require('./drivers'));
// router.use('/trips', require('./trips'));
// router.use('/maintenance', require('./maintenance'));
// router.use('/fuel', require('./fuel'));
// router.use('/expenses', require('./expenses'));

// Sample route
router.get('/', (req, res) => {
  res.status(200).json({ message: 'API is working' });
});

module.exports = router;
