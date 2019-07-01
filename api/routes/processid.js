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

router.get('/:requestId', (req, res, next) => {
	const id = req.params.requestId;	
	pool.then(pool => {
		return pool.request()
        .input('id', sql.UniqueIdentifier, id)
        .execute('SelectUserRequest')
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


router.post('/', (req, res, next) => {
	const id = req.body.requestId;

	const product = {
		Message: req.body.message,
		Status: req.body.status
	}	

	pool.then(pool => {
		return pool.request()
		.input('status', sql.VarChar(sql.MAX), product.Status)
		.input('id', sql.UniqueIdentifier, id)
		.input('message', sql.VarChar(sql.MAX), product.Message)
		.execute('HodApproval')
		}).then(result => {
		  
			let rows = result.recordsets[0]
			res.status(200).json(rows[0]);	
			
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
				template: 'approval',
				message: {
					to: rows[0].Email
				},
				locals: {
					fname: rows[0].Name,
					request: rows[0].Type,
					id: id,
					message: rows[0].Message,
					date: rows[0].DepartureDate,
					leaving: rows[0].TimeOut,
					returning: rows[0].TimeIn,
					status: rows[0].Status,
					hod_message: rows[0].HOD_Message
				},
			});
			
		  sql.close();
		}).catch(err => {
		  res.status(500).send({ message: "${err}"})
		  sql.close();
		});

		
});


router.post('/contact_req', (req, res, next) => {
	

	const product = {
		Message: req.body.message,
		Email: req.body.email,
		Name: req.body.name,
		Type: req.body.type,
		Id: req.body.userid,
		adminApprovalStatus: req.body.adminApprovalStatus
	}	

    let status = parseInt(product.adminApprovalStatus)

    if (status === 1) {
        pool.then(pool => {
            return pool.request()
                .input('message', sql.VarChar(sql.MAX), product.Message)
                .input('id', sql.UniqueIdentifier, product.Id)
                .input('count', sql.SmallInt, 1)
                .input('adminApprovalStatus', sql.SmallInt, status)
                .input('status', sql.VarChar(sql.MAX), 'declined')
                .execute('UpdateAdminMessage')
        }).then(result => {

            res.status(200).json(
                {
                    createdProfile: 'request updated successfully'
                }
            );
            sql.close();
        }).catch(err => {
            res.status(500).send({ message: err.message });
            sql.close();
        });
    }

    if (status === 2) {
        pool.then(pool => {
            return pool.request()
                .input('message', sql.VarChar(sql.MAX), product.Message)
                .input('id', sql.UniqueIdentifier, product.Id)
                .input('count', sql.SmallInt, 1)
                .input('adminApprovalStatus', sql.SmallInt, status)
                .input('status', sql.VarChar(sql.MAX), 'approved')
                .execute('UpdateAdminMessage')
        }).then(result => {

            res.status(200).json(
                {
                    createdProfile: 'request updated successfully'
                }
            );
            sql.close();
        }).catch(err => {
            res.status(500).send({ message: err.message });
            sql.close();
        });
    }


		const qstmt= 'select Hod_Name from Hod';

		pool.then(pool => {
			return pool.request().query(qstmt)
			}).then(result => {
			let rows = result.recordset;
			
			if(rows.length > 0){
				//console.log(rows);
			}
			
			sql.close();
			}).catch(err => {
			res.status(500).send({ message: "${err}"})
			sql.close();
			});

		
			
			const transporter = MailConfig.SMTPTransport;
	
			const email = new Email({
				transport: transporter,
				send: true,
				preview: false,
				message: {
					from: {
						name: 'Admin',
						address: 'itsupport@jubileelifeng.com'
					}
				}
				});

				email.send({
						template: 'admin',
						message: {
								to: product.Email,
								cc: 'adminsupport@jubileelifeng.com'
						},
						locals: {
								fname: product.Name,
								request: product.Type,
								id: product.Id,
								message: product.Message
						},
				}).catch(console.error);

});




module.exports = router;