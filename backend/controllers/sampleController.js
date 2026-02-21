// Sample controller file
// This shows the basic structure for controllers

exports.getSample = (req, res) => {
  res.status(200).json({ message: 'Sample controller' });
};

exports.createSample = (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  // Add your database logic here
  res.status(201).json({ message: 'Sample created', data: { name } });
};
