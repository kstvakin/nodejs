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
        .execute('SelectUsersRequest')
		}).then(result => {
		let rows = result.recordset;
		res.setHeader('Access-Control-Allow-Origin', '*')
		res.status(200).json(rows);
		sql.close();
		}).catch(err => {
		res.status(500).send({ message: err })
		sql.close();
		});

});

router.post('/', (req, res, next) => {
	const product = {
		Name: req.body.Name,
		Email: req.body.Email,
		Department: req.body.Department,
		Type: req.body.Type,
		TimeOut: req.body.TimeOut,
		TimeIn: req.body.TimeIn,
		Message: req.body.Message,
		DepartureDate: req.body.DepartureDate,
	}

	const id = uuidv1();

	pool.then( pool => {
		
		return pool.request()
		.input('email', sql.VarChar(sql.MAX), product.Email)
		.execute('SelectHod')
		}).then( result => {
		
		let rows = result.recordset;

		console.log(rows);
		
		if( rows.length > 0 ){

			//HOD Section
			
			pool.then( pool => {
				return pool.request()
				.input('name', sql.VarChar(sql.MAX), product.Name)
				.input('id', sql.UniqueIdentifier, id)
				.input('email', sql.VarChar, product.Email)
				.input('department', sql.Int, parseInt(product.Department))
				.input('type', sql.VarChar(sql.MAX), product.Type)
				.input('timeout', sql.VarChar(50), product.TimeOut)
				.input('timein', sql.VarChar(50), product.TimeIn)
				.input('message', sql.VarChar(sql.MAX), product.Message)
				.input('departdate', sql.VarChar(sql.MAX), product.DepartureDate)
				.input('created', sql.DateTime, new Date())
				.input('count', sql.SmallInt, 0)
				.input('status', sql.VarChar(sql.MAX), 'pending')
				.input('Title', sql.VarChar(sql.MAX), 'HOD')
				.execute('InsertUsersRequest')
				}).then(result => {
					  
					let rows = result.recordset;
					
					const transporter = MailConfig.SMTPTransport;
							
					const email = new Email({
						transport: transporter,
						send: true,
						preview: false,
						message: {
							from: '"IT SUPPORT" <itsupport@jubileelifeng.com>'
						}
					});
					email.send({
						template: 'hod_mail',
						message: {
							to: req.body.Email
						},
						locals: {
							fname: req.body.Name,
							request: req.body.Type,
							id: id,
							message: req.body.Message,
							date: req.body.DepartureDate,
							leaving: req.body.TimeOut,
							returning: req.body.TimeIn
						},
					}).then(res.status(200).json({
						'message': 'message sent'
					})).catch(console.error);
		
				  sql.close();
				}).catch(err => {
				  res.status(500).send({ message: err.message})
				  sql.close();
				});

		}

		//Officer Section

		else{

			pool.then(pool => {
				return pool.request()
				.input('name', sql.VarChar(sql.MAX), product.Name)
				.input('id', sql.UniqueIdentifier, id)
				.input('email', sql.VarChar, product.Email)
				.input('department', sql.Int, parseInt(product.Department))
				.input('type', sql.VarChar(sql.MAX), product.Type)
				.input('timeout', sql.VarChar(50), product.TimeOut)
				.input('timein', sql.VarChar(50), product.TimeIn)
				.input('message', sql.VarChar(sql.MAX), product.Message)
				.input('departdate', sql.VarChar(sql.MAX), product.DepartureDate)
				.input('created', sql.DateTime, new Date())
				.input('count', sql.SmallInt, 0)
				.input('status', sql.VarChar(sql.MAX), 'pending')
				.input('Title', sql.VarChar(sql.MAX), 'Officer')
				.execute('InsertUsersRequest')
				}).then(result => {
				  let rows = result.recordset;
					
					const transporter = MailConfig.SMTPTransport;
							
					const email = new Email({
						transport: transporter,
						send: true,
						preview: false,
						message: {
							from: '"IT SUPPORT" <itsupport@jubileelifeng.com>'
						}
					});
					
					email.send({
						template: 'mars',
						message: {
							to: req.body.Email
						},
						locals: {
							fname: req.body.Name,
							request: req.body.Type,
							id: id,
							message: req.body.Message,
							date: req.body.DepartureDate,
							leaving: req.body.TimeOut,
							returning: req.body.TimeIn
						},
					}).catch(console.error);

					email.send({
						template: 'hod',
						message: {
							to: rows[0].Hod_Email
						},
						locals: {
							fname: rows[0].Hod_Name,
							reqname: req.body.Name,
							request: req.body.Type,
							id: id,
							message: req.body.Message,
							date: req.body.DepartureDate,
							leaving: req.body.TimeOut,
							returning: req.body.TimeIn
						},
					}).then(res.status(200).json({
						'message': 'message sent'
					})).catch(console.error);
		
				  sql.close();
				}).catch(err => {
				  res.status(500).send({ message: err.message})
				  sql.close();
				});

		}

		sql.close();
		}).catch(err => {
		res.status(500).send({ message: err.message})
		sql.close();
		});
		

});

router.get('/:requestId', (req, res, next) => {
    const id = req.params.requestId;

    pool.then(pool => {
        return pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .execute('SelectUserRequest')
    }).then(result => {
        let rows = result.recordsets
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.status(200).json(rows);
        sql.close();
        }).catch(err => {
            res.status(500).send({ message: err.message })
        sql.close();
    });

});

router.post('/:requestId', (req, res, next) => {
    const id = req.params.requestId;

    const product = {
        Count: req.body.Count
    }

    pool.then(pool => {
        return pool.request()
            .input('count', sql.SmallInt, parseInt(product.Count))
            .input('id', sql.UniqueIdentifier, id)
            .execute('UpdateUsersRequest')
    }).then(result => {

        res.setHeader('Access-Control-Allow-Origin', '*')
        res.status(200).json(
            {
                createdProfile: 'request updated successfully'
            }
        );
        sql.close();
    }).catch(err => {
        res.status(500).send({ message: "${err}" })
        sql.close();
    });
});

router.delete('/:productId', (req, res, next) => {
	res.status(200).json({
		message: 'Deleted product'
	});
});

module.exports = router;