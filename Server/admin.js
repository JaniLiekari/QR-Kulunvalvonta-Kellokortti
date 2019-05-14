//NPM PACKAGES (Explanations can be found by googling 'npm -package_name-')

var express = require('express');
var router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const logger = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require("express-session");
const cookieParser = require("cookie-parser");
const ejs = require('ejs');
const fs = require('fs');
const path = require('path'); 

//OWN CODES / MODELS

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


router.use('/', require('./mainpage.js'));
router.use('/create', require('./createpage.js'));
router.use('/client', require('./clientpage.js').router);
router.use('/options', require('./optionspage.js'));
router.use('/backup', require('./backupservice.js'));
router.use('/statistic', require('./statisticpage.js'));
router.use('/qrcode', require('./qrcode.js').router);

//SETTING PASSPORT USE PACKAGES AND INITIALIZE IT

passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());


var plugins = []; 




/* HOOKING PLUGINS */
fs.readdirSync('plugins').forEach(file => {
  var plugin_config = require('./plugins/'+file+'/config.js');


  Plugins.findOne({name: plugin_config.Name}, function(err,plugin){

  		if(plugin == null){

  			var Plug = new Plugins({name: plugin_config.Name, use: true, file: './plugins/' + file + '/config.js'});
  			Plug.save(function(err){
  				if(err == null){
  					plugin_config.Temp.push(true);
  					plugins.push(plugin_config);
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

module.exports.clean = function clean(){


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



			if(conf['LastClean'] != null && conf['LastClean'] != undefined){

				var lastClean = conf['LastClean'];

				if(datenow > conf['LastClean']){
					
					var difference = (datenow.getFullYear()*12 + datenow.getMonth()) - (lastClean.getFullYear()*12 + lastClean.getMonth());
					if(difference >= 3){
						console.log("Cleaning database");


						Client.find({}, function(err, clients){

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
										
												if(loggin['date'] < lastClean){
													client['loggins'].splice(j, 1);
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

						});

						datenow.setHours(12);
						conf['LastClean'] = datenow;
						conf.save(function(err){

						});

					}else{
						console.log("No need to clean");
					}


				}else{
					console.log("No need to clean");
				}

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
		if(clients){
			var x = 0;
			for(var i = 0; i < clients.length; i++){
				if(clients[i]['workDays'] == null ||clients[i]['workDays'] == undefined){
					x++;
					var workDays = [false, true, true, true, true, true, false];
					clients[i]['workDays'] = workDays;
					clients[i].save(function(err){

					});

				}

				var AddDateInfo = require('./clientpage.js').AddDateInfo;

				if(clients[i]['loggins'] != null && clients[i]['loggins'].length > 0){

					var added = false;

					var today = new Date();


					for(var j = 0; j < clients[i]['loggins'].length; j++){

						var log = clients[i]['loggins'][j]['date'];
						if(log.getDate() == today.getDate() && log.getMonth() == today.getMonth() && log.getFullYear() && today.getFullYear()){
							added = true;
							break;
						}
					
					}

					if(!added){
						AddDateInfo("", "", clients[x], today, clients[i]['workDays'][today.getDay()], true);
					}
				}

			}
			console.log(x + ' amount of Clients updated');
		}
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
	    remove_accounts: true
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
