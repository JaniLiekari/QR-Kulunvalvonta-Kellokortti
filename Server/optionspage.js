var express = require('express');
var router = express.Router();

var PrivilegesHandler = require('./privileges');
var ServerConf = require('./models/config');
var Config = require('./config');
var Account = require('./models/admin');
var Shift = require('./models/shifts').shift;
var Plugins = require('./models/plugins').plugin;


router.use('/shift', require('./shifts.js'));
router.use('/account', require('./accounts.js'));


var AdminByName = require('./models/admin').getAccount;

async function GetPageSettings(account, setting){
	
	var pageSettings;
	var admin = await AdminByName(account);
	console.log("ADMIN: " + admin);
	pageSettings = admin[setting];

	return pageSettings;

}


//renders options view
router.get('/', PrivilegesHandler.islogedIn, async function(req, res, error){
	var privileges = await PrivilegesHandler.GetPrivileges(req.session.username);
	ServerConf.model.find({}, function (err, conf) {	 

		 	try{

		 		Shift.find({}, async function(err, data){
		 			try{
		 				var reg = conf[0]["allowRegister"];
		 				var show_log = await GetPageSettings(req.session.username, 'show_log') == true ? true : false;
		 				var temp = [];
		 				for(var i = 0; i < data.length; i++){
		 					var t = [];
		 					t.push(data[i]['name']);
		 					t.push(data[i]['hours']);
		 					t.push(data[i]['minutes']);
		 					temp.push(t);
		 				}

		 				var accounts = await Account.getNameList();
		 				res.render("index", {action: "Admin", reg: reg, user: req.session.username, 
		 									page: "options", shifts: temp, accounts: accounts, 
		 									privileges: privileges, QRLOG: show_log, IP:Config.ip, 
		 									PORT: Config.port, MainPageSetting: await GetPageSettings(req.session.username, 'FirstPageName'), 
		 									plugins: require('./admin.js').plugins, wsSecret: req.session.websocketSecret,
		 									AUTOCLEAN: conf[0]['useClean']});

		 			}catch(err){
		 				console.log("catch " + err);
		 			}
		 		})
			}catch(err){
			console.log("catch " + err);
		}

	});
});


router.post('/reset',function(req,res,err){
	 return process.exit(0);
})

//Tallentaa db tiedon onko plugin käytössä
router.post('/pluginsSave',PrivilegesHandler.islogedIn, async function(req,res, err){

	Plugins.findOne({name: req.param('name')}, function(err, plug){
		if(err){
			console.log(err);
			return;
		}
		if(plug != null){

			plug.use = req.param('state') == "true" ? true : false;

			plug.save(function(err){

			});

		}

		res.send('ok');

	});

});

//change if register is allowed.
router.post('/register', PrivilegesHandler.islogedIn, async function(req,res, error){
	var allow_registration = req.param('allowed');
	ServerConf.model.find({}, function (err, conf) {	 

		conf[0]["allowRegister"] = allow_registration;
		

		conf[0].save(function(err){
			if(err){
				console.log(err);
			}else{
				 console.log("saved"); 
				 console.log("-----------------------------------");
			}
		});

	});

	res.send("done");
});


//Tallentaa server conf db modeliin onko lukulaitteen virheilmoitukset käytössä.
router.post('/qr-log', PrivilegesHandler.islogedIn, async function(req,res, error){
	var show_log = req.param('allowed');
	ServerConf.model.find({}, function (err, conf) {	 

		conf[0]["show_log"] = show_log;
		

		conf[0].save(function(err){
			if(err){
				console.log(err);
			}else{
				 console.log("saved"); 
				 console.log("-----------------------------------");
			}
		});

	});

	res.send("done");
});

//Tallentaa server conf db modeliin onko automaattinen puhdistus käytössä.
router.post('/autoclean', PrivilegesHandler.islogedIn, async function(req,res, error){
	var use = req.param('use');
	var time = req.param('time');

	ServerConf.model.find({}, function (err, conf) {	 

		conf[0]["useClean"] = use;
		conf[0]["cleanTime"] = time;

		conf[0].save(function(err){
			if(err){
				console.log(err);
			}else{
				 console.log("saved"); 
				 console.log("-----------------------------------");
			}
		});

	});

	res.send("done");
});


//Tallentaa server conf db modeliin onko miten nimet näytetään (Mallikas Mikko vs Mikko Mallikas).
router.post('/firstpagename', PrivilegesHandler.islogedIn, async function(req,res,error){

	var name = req.body.name;

	Account.model.findOne({username: req.session.username}, function(error, account){
		if(account){
			account["FirstPageName"] = name;

			account.save(function(err){

			});

		}


	})
	res.send('ok');



});




module.exports = router
