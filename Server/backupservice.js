var express = require('express');
var router = express.Router();

var PrivilegesHandler = require('./privileges');

var AccountModel = require('./models/admin').model;
var ShiftModel = require('./models/shifts').shift;
var ClientModel = require('./models/client').client;

var crypto = require('crypto'),
			 algorithm = 'aes-256-ctr',
			   password = 'd6F3Efeq';



var multer = require('multer');



var upload = multer({ dest: "tmp" });

const fs = require('fs')
const util = require('util')

const unlinkAsync = util.promisify(fs.unlink)
var mongoose = require('mongoose');


async function LoadClients(){

	var list = [];

	await ClientModel.find({}).exec().then((clients) => {
		list = clients;
	});

	return list;
} 
async function LoadShifts(){

	var list = null;

	await ShiftModel.find({}).exec().then((shifts) => {
		list = shifts;
	});

	return list;
}


function backup(clients, shifts){
	this.clients = clients;
	this.shifts = shifts;
}
function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
} 
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}


router.get('/download',PrivilegesHandler.islogedIn, async function(req,res){


	var clients = await LoadClients();
	var shifts = await LoadShifts();

	var data = new backup(clients, shifts);

	var json = JSON.stringify(data);
	
	var hex = encrypt(json);

	var date = new Date();

	var filename = "kulunvalvonta-" + date.getFullYear() +"-"+ date.getMonth() +"-"+ date.getDate();

	res.set({"Content-Disposition":"attachment; filename=\""+filename+".backup\""});
	res.send(hex);
});


var errorFlag = false;
async function UploadShifts(shifts){

	mongoose.connection.db.dropCollection('shift', function(err, result) {
		 if(err){
		 	errorFlag = true;
		 	console.log(err)
		 }
			
	});


	for(var i = 0; i < shifts.length; i++){


		var new_shift = new ShiftModel({

			name: shifts[i]['name'],
			hours: shifts[i]['hours'],
			minutes: shifts[i]['minutes']

		});

		new_shift.save(function(err){
			if(err){
				errorFlag = true;
				console.log(err);
			}
		});


	}
}
async function UploadClients(clients){

	mongoose.connection.db.dropCollection('client', function(err, result) {
		 if(err){
		 	errorFlag = true;
		 	console.log(err)
		 }
			
	});


	for(var i = 0; i < clients.length; i++){




		var new_client = new ClientModel({

			firstname: clients[i]['firstname'],
			lastname: clients[i]['lastname'],
			loggedin:clients[i]['loggedin'],
			shift: clients[i]['shift'],
			unit: clients[i]['unit'],
			loggins: clients[i]['loggins'],
			workDays: clients[i]['workDays'],
			id: clients[i]['id'],
			vastuu: clients[i]['vastuu']

		});

		new_client.save(function(err){
			if(err){
				errorFlag = true;
				console.log(err);
			}
		});


	}
}


function verifyJSON(json){
	if(json['clients'] != null && json['shifts'] != null){
		return true;
	}
	return false;
}



/* HUOMAA ETTÄ MULTER (upload.single) ANTAA BOUNDARY VIRHEILMOITUSTA JOS Content-type ON ASETETTU MANUAALISESTI */

router.post('/upload', PrivilegesHandler.islogedIn, upload.single('backup'), async function(req,res){

  	var backup = req.file.path;


  	const readFile = util.promisify(fs.readFile);
  	let data = fs.readFileSync(req.file.path);
  	var json = JSON.parse(decrypt(data.toString('utf8')));



  	if(!verifyJSON(json)){
  		await unlinkAsync(req.file.path)
  		res.send('corrupted_file');
  		return;
  	}



  	await UploadShifts(json['shifts']);
  	await UploadClients(json['clients']);

  	await unlinkAsync(req.file.path)

  	if(errorFlag){
  		res.send('errorFlag');
  		return;
  	}

	res.send('ok');
});

router.get('/reset', PrivilegesHandler.islogedIn, async function(req,res){


	mongoose.connection.db.dropCollection('client', function(err, result) {
		 if(err){
		 	errorFlag = true;
		 	console.log(err)
		 }
			
	});


	mongoose.connection.db.dropCollection('shift', function(err, result) {
		 if(err){
		 	errorFlag = true;
		 	console.log(err)
		 }
			
	});

	mongoose.connection.db.dropCollection('account', function(err, result) {
		 if(err){
		 	errorFlag = true;
		 	console.log(err)
		 }
			
	});


	res.redirect('/admin/logout');
	
});





module.exports = router;