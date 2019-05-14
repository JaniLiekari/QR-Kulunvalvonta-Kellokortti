const mongoose = require('mongoose')
var Schema = mongoose.Schema;

var Login = new Schema({
   
   	date: Date,
	loginTime: Date,
	logoutTime: Date,
	workDay: Boolean

});

var Client = new Schema({

	firstname: String,
	lastname: String,
	loggedin: Boolean,
	loggins: [Login],
	shift: String,
	unit: String,
	workDays: [Boolean],
	id: String,
	vastuu: String

});

module.exports.client = mongoose.model('client', Client, 'client');
module.exports.login = mongoose.model('login', Login, 'login');