var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

var time = String(today.getHours()).padStart(2, '0') + ":" + String(today.getMinutes() ).padStart(2, '0') ;

today = dd + '/' + mm + '/' + yyyy;
    


module.exports.DATETIME = {
    currentTime: time,
    currentDate: today
}