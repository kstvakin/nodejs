const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');

const profileRoutes = require('./api/routes/profiles');
const newsRoutes = require('./api/routes/news');
const requestRoutes = require('./api/routes/requests');
const bookingRoutes = require('./api/routes/bookings');
const approvalRoutes = require('./api/routes/processid');
const testRoutes = require('./api/routes/test');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
      return res.status(200).json({});
  }
  next();
});

app.use('/profiles', profileRoutes);
app.use('/news', newsRoutes);
app.use('/requests', requestRoutes);
app.use('/bookings', bookingRoutes);
app.use('/approval', approvalRoutes);
app.use('/test', testRoutes);

app.use((req, res, next) => {
	const error = new Error('Not found');
	error.status = 404; 
	next(error);
});

app.use((error, req, res, next) => {
	if(error.status){
		res.json({
		error: {
			message: error.message
		}
	});
	}else{

		res.json({
			error: {
				message: "Internal server error"
			}
		});
	}
	
	
});

module.exports = app;