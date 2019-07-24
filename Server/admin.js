//NPM PACKAGES (Explanations can be found by googling 'npm -package_name-')

var express = require('express');
var router = express.Router();
const passport = require('passport'); // http://www.passportjs.org/
const LocalStrategy = require('passport-local').Strategy; // http://www.passportjs.org/packages/passport-local/
const logger = require('morgan'); // https://www.npmjs.com/package/morgan
const mongoose = require('mongoose');
const bodyParser = require('body-parser'); // https://www.npmjs.com/package/body-parser
const session = require("express-session");  // https://www.npmjs.com/package/express-session
const cookieParser = require("cookie-parser"); // https://www.npmjs.com/package/cookie-parser
const ejs = require('ejs');
const fs = require('fs');
const path = require('path'); 

// OMAT KOODIT JA MODULIT
var Account = require('./models/admin').model;
var AdminModel = require('./models/admin');
var Config = require('./config');
var Logger = require('./logger.js');
var Extendet = require('./Extented.js');
var PrivilegesHandler = require('./privileges');
var ServerConf = require('./models/config');
var Plugins = require('./models/plugins').plugin;

//SETTING ROUTER USE PACKAGES AND INITIALIZE IT
router.use(cookieParser());
router.use(session( { secret: Config.sessionOptions['secret'], resave: true, saveUninitialized: true, cookie : Config.sessionOptions['cookie'] } ));
router.use(express.static(__dirname + '/public'))
router.use(logger('dev'));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(passport.initialize());
router.use(passport.session());

//ASETETAAN ROUTET KÄYTTÖÖN.
router.use('/', require('./mainpage.js')); // module.exports = router
router.use('/create', require('./createpage.js'));  // module.exports = router
router.use('/client', require('./clientpage.js').router);  // module.exports.router = router
router.use('/options', require('./optionspage.js'));  // module.exports = router
router.use('/backup', require('./backupservice.js'));  // module.exports = router
router.use('/statistic', require('./statisticpage.js').router);  // module.exports.router = router
router.use('/qrcode', require('./qrcode.js').router);  // module.exports.router = router


//SETTING PASSPORT USE PACKAGES AND INITIALIZE IT
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());





/* HOOKING PLUGINS INTO MEMORY. */
var plugins = [];
module.exports.APIPlugin = [];

fs.readdirSync('plugins').forEach(file => {
  var plugin_config = require('./plugins/'+file+'/config.js');


  Plugins.findOne({name: plugin_config.Name}, function(err,plugin){

  		if(plugin == null){

  			var Plug = new Plugins({name: plugin_config.Name, use: true, file: './plugins/' + file + '/config.js'});
  			Plug.save(function(err){
  				if(err == null){
  					plugin_config.Temp.push(true);
  					plugins.push(plugin_config);
  					if(plugin_config.API != undefined && plugin_config.API != null){
  						for(var i = 0; i < plugin_config.API.length; i++){
  							APIPlugin.push(plugin_config.API[i]);
  						}
  					}
	  				if(plugin_config.App != undefined && plugin_config.App != null){
	  					for(var i = 0; i < plugin_config.App.length; i++){
	  						router.use(plugin_config.App[i][1], require('./plugins/'+file+plugin_config.App[i][0]));
	  					}
	  				}
  				}
  			});

  		}else{
  			plugin_config.Temp.push(plugin['use']);
  			plugins.push(plugin_config);
  			if(plugin['use'] == true){
  				if(plugin_config.API != undefined && plugin_config.API != null){
  					for(var i = 0; i < plugin_config.API.length; i++){
  						APIPlugin.push(plugin_config.API[i]);
  					}
  				}
  				if(plugin_config.App != undefined && plugin_config.App != null){
  					for(var i = 0; i < plugin_config.App.length; i++){

  						router.use(plugin_config.App[i][1], require('./plugins/'+file+plugin_config.App[i][0]));
  					}
  				}
  			}
  		}

  });
});

module.exports.plugins = plugins;




var Login = require('./models/client').login;
var Client = require('./models/client').client;



