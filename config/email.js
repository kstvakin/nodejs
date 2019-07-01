let nodemailer = require('nodemailer');
require('dotenv').config();
const format = require('string-format');
var slashes = require('slashes');
let environment = process.env;


module.exports.GMAILTransport = nodemailer.createTransport({
    service: environment.GMAIL_SERVICE_NAME,
    host: environment.GMAIL_SERVICE_HOST,
    secure:environment.GMAIL_SERVICE_SECURE,
    port: environment.GMAIL_SERVICE_PORT,
    auth: {
        user: environment.GMAIL_USER_NAME,
        pass: environment.GMAIL_USER_PASSWORD
    }
});



module.exports.SMTPTransport = nodemailer.createTransport({
    host: 'mail.jubileelifeng.com',
    port: 587,
    secure: false,
    tls: {
       rejectUnauthorized: false,
    },
    auth: {
        user: 'itsupport',
        pass: 'PqV@753?'
    },
    requireTLS: true,
    logger: true
});


