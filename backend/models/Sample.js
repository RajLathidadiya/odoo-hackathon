const db = require('../config/database');

// Sample Model - Replace with your actual models

const Sample = function(sample) {
  this.id = sample.id;
  this.name = sample.name;
  this.description = sample.description;
  this.created_at = new Date();
};

// Get all samples
Sample.getAll = (result) => {
  db.query('SELECT * FROM samples', (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      console.log('samples: ', res);
      result(null, res);
    }
  });
};

// Get sample by ID
Sample.getById = (id, result) => {
  db.query('SELECT * FROM samples WHERE id = ?', [id], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      console.log('sample: ', res);
      result(null, res);
    }
  });
};

// Create sample
Sample.create = (newSample, result) => {
  db.query('INSERT INTO samples SET ?', newSample, (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      console.log(res.insertId);
      result(null, { id: res.insertId, ...newSample });
    }
  });
};

// Update sample
Sample.updateById = (id, sample, result) => {
  db.query('UPDATE samples SET ? WHERE id = ?', [sample, id], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(null, err);
    } else {
      console.log('Updated sample: ', { id: id, ...sample });
      result(null, { id: id, ...sample });
    }
  });
};

// Delete sample
Sample.remove = (id, result) => {
  db.query('DELETE FROM samples WHERE id = ?', [id], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(null, err);
    } else {
      console.log('Deleted sample with id: ', id);
      result(null, res);
    }
  });
};

module.exports = Sample;
