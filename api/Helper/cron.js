const cron = require("node-cron");
const DBCONN = require('./DBCONN').Crude;
const sql = require("mssql");
const MailConfig = require('../../config/email');
const Email = require('email-templates');

const config = DBCONN;

const pool = new sql.ConnectionPool(config).connect();

cron.schedule("* * * * *", function () {
    //console.log("running a task every minute");
    pool.then(pool => {
        return pool.request()
            .input('status', sql.VarChar(sql.MAX), 'pending')
            .input('type', sql.VarChar(sql.MAX), 'Car')
            .execute('PendingRequest')
    }).then(result => {
        let rows = result;

        let car = rows.recordsets[0][0];
        let others = rows.recordsets[1][0];

        if (car) {
            let arr = car.DepartureDate.split("/");
            let rearr = arr[1] + '/' + arr[0] + '/' + arr[2];
            let newformat = rearr + " " + car.TimeOut + ':' + '00';

            let now = new Date();
            let then = new Date(newformat);

            let hr = diff_hours(now, then);


            if (hr.toFixed(2) <= 1.00) {

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
                    template: 'admin_escalate',
                    message: {
                        to: 'adminsupport@jubileelifeng.com'
                    },
                    locals: {
                        fname: car.Name,
                        id: car.Id,
                    },
                }).then(


                    pool.then(pool => {
                        return pool.request()
                            .input('id', sql.UniqueIdentifier, car.Id)
                            .input('cron', sql.SmallInt, 1)
                            .query('Update Admin_Req Set Cron = @cron where Id = @id ')
                    }).then(result => {

                        console.log(hr);

                    }).catch(console.error)



                ).catch(console.error);


            }
        }

        if (others) {

            let now = new Date();
            let then = new Date(gettime());

            let hr = diff_hours(now, then);

            console.log(hr.toFixed(2));

            if (hr.toFixed(2) == 0.00) {
                pool.then(pool => {
                    return pool.request()
                        .input('status', sql.VarChar(sql.MAX), 'closed')
                        .input('id', sql.UniqueIdentifier, others.Id)
                        .input('cron', sql.SmallInt, 1)
                        .query('Update Admin_Req Set Status = @status, Cron = @cron where Id = @id ')
                }).then(result => {

                    console.log(hr.toFixed(2));

                }).catch(console.error);
            }

        }

        sql.close();
    }).catch(err => {
        console.log(err.message)
        sql.close();
    });

});


function diff_hours(dt2, dt1) {

    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= (60 * 60);
    return Math.abs(diff);

}


function gettime() {
    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1; //months from 1-12
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();

    newdate = month + "/" + day + "/" + year;

    newdate = newdate + " " + '07:32:00';

    return newdate;

}