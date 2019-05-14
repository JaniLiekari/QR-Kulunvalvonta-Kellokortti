
//Function name tells everything.
module.exports.getMonday = function getMonday( date ) {
    var day = date.getDay() || 7;  
    if( day !== 1 ) 
        date.setHours(-24 * (day - 1)); 
    return date;
}


//Helper that return date whit specifics hms.
module.exports.setDateHMS = function setDateHMS(date,hours, minutes, seconds){
	date.setHours(hours);
	date.setMinutes(minutes);
	date.setSeconds(seconds);
	return date;
}


//Change first letter to uppercase
module.exports.Uppercase = function Uppercase(word){

	return word.charAt(0).toUpperCase() + word.slice(1);

}


module.exports.createDateString = function createDateString(date){
	var string = "";
	string = date.getDate() + "."+(date.getMonth()+1)+"."+date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes();
	return string;
}


module.exports.wsKey = function wsKey(){

	const crypto = require('crypto');

	var current_date = (new Date()).valueOf().toString();
	var random = Math.random().toString();
	var key = crypto.createHash('sha1').update(current_date + random).digest('hex');


	return key;
}