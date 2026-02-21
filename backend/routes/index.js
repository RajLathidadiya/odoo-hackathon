const express = require('express');
const router = express.Router();

// Import route modules
// router.use('/users', require('./users'));
// router.use('/products', require('./products'));

// Sample route
router.get('/', (req, res) => {
  res.status(200).json({ message: 'API is working' });
});

module.exports = router;
