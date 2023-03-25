var express = require('express');
var router = express.Router();
const customersService = require('../services/customers.service');
const Joi = require('joi');
const authorize = require('../middleware/authorize');

const validateRequest = require('../middleware/validate-request');

//ok
router.get('/get-all', authorize(),(req, res) => {
  customersService.gelAllCustomers(result=>{
    res.json(result);
  });
});

function customerModelSchema(req, res, next) {
  const schema = Joi.object({
      customerFirstName: Joi.string().required(),
      customerLastName: Joi.string().required(),
      customerCity: Joi.string().required()
  });
  validateRequest(req, next, schema);
}
//ok
router.post('/add-customer',authorize(),customerModelSchema, (req, res) => {
  const customer = req.body;
  customersService.addCustomer(req.body,result=>{
    res.json({result:result});
  })
});

router.delete('/delete-customer/:id', authorize(),(req, res) => {
  const { id } = req.params;
  customersService.deleteCustomer(id,(result)=>{
    res.json({result:result});
  })

});


router.put('/edit-customer/:id', authorize(),customerModelSchema,(req, res) => {
  const { id } = req.params;
  const { name } = req.body;


  customersService.editCustomer(id,req.body,result=>{
    res.json({result:result});
  })
});


router.get('/get-customer/:id',authorize(),(req,res)=>{
  const { id } = req.params;
  customersService.getCustomerById(id,(result)=>{
    res.json(result);
  })
})



module.exports = router;
