var express = require('express');
var router = express.Router();

var PrivilegesHandler = require('./privileges');
var Config = require('./config');
var Account = require('./models/admin');
var Logger = require('./logger.js');
var path = require('path');


//Edit account privileges
router.post("/edit", PrivilegesHandler.islogedIn, async function(req,res,error){

	var privileges = await PrivilegesHandler.GetPrivileges(req.session.username);

	if(privileges[5] != true){
		res.send('400');
		return;
	}
	console.log(req.param('privileges'));
	var new_privileges = JSON.parse(req.param('privileges'));
	var name = req.param('name');

	var file = req.session.username + '.txt';
	var filepath = '/logs/';
	Logger.WriteInFile(path.join(__dirname, filepath + file),'-----Admin tietojen muokkaus------', req.session.username);
	Logger.WriteInFile(path.join(__dirname, filepath + file),'Kohde: ' + name, req.session.username);
	Logger.WriteInFile(path.join(__dirname, filepath + file),'----------Muokkaus loppu----------'  + '\r\n', req.session.username);

	Account.model.findOne({username: name}, function(error, account){

		account['mod_log'] = (new_privileges[0] == "true" ||new_privileges[0] ==  true) ? true : false;
		account['create_user'] = (new_privileges[1] == "true" ||new_privileges[1] ==  true) ? true : false;
		account['remove_user'] = (new_privileges[2] == "true" ||new_privileges[2] ==  true) ? true : false;
		account['mod_user'] = (new_privileges[3] == "true" ||new_privileges[3] ==  true) ? true : false;
		account['mod_shifts'] = (new_privileges[4] == "true" ||new_privileges[4] ==  true) ? true : false;
		account['mod_accounts'] = (new_privileges[5] == "true" ||new_privileges[5] ==  true) ? true : false;
		account['remove_accounts'] = (new_privileges[6] == "true" ||new_privileges[6] ==  true) ? true : false;

		account.save(function(err){
			if(err){
				console.log(err);
				res.send("failed");
				res.end();
			}else{
				res.send("ok");
				res.end();
			}
		});

	});
})

//Remove account
router.post("/remove", PrivilegesHandler.islogedIn, async function(req,res,error){

	var privileges = await PrivilegesHandler.GetPrivileges(req.session.username);

	if(privileges[6] != true){
		res.send('400');
		return;
	}
	
	var name = req.param('account');

	var file = req.session.username + '.txt';
	var filepath = '/logs/';
	Logger.WriteInFile(path.join(__dirname, filepath + file),'-----Adminin poistaminen------', req.session.username);
	Logger.WriteInFile(path.join(__dirname, filepath + file),'Kohde: ' + name, req.session.username);
	Logger.WriteInFile(path.join(__dirname, filepath + file),'----------Poistaminen loppu----------'  + '\r\n', req.session.username);

	Account.model.deleteOne({username:name}, function(err){
		if(err){console.log("can do nothing");}
	});

	if(name === req.session.username){
		req.logout();
		req.session.username = null;
		res.send('logout');
	}else{
		res.send('ok');
	}	
})

//Get account privileges
router.post('/privileges', PrivilegesHandler.islogedIn, async function(req, res, error){

	var privileges = await PrivilegesHandler.GetPrivileges(req.session.username);

	if(privileges[5] != true){
		res.send('400');
		return;
	}else{
		var name = req.param('name');
		var privileges2 = await PrivilegesHandler.GetPrivileges(name);
		res.send(JSON.stringify(privileges2));
	}
});

//Edit account password
router.post('/edit_password', PrivilegesHandler.islogedIn, async function(req, res) {

	var user = req.param('username');
	var pass = req.param('password');
	var privileges = await PrivilegesHandler.GetPrivileges(req.session.username);

	if(privileges[5] != true){
		res.send('400');
		return;
	}
	Account.model.findOne({username:user}).then(function(account){
		if(account){
			account.setPassword(pass, function(){
	            account.save();
	            res.send('ok');
        	});
		}else{
			res.send('no account');
		}
	});
});

module.exports = router