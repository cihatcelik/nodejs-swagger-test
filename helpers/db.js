const mongoose = require('mongoose');
const connectionOptions = {useNewUrlParser: true, useUnifiedTopology: true };
mongoose.connect(process.env.MONGODB_URI, connectionOptions);
mongoose.Promise = global.Promise;

mongoose.connection.on('open', () => {
    console.log('MongoDB: Connected');
  });
  mongoose.connection.on('error', (err) => {
    console.log('MongoDB: Error', err);
  });
module.exports = {
    Account : require('../models/accounts/account.model'),
    RefreshToken : require('../models/accounts/refresh-token.model'),
    isValidId
};

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}