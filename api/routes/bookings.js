const express = require('express');
const router = express.Router();

const MailConfig = require('../../config/email');
const Email = require('email-templates');
const nodemailer = require('nodemailer');
const DBCONN = require('../../api/Helper/DBCONN.js').Crude;



const sql = require("mssql");
const uuidv1 = require('uuid/v1');

const config = DBCONN;	
const pool = new sql.ConnectionPool(config).connect();

router.get('/', (req, res, next) => {

	pool.then(pool => {
		return pool.request()
        .execute('SelectBookings')
		}).then(result => {
		  let rows = result.recordsets[0]
		  res.setHeader('Access-Control-Allow-Origin', '*')
		  res.status(200).json(rows);
		  sql.close();
		}).catch(err => {
		  res.status(500).send({ message: err})
		  sql.close();
		});

});


module.exports = router;