/* Automaattinen puhdistus + conf datan luominen databaseen jos ei olemassa. */
module.exports.clean = function clean(){

	var dataRemoved = 0;
	ServerConf.model.findOne({}, function(err, conf){

		var datenow = new Date();
			datenow.setHours(23);
			datenow.setMinutes(59);
			datenow.setSeconds(59);
			datenow.setDate(1);

		if(!conf){

			datenow.setHours(12);

			var config = new ServerConf.model({
				allowRegister: true,
				LastClean: datenow,
				FirstPageName: 'Mikko M.'
			});

			config.save(function(err){

			});

		}else{


			console.log("LASTCLEAN WAS: " + conf['LastClean'])
			if(conf['LastClean'] != null && conf['LastClean'] != undefined && conf['useClean'] == true){

				

						Client.find({}, function(err, clients){
							console.log('\n'+'\n'+"VAROITUS! AUTOMAATTINEN PUHDISTUS PÄÄLLÄ!" +'\n'+'\n');
							if(!clients){

							}else{

								for(var i = 0; i < clients.length; i++){

									var client = clients[i];

									if(client['loggins'] && client['loggins'].length > 0){
										var j = 0;
										while(true){
											var loggin = client['loggins'][j];
											if(loggin == undefined || loggin == null){
												break;
											}else{
												
												var dateDifference = (datenow.getFullYear()*12 + datenow.getMonth()) - (loggin['date'].getFullYear()*12 + loggin['date'].getMonth());
												if(conf['useClean'] + 1 <= dateDifference){
													console.log('\n'+"***************************************")
													console.log("PÄIVÄ DATA POISTETTU - AUTOMAATTINEN PUHDISTUS");
													console.log("Nimi: " + client["firstname"] + " " + client["lastname"]);
													console.log("Päivä data: " + loggin);
													console.log("***************************************"+ '\n')
													client['loggins'].splice(j, 1);
													dataRemoved += 1;
												}else{
													j++;
												}
											}

										}

									}


									client.save(function(err){

										if(err){
											console.log(err);
										}

									});


								}
							}

							console.log("---YHTEENSÄ POISTETTUA DATAA: " + dataRemoved + "kpl---");
							console.log('\n'+'\n'+"AUTOMAATTINEN PUHDISTUS VALMIS!" +'\n'+'\n');

						});

						datenow.setHours(12);
						conf['LastClean'] = datenow;
						conf.save(function(err){

						});

			

			}else{
			
				datenow.setHours(12);
				conf['LastClean'] = datenow;
				conf.save(function(err){
					console.log('CleanDate Set');
				});

			}


		}


	});
}
module.exports.setUp = function(){
	Client.find({}, function(err, clients){
		console.log("Checking updates...");
		var x = 0;
		if(clients){
			
			for(var i = 0; i < clients.length; i++){


				var client = clients[i];



					/* UPDATE CLIENTS HERE IF NEEDED */


				client.save(function(err){
					if(err != null){
						console.log("err: " + err);
					}
				});

			}

		}
		console.log(x + ' amount of Clients updated');

		console.log("Clients are up to date");
	});
}


//post for /login. This route will be executed if passport.authenticate is true, else redirect to root (/admin).
router.post('/login', passport.authenticate('local', {failureRedirect: '/admin'}), async function(req, res) {
		//Setting session username to username that was passed via post.
		req.session.username = req.param('username');


		var key = Extendet.wsKey();
		
		req.session.websocketSecret = key;
		await AdminModel.saveWSKey(req.session.username, key);



		//var file = req.session.username + '.txt';
		//var filepath = '/logs/';
		//WriteInFile(path.join(__dirname, filepath + file),'Uusi kirjautuminen' + '\r\n', req.session.username);
		//Redirect back to root, where islogedIn should now be "true".
	    res.redirect('/admin');
});

//post for /register. This will be executed in every condition.
//Here needed to add if registration is allowed.
router.post("/register", function(req, res, error){


	Account.register(new Account({
    	username : req.body.username,
    	mod_log : true,
    	create_user: true,
	    remove_user: true,
	    mod_user: true,
	    mod_shifts: true,
	    mod_accounts: true,
	    remove_accounts: true,
	    FirstPageName: "Mikko M.",
	    show_log: true
	}),
    req.body.password, function(err, user){
       if(err){            
            console.log(err);            
            return res.send('register');        
		}
		passport.authenticate("local")(req, res, function(){
            res.redirect("/admin");       
      });     
  });
});


//Load Admin account logs..
//This is going to be moved.
router.get('/load/log', PrivilegesHandler.islogedIn, async function(req, res, error){
	var name = req.param('from');
	var file = req.param('from');
	if(file == null ||file == undefined){

	}else{
		file = file + '.txt';
		filepath = '/logs/';
		if (!fs.existsSync(path.join(__dirname, filepath + file))) {
			Logger.WriteInFile(path.join(__dirname, filepath + file),'SYKE LOG ['+name+']'  + '\r\n', name);
			res.download(path.join(__dirname, filepath + file));
		}else{
			res.download(path.join(__dirname, filepath + file));
		}

	}
});

//Remove req username and log out in passport.
router.get('/logout', PrivilegesHandler.islogedIn, function(req, res, error){

	req.logout();
	req.session.username = null;
	res.redirect('/admin');

});

module.exports.router = router
