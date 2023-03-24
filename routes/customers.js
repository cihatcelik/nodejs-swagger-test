var express = require('express');
var router = express.Router();

let customers = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Doe' },
  { id: 3, name: 'Bob Smith' },
];


router.get('/customers', (req, res) => {
  res.json(customers);
});

router.post('/customers', (req, res) => {
  const customer = req.body;
  customers.push(customer);
  res.send('Customer added successfully');
});

router.delete('/customers/:id', (req, res) => {
  const { id } = req.params;
  customers = customers.filter((customer) => customer.id !== parseInt(id));
  res.send('Customer deleted successfully');
});


router.put('/customers/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const customer = customers.find((customer) => customer.id === parseInt(id));
  if (!customer) {
    res.status(404).send('Customer not found');
  } else {
    customer.name = name;
    res.send('Customer updated successfully');
  }
});



module.exports = router;
