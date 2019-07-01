const express = require('express');
const router = express.Router();

const DBCONN = require('../../api/Helper/DBCONN.js').Crude;


const sql = require("mssql");
const uuidv1 = require('uuid/v1');

const config = DBCONN;	
const pool = new sql.ConnectionPool(config).connect();

router.get('/', (req, res, next) => {


	pool.then(pool => {
		return pool.request()
        .query('select *  from UserProfile');
	}).then(result => {
		res.setHeader('Access-Control-Allow-Origin', '*')
		res.status(200).json({
			result: result1.recordsets[0]
		}); 
		sql.close();
	}).catch(err => {
		res.status(500).send({ message: err})
		sql.close();
	});   

});

router.post('/:profileId', (req, res, next) => {

    const id = req.params.profileId;
    
    const product = {
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        Day: req.body.Day,
        Month: req.body.Month,
        Designation: req.body.Designation,
        Status: req.body.Status,
        AboutMySelf: req.body.AboutMySelf
    }

	pool.then(pool => {
		return pool.request()
        .input('fname', sql.VarChar(250), product.FirstName)
		.input('id', sql.UniqueIdentifier, id)
		.input('lname', sql.VarChar(250), product.LastName)
		.input('day', sql.VarChar(sql.MAX), product.Day)
		.input('month', sql.VarChar(sql.MAX), product.Month)
		.input('designation', sql.VarChar(sql.MAX), product.Designation)
		.input('status', sql.VarChar(sql.MAX), product.Status)
		.input('aboutmyself', sql.VarChar(500), product.AboutMySelf)
		.execute('UpdateUserProfile');
		}).then(result => {
		  res.setHeader('Access-Control-Allow-Origin', '*')
		  res.status(201).json({
			createdProfile: 'prifile updated successfully'
		});	 
		  sql.close();
		}).catch(err => {
		  res.status(500).send({ message: err})
		  sql.close();
		});

	
});

router.get('/:profileId', (req, res, next) => {
	const id = req.params.profileId;

	pool.then(pool => {
		return pool.request()
		.input('id', sql.UniqueIdentifier, id)
		.execute(UpdateUserProfile);
		}).then(result => {
		res.setHeader('Access-Control-Allow-Origin', '*')
		res.status(200).json({
			result: result1.recordsets[0]
		});  
		  sql.close();
		}).catch(err => {
		  res.status(500).send({ message: err})
		  sql.close();
		});

});

router.patch('/:productId', (req, res, next) => {
	res.status(200).json({
		message: 'Updated product'
	});
});

router.delete('/:productId', (req, res, next) => {
	res.status(200).json({
		message: 'Deleted product'
	});
});

module.exports = router;