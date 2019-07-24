var express = require('express');
var router = express.Router();

var PrivilegesHandler = require('./privileges');
var Config = require('./config');


var Client = require('./models/client').client;
var Shift = require('./models/shifts').shift;
var ShiftHandler = require('./models/shifts');
var Extented = require('./Extented.js');
var GetAdmins = require('./models/admin').getNameList;
const crypto = require('crypto');
var Logger = require('./logger.js');
var ServerConf = require('./models/config');
var path = require('path');


var AdminByName = require('./models/admin').getAccount;

async function GetPageSettings(account, setting){
	
	var pageSettings;
	var admin = await AdminByName(account);
	console.log("ADMIN: " + admin);
	pageSettings = admin[setting];

	return pageSettings;

}


//Generating new unique QR Hash
function createHash(){

	var hash;
	var current_date = (new Date()).valueOf().toString();

	//This should be unique at first time, but just for being sure, this is done in while(is unique)..
	while(true){

			var random = Math.random().toString();
			hash = crypto.createHash('sha1').update(current_date + random).digest('hex');
			var accept = true;
			Client.findOne({ 'id': hash },	function (err, person) {
	  			if (err){
	  				console.log(err);
	  			}
	  			if(person !== null && person !== undefined){
	  				accept = false;
	  			}
	  			
			});

			if(accept)
				break;

		}

	return hash + "!";
}


//renders create view
router.get('/', PrivilegesHandler.islogedIn, async function(req, res, error){
		var privileges =  await PrivilegesHandler.GetPrivileges(req.session.username);
		var CONFIG = await ServerConf.return();
		var SHOWLOG =  await GetPageSettings(req.session.username, 'show_log') == true ? true : false;
		var hash = createHash();
		var shifts = await ShiftHandler.GetShifts();
		var adminList = await GetAdmins();

		
		res.render("index", {action: "Admin", user: req.session.username, 
							QRLOG: SHOWLOG, page: "create", qr: hash, 
							message: "none", shifts: shifts, privileges: privileges, 
							IP:Config.ip, PORT: Config.port, admins: adminList, 
							plugins: require('./admin.js').plugins, wsSecret: req.session.websocketSecret
					});

});


async function accountExist(fname, lname){

	var response = true;

	await Client.findOne({firstname: fname, lastname: lname}).exec().then((client) => {
		if(client == null){
			response = false;
		}
	});

	return response;

}

//post for create new user. Adding new user into database and if success return new QR Hash
router.post('/', PrivilegesHandler.islogedIn, async function(req,res, error){

	var privileges = await PrivilegesHandler.GetPrivileges(req.session.username);

	if(privileges[1] != true){
		res.send('400');
		return;
	}
	var _firstname = req.body.firstname;
	var _lastname = req.body.lastname;
	var _unit = req.body.unit;
	var _shift = req.body.shift;

	var _id = req.body._id;
	var vast = (req.body.vastuu != "no_add") ? req.body.vastuu : null;
	var response = [];
	var workDays = JSON.parse(req.body.workDays);

	var aloitus;
	if(req.body.aloitus == undefined || req.body.aloitus == null || req.body.aloitus == ""){
		aloitus = new Date();
	}else{
		aloitus = new Date(req.body.aloitus);
	}
	/* FIX TO BE SMALLER THAN TODAY */ aloitus.setMinutes(0); aloitus.setSeconds(1); aloitus.setHours(0);


	console.log("RBA" + req.body.aloitus);
	console.log("ALOITUS : " + aloitus);



	if( _firstname === undefined || _lastname === undefined || _unit === undefined || _shift === undefined || _id === undefined){
		response[0] = "failed";
		response[1] = "Save Failed. One of params was not defined"
		res.send(JSON.stringify(response));
		return;
	}
	_firstname = Extented.Uppercase(_firstname);
	_lastname = Extented.Uppercase(_lastname);


	var exists = await accountExist(_firstname, _lastname); 					/* VARMISTETAAN ETTEI LUODA TUPLA VERSIOITA KÄYTTÄJÄSTÄ (HAJOITTAA MUUTEN TIETOKANTAA, KUN OSA HAUISTA TIETOKANNASSA TEHDÄÄN NIMILLÄ) */
																				/* TÄMÄN VOISI KORJATA KÄYMÄLLÄ LÄPI JOKAISEN KOHDAN KOODISTA JA TEKELLÄ HAUT VAIKKA QR AVAIMELLA */
	if(exists){																	/* JOS NIMI OLEMASSA ---> */
			response[0] = "failed";
			response[1] = "exists";
			res.send(JSON.stringify(response));
			return;																/* LOPETETAAN FUNKTIO TÄHÄN  <----- */ 
	}

	var new_client = new Client({
		firstname: _firstname,
		lastname: _lastname,
		loggedin: false,
		shift: _shift,
		unit: _unit,
		id: _id,
		workDays: workDays,
		vastuu: vast,
		createDate: aloitus
	});

	new_client.save(function(err){
		if(err){
			console.log(err);
			response[0] = "failed";
			response[1] = err;
			res.send(JSON.stringify(response));
		}else{
			console.log("Saved");
			response[0] = "ok";
			response[1] = createHash();
			res.send(JSON.stringify(response));
		}

	});
});


module.exports = router;
