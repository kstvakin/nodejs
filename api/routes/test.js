const express = require('express');
const router = express.Router();

const MailConfig = require('../../config/email');
const Email = require('email-templates');
const nodemailer = require('nodemailer');
let environment = process.env;


const sql = require("mssql");
const uuidv1 = require('uuid/v1');

const config = {
	user: 'sa',
	password: 'Stevon@123?##',
	server: 'JLMB-APP-SVR', 
	database: 'JLife_Test' 
	};
	
const pool = new sql.ConnectionPool(config).connect();

router.get('/', (req, res, next) => {

   

	pool.then(pool => {
        return pool.request()
        .input('input_parameter', sql.Int, parseInt('1'))
        .input('id', sql.UniqueIdentifier, 'D9F91990-7621-11E9-948D-0B636301E11E')
        .query('select Admin_Req.Name, Admin_Req.Type,  Admin_Req.DepartureDate, Admin_Req.TimeOut, Admin_Req.TimeIn, Admin_Req.Message, Hod.Hod_Name, Hod.Hod_Email from Admin_Req INNER JOIN Hod ON Admin_Req.Department=Hod.Hod_Dp_Id where Department = @input_parameter and Id = @id')
		}).then(result => {
		let rows = result.recordset
		res.setHeader('Access-Control-Allow-Origin', '*')
		res.status(200).json(rows[0].Hod_Name);
		sql.close();
		}).catch(err => {
		res.status(500).send({ message: err})
		sql.close();
		});

});









module.exports = router;