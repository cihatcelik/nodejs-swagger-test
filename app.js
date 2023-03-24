var createError = require('http-errors');
var express = require('express');
var path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
var logger = require('morgan');
require('dotenv').config();
const errorHandler = require('./middleware/error-handler');

var indexRouter = require('./routes/index');
var accountRouter = require('./routes/account');
var customersRouter = require('./routes/customers');


var app = express();

//const db = require('./helpers/db');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// allow cors requests from any origin and with credentials
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

app.use('/', indexRouter);
app.use('/account', accountRouter);
app.use('/customers',customersRouter);

// catch 404 and forward to error handler
app.use(errorHandler);
// app.use(function(req, res, next) {
//   next(createError(404));
// });

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
swaggerDocument = require('./swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// const options = {
//   swaggerDefinition: {
//     swagger: "2.0",
//     info: {
//       title: "SINAN AY BITIRME TEZI API",
//       description: "Sinan AY Yüksek Lisans Bitirme Tezi için geliştirilmiştir.",
//       version: "1.0.0"
//     },
//     basePath: "/"
//   },
//   apis: ["./routes/*.js"]
// };

// const swaggerSpec = swaggerJSDoc(options);

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
