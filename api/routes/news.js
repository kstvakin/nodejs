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
        .execute('SelectAnnouncement')
		}).then(result => {
		let rows = result.recordsets[0];
		res.status(200).json(rows);
		sql.close();
		}).catch(err => {
		res.status(500).send({ message: err })
		sql.close();
		});

   

});

router.post('/', (req, res, next) => {

	const news = {
		Content: req.body.Content,
		DateCreated: req.body.DateCreated

	}

    const id = uuidv1();

    pool.then(pool => {
        return pool.request()
            .input('content', sql.VarChar(sql.Max), news.Content)
            .execute('CreateNews')
    }).then(result => {
        res.status(201).json({
            createdProfile: 'News created successfully'
        });
        sql.close();
    }).catch(err => {
        res.status(500).send({ message: err.message })
        sql.close();
    });

	
});


module.exports = router;