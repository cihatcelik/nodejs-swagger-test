const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    customerFirstName: { type: String, required: true },
    customerLastName: { type: String},
    customerCity : {type:String},
    created: { type: Date, default: Date.now },
});



schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
        delete ret.passwordHash;
    }
});

module.exports = mongoose.model('Customers', schema);