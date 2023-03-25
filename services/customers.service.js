
const db = require('../helpers/db');
const customers = require('../models/customers/customers.model');
const mongoose = require('mongoose');
const gelAllCustomers = (result)=>{
    customers.find({},(err,data)=>{
        result(data);
    })
}

const addCustomer =(customerObj,result)=>{
    new customers(customerObj).save((err,data)=>{
        if(data){
            result(true);
        }
    })
}

const editCustomer = (customerId,customerObj,result)=>{
    if(mongoose.Types.ObjectId.isValid(customerId)===true){
        customers.updateOne({_id:mongoose.Types.ObjectId(customerId)},customerObj,(err,data)=>{z
            if(data){
                if(data.modifiedCount>0){
                    result(true);
                }else{
                    result(false);
                }
            }else{
                result(false);
            }
        })
    }else{
        result(false);
    }
  
}

const deleteCustomer = (customerId,result)=>{
    
    if(mongoose.Types.ObjectId.isValid(customerId)===true){
        customers.deleteOne({_id:mongoose.Types.ObjectId(customerId)},(err,data)=>{
            console.log(data)
            if(data){
                if(data.deletedCount>0){
                    result(true);
                }else{
                    result(false);
                }
            }else{
                result(false);
            }
        })
    }else{
        result(false);
    }
    
}

const getCustomerById = (customerId,result)=>{
    if(mongoose.Types.ObjectId.isValid(customerId)===true){
        customers.find({_id:mongoose.Types.ObjectId(customerId)},(err,data)=>{
            if(data){
                if(data.length>0){
                    result(data[0]);
                }else{
                    result(null);
                }
            }else{
                result(null);
            }
        })
    }else{
        result(null);
    }
    
}
module.exports={
    gelAllCustomers,
    addCustomer,
    editCustomer,
    deleteCustomer,
    getCustomerById
}