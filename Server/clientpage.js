var express = require('express');
var router = express.Router();

var PrivilegesHandler = require('./privileges');
var Extented = require('./Extented.js');
var Client = require('./models/client').client;
var ShiftHandler = require('./models/shifts');
var Config = require('./config');
var Login = require('./models/client').login;
var Logger = require('./logger.js');

var GetAdmins = require('./models/admin').getNameList;
var path = require('path');

var PageConfig = require('./models/config');

async function GetPageSettings(){
	
	var pageSettings;
	var promise = await PageConfig.model.findOne({}).exec().then((conf) => {
		if(conf)
			pageSettings = conf['FirstPageName'];
	});

	return pageSettings;

}


//Store person datas for csv and other arrays.
function personCSVData(firstname, lastname, days, shift, work){
	this.firstname = firstname;
	this.lastname = lastname;
	this.days = days;
	this.shift = shift;
	this.workDay = work;
}

//Modify/Add new date info to client. And saving that into database.
var AddDateInfo = function (in_time, out_time, client, day, isWorkDay, save = true){

	var x = client['loggins'].length - 1;
	var added = false;
	for(x; x >= 0; x--){
		client_d = client['loggins'][x]['date'].getDate();
		client_m = client['loggins'][x]['date'].getMonth();
		client_y = client['loggins'][x]['date'].getFullYear();
		if(client_d == day.getDate() && client_m == day.getMonth() && client_y == day.getFullYear()){
			if(in_time == "" && out_time == ""){
				client['loggins'].splice(x,1, new Login({ date: day, workDay: isWorkDay}));
			}else{
				if(in_time == ""){
					client['loggins'].splice(x,1, new Login({ date: day, logoutTime: out_time, workDay: isWorkDay}));
				}else if(out_time == ""){
					client['loggins'].splice(x,1, new Login({ date: day, loginTime: in_time, workDay: isWorkDay}));
				}else{

					client['loggins'][x]['loginTime'] = in_time;
					client['loggins'][x]['logoutTime'] = out_time;
					client['loggins'][x]['workDay'] = isWorkDay;
				}
			}

			added = true;
			break;
		}
	}
	if(!added){
		if(in_time != "" || out_time != "")
			client['loggins'].push(new Login({ date: day, loginTime: in_time,logoutTime: out_time, workDay: isWorkDay}));
		else{

			client['loggins'].push(new Login({ date: day, workDay: isWorkDay}));
		}
	}
	client['loggins'].sort(function(a,b){
		return a['date'] - b['date'];
	});
	if(save){
		client.save(function(err){
			console.log("Saving");
			if(err){
			}else{
			}
		});
	}
}

module.exports.AddDateInfo = AddDateInfo;

//post route to sending edited info for client login/logout data.
router.post('/edit', PrivilegesHandler.islogedIn, async function(req, res, error){

	var privileges = await PrivilegesHandler.GetPrivileges(req.session.username);
	if(privileges[0] != true){
		res.send('400');
		return;
	}

	var f_name = req.body.firstname;
	var l_name = req.body.lastname;

	f_name = Extented.Uppercase(f_name);
	l_name = Extented.Uppercase(l_name);

	var d = new Date(req.body.ddate);
	var in_time = req.body.din;
	if(in_time != ""){
		in_time = new Date(in_time);
		console.log(-in_time.getTimezoneOffset());
		in_time.setHours(in_time.getHours() - (-in_time.getTimezoneOffset() / 60));
	}
	var out_time = req.body.dout;
	if(out_time != ""){
		out_time = new Date(out_time);
		out_time.setHours(out_time.getHours() - (-out_time.getTimezoneOffset() / 60));
	}
	console.log(d);

	var isWorkDay = req.body.isWorkDay;

	console.log("IS WORK DAY: "+isWorkDay);

	var file = req.session.username + '.txt';
	var filepath = '/logs/';
	/*Logger.WriteInFile(path.join(__dirname, filepath + file),'-----Kävijän kirjautumistietojen muokkaus------', req.session.username);
	Logger.WriteInFile(path.join(__dirname, filepath + file),'Kohde: ' +f_name + " " + l_name, req.session.username);
	Logger.WriteInFile(path.join(__dirname, filepath + file),'Sisään: ' + ((in_time != "") ? in_time : "Tyhjä"), req.session.username);
	Logger.WriteInFile(path.join(__dirname, filepath + file),'Ulos: ' + ((out_time != "") ? out_time : "Tyhjä"), req.session.username);
	Logger.WriteInFile(path.join(__dirname, filepath + file),'---------Muokkaus loppu---------' + '\r\n', req.session.username);*/


	try{

		Client.findOne({firstname: f_name, lastname: l_name}, function (err, client) {	 

			if(err){
				console.log(err);
				res.end();
			}
			else if(!client){
				res.end();
			}else{
			 	try{
			 		if(client!= null){
			 			if(client['loggins'] != null && client['loggins'].length > 0){
			 				console.log("This");
			 				AddDateInfo(in_time, out_time, client, d, isWorkDay);
			 				res.send('ok');

			 			}else if(in_time != "" || out_time != ""){
			 				console.log("client dont have Loggin data"); 
			 				client['loggins'].push(new Login({ date: d, loginTime: in_time,logoutTime: out_time, workDay: isWorkDay}));
			 				client['loggins'].sort(function(a,b){
				  							return a['date'] - b['date'];
				  			});
			 				client.save(function(err){
					  			if(err){
					  				console.log(err);
					  				res.send("failed");
					  				res.end();
					  			}else{
					  				res.send("ok");
					  				res.end();
					  			}
			  				});
			 			}

			  		}
				}catch(err){
					console.log("catch " + err);
					res.send("failed");
				}
			}
		});
	}catch(error){
		console.log(error);
		res.send("failed");
	}
});


/*router.get('/fix', function(req,res,error){
	console.log("fixing");
	Client.find({}, function(err, clients){

		for(var i = 0; i < clients.length; i++){
			var client = clients[i];

			if(client['loggins'].length > 0 ){

				var j = 0;
				while(j < client['loggins'].length){

					var login = client['loggins'][j]['date'];

					if(login.getFullYear() >= 2019 && login.getMonth() >= 1  && login.getDate() >= 19){
						client['loggins'].splice(j,1);
						console.log("remove date: " + login);
					}else{
						j++;
					}


				}

			}

			client.save(function(err){

			})

		}

	});

});*/


function similarity(s1, s2) {
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0)
        costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

//rendering client modifying page
router.get('/info', PrivilegesHandler.islogedIn, async function(req, res, error){
	var f_name = req.param('firstname');
	var l_name = req.param('lastname');
	var privileges = await PrivilegesHandler.GetPrivileges(req.session.username);

	if(f_name == "" || f_name == undefined || l_name == "" || l_name == undefined){

		if(f_name != "" && f_name != undefined){
			Client.find({}, function(err, client){
				if(client){

					var names = [];

					for(var i = 0; i < client.length; i++){
						var sim = similarity(f_name, client[i]['firstname']);

						console.log(sim + " " + client[i]['firstname'])

						if(sim > 0.6){
							var data = [];
							data.push(client[i]['firstname']);
							data.push(client[i]['lastname']);
							data.push(sim);

							names.push(data);
						}
					}


					names.sort(function(a,b){
						return a[2] < b[2] ? 1 : a[2] > b[2] ? -1 : a[0] < b[0] ? -1 : a[1] > b[1] ? 1 : 0;
					});

					
					res.render("index", {action: "Admin", user: req.session.username, page: "modify-client", data: null, privileges: privileges, names: names, shifts: null, IP:Config.ip, PORT: Config.port, pageSettings: null, plugins: require('./admin.js').plugins,wsSecret: req.session.websocketSecret,});
				}else{
					res.render("index", {action: "Admin", user: req.session.username, page: "modify-client", data: null, privileges: privileges, names: null, shifts: null, IP:Config.ip, PORT: Config.port, pageSettings: null, plugins: require('./admin.js').plugins, wsSecret: req.session.websocketSecret});
				}
			});

		}else if(l_name != "" && l_name != undefined){

			Client.find({}, function(err, client){
				if(client){

					var names = [];

					for(var i = 0; i < client.length; i++){
						var sim = similarity(l_name, client[i]['lastname']);

						console.log(sim + " " + client[i]['lastname'])

						if(sim > 0.6){
							var data = [];
							data.push(client[i]['firstname']);
							data.push(client[i]['lastname']);
							data.push(sim);

							names.push(data);
						}
					}


					names.sort(function(a,b){
						return a[2] < b[2] ? 1 : a[2] > b[2] ? -1 : a[0] < b[0] ? -1 : a[1] > b[1] ? 1 : 0;
					});

					
					res.render("index", {action: "Admin", user: req.session.username, page: "modify-client", data: null, privileges: privileges, names: names, shifts: null, IP:Config.ip, PORT: Config.port, pageSettings: null, plugins: require('./admin.js').plugins, wsSecret: req.session.websocketSecret});
				}else{
					res.render("index", {action: "Admin", user: req.session.username, page: "modify-client", data: null, privileges: privileges, names: null, shifts: null, IP:Config.ip, PORT: Config.port, pageSettings: null, plugins: require('./admin.js').plugins, wsSecret: req.session.websocketSecret});
				}
			});

		}else{
			Client.find({}, async function(err, client){
				if(client){

					var pageSettings = await GetPageSettings();

					console.log("Tämä");
					console.log(pageSettings);

					client.sort(function(a,b){

						if(pageSettings == "Mikko M." || pageSettings == "Mikko Mallikas"){
							return a['firstname'] < b['firstname'] ? -1 : a['firstname'] > b['firstname'] ? 1 : a['lastname'] < b['lastname'] ? -1 : a['lastname'] > b['lastname'] ? 1 : 0;
						}else if(pageSettings == "Mallikas M."){
							return a['lastname'] < b['lastname'] ? -1 : a['lastname'] > b['lastname'] ? 1 : a['firstname'] < b['firstname'] ? -1 : a['firstname'] > b['firstname'] ? 1 : 0;
						}

					});

					var names = [];
					for(var i= 0; i < client.length; i++){
						var hold = [];
						hold.push(client[i]['firstname']);
						hold.push(client[i]['lastname']);

						names.push(hold);
					}

					res.render("index", {action: "Admin", user: req.session.username, page: "modify-client", data: null, privileges: privileges, names: names, shifts: null, IP:Config.ip, PORT: Config.port, pageSettings: pageSettings, plugins: require('./admin.js').plugins, wsSecret: req.session.websocketSecret});
				}else{
					res.render("index", {action: "Admin", user: req.session.username, page: "modify-client", data: null, privileges: privileges, names: null, shifts: null, IP:Config.ip, PORT: Config.port, pageSettings: null, plugins: require('./admin.js').plugins, wsSecret: req.session.websocketSecret});
				}
			});
		}
	}else{
		try{
			f_name = Extented.Uppercase(f_name);
			l_name = Extented.Uppercase(l_name);

			console.log(f_name);
			var shifts = await ShiftHandler.GetShifts();
			//FIND REQUEST CLIENT
			Client.findOne({firstname: f_name, lastname: l_name}, async function (err, client) {	 


					var monday = Extented.getMonday(new Date());
					var sunday = Extented.getMonday(new Date());
					sunday = new Date(sunday.setDate(sunday.getDate() + 4));
					monday = Extented.setDateHMS(monday, 0,0,1);
					sunday = Extented.setDateHMS(sunday, 23, 59,59);

				if(err){
					console.log(err);
				}else if(!client){
					res.render("index", {action: "Admin", user: req.session.username, page: "modify-client", data: null, privileges: privileges, names: null, shifts: shifts, IP:Config.ip, PORT: Config.port, pageSettings: null, plugins: require('./admin.js').plugins, wsSecret: req.session.websocketSecret});
				}else{
					var vast = (client['vastuu'] != null) ? client['vastuu'] : "Ei lisätty";
					var data = [];
					data['qr'] = client['id'];
					data['name'] = f_name + " " + l_name;
					data['firstname'] = f_name;
					data['lastname'] = l_name;
					if(client['shift'])
						data['shift'] = client['shift'];
					else{
						data['shift'] = "undefined";
					}
					if(client['unit'])
						data['unit'] = client['unit'];
					else{
						data['unit'] = "undefined";
					}

					var average_Time = 0;
					var times = 0;

					var average_activity_per_week = 0;
					var week_times = 0;
					var maxTime = null;
					var minTime = null;

					var lastWeek = -1;

					var startDay = req.param("startDay");
					if(startDay === null || startDay === undefined || startDay === ""){
						startDay = new Date();
						startDay.setDate(1);
					}else{
						startDay = new Date(startDay);
					}
					var endDay = req.param('endDay');
					if(endDay === null || endDay === undefined || endDay === ""){
						endDay = new Date();
						endDay.setMonth(endDay.getMonth() + 1);
						endDay.setDate(0);
					}else{
						endDay = new Date(endDay);
					}

					startDay = Extented.setDateHMS(startDay, 0,0,1);
					endDay = Extented.setDateHMS(endDay, 23,59,59);


					var alldays = [];
					var z = 0;

					//BUILDING LIST OF REQUST DAYS....

					while(true){
						z_day = Extented.setDateHMS(new Date(startDay),0,0,1);
						var z_day = new Date(z_day.setDate(z_day.getDate() + z));

						//IF z_day is higer than last request date then break.
						if(z_day > endDay){
							break;
						}else{

							//ADD DAY IF DAY IS NOT 0 = SUNDAY AND 6 = SATURDAY
							if(z_day.getDay() != 0 && z_day.getDay() != 6){

								alldays.push(z_day);
								var exists = false;

								for(var i = 0; i < client['loggins'].length; i++){
									var y = z_day.getFullYear();
									var m = z_day.getMonth();
									var d = z_day.getDate();

									var cf = client['loggins'][i]['date'];
									var cy = cf.getFullYear();
									var cm = cf.getMonth();
									var cd = cf.getDate();

									if(y == cy && m == cm && d == cd){
										console.log(cf + " >>>>>> " + z_day);
										exists = true;
									}
									if(client['loggins'][i]['workDay'] == null || client['loggins'][i]['workDay'] == undefined){
										console.log("WorkDay Data not exists");
										client['loggins'][i]['workDay'] = client['workDays'][z_day.getDay()];
										
									}
								}

								if(!exists){
									console.log("Date not exists");
									AddDateInfo("", "", client, z_day, client['workDays'][z_day.getDay()], false);

								}


							}



						z++;
						}
	
					}
					data['loggin'] = [];
					data['loggin'].push(alldays);
					console.log("AllDAYS: "+alldays);
					var tempWeekLoginTime = [];
					//Building client login data
		 			try{
		 				if(client != null){
			  				if(client['loggins'].length != 0){
			  					var length = client['loggins'].length;
			  					var personData = null;
			  					for(var j = 0; j < length; j++){
			  						var c_date = client['loggins'][j]['date'];
	  								c_date.setHours(0);
									c_date.setMinutes(0);
									c_date.setSeconds(2);

									if(c_date >= monday && c_date < sunday){
										if(client['loggins'][j]['loginTime'] != null && client['loggins'][j]['logoutTime'] != null && client['loggins'][j]['loginTime'] != undefined && client['loggins'][j]['logoutTime'] != undefined && client['loggins'][j]['loginTime'] != "" && client['loggins'][j]['logoutTime'] != ""){
											var dayData = [];
											dayData.push(client['loggins'][j]['loginTime']);
											dayData.push(client['loggins'][j]['logoutTime']);
											tempWeekLoginTime.push(dayData);
										}
									}

			  						if(c_date >= startDay && c_date < endDay && c_date.getDay() != 0 && c_date.getDay() != 6){
			  							if(personData === null){
			  								personData = [];
			  							}
			  							var dayData = [];
			  							dayData.push(c_date);
										if(client['loggins'][j]['loginTime'] !== null && client['loggins'][j]['loginTime'] !== undefined){
			  								dayData.push(client['loggins'][j]['loginTime']);
			  							}else{
			  								dayData.push(null);
			  							}
										if(client['loggins'][j]['logoutTime'] !== null  && client['loggins'][j]['logoutTime'] !== undefined){
	  										dayData.push(client['loggins'][j]['logoutTime']);
	    								}else{
			  								dayData.push(null);
										}

										dayData.push(client['loggins'][j]['workDay']);
			  							personData.push(dayData);
			  							console.log(dayData);

			  						}
			  						else if(c_date > endDay && c_date > sunday){
			  							console.log("Date is larger than end day: " + c_date);
			  							break;
			  						}else{
			  							console.log("Date is smaller than start day: " + c_date);
			  							if(personData !== null){
			  								//personData.push(null);
			  							}
			  						}
			  					}
			  					if(personData !== null){
			  						if(data === null){
			  							data['loggin'] = [];
			  						}
			  						data['loggin'].push(new personCSVData(client['firstname'], client['lastname'], personData));
			  					}else{
			  						if(data === null){
			  							data = [];
			  						}
			  						data.push(new personCSVData(clients[i]['firstname'], clients[i]['lastname'], null));
			  					}
			  				}else{
			  					if(data['loggin'] === null){
			  						data['loggin'] = [];
			  					}
			  					data.push(new personCSVData(client['firstname'], client['lastname'], null));
			  				}
			  			}
					}catch(err){
						console.log("catch " + err);
					}

					//Get fulltime spend and min-max time spend loggin.
					if(client['loggins'] != null && client['loggins'].length >= 1){
						for(var i = 0; i < client['loggins'].length; i++){
							if(client['loggins'][i]['loginTime'] != null && client['loggins'][i]['logoutTime'] != null){
								var a = new Date(client['loggins'][i]['loginTime']);
								var b = new Date(client['loggins'][i]['logoutTime']);
								var seconds = (b-a);
								average_Time += seconds;
								times += 1;

								if(seconds > maxTime || maxTime == null){
									maxTime = seconds;
								}
								if(seconds < minTime || minTime == null){
									minTime = seconds;
								}

							}


						}
					}

					var tempWeek = 0;
					var tempWeekTimes = 0;
					if(tempWeekLoginTime != null && tempWeekLoginTime.length >= 1){
						for(var i = 0; i < tempWeekLoginTime.length; i++){
		
							var a = tempWeekLoginTime[i][0];
							var b = tempWeekLoginTime[i][1];
							var seconds = (b-a);
							tempWeek += seconds;
							tempWeekTimes += 1;

						}
					}

					if(tempWeekTimes != 0){
						tempWeek = (tempWeek/tempWeekTimes) /1000 / 60 / 60;
						var h = Math.floor(tempWeek);
						var minutes = Math.abs(Math.round((tempWeek - h) * 60));
						tempWeek = h + "h " + (("0" + minutes).slice(-2)) + "min";
					}else{
						tempWeek = "Ei ehjiä kirjautumis tietoja";
					}

					//Change fulltime spend into avarage time spend loggin.
					if(times != 0){
						average_Time = (average_Time/times) /1000 / 60 / 60;
						var h = Math.floor(average_Time);
						var minutes = Math.abs(Math.round((average_Time - h) * 60));
						average_Time = h + "h " + (("0" + minutes).slice(-2)) + "min";
					}else{
						average_Time = "Unknow";
					}

					//change max time into h:min
					maxTime = maxTime / 1000 / 60 / 60;
					var maxTime_h = Math.floor(maxTime);
					var maxTime_m = Math.abs(Math.round((maxTime- maxTime_h) * 60));
					maxTime = maxTime_h + "h" + (("0" + maxTime_m).slice(-2)) + "min";

					//change min time into h:min
					minTime = minTime / 1000 / 60 / 60;
					var minTime_h = Math.floor(minTime);
					var minTime_m = Math.abs(Math.round((minTime - minTime_h) * 60));
					minTime = minTime_h + "h" + (("0" + minTime_m).slice(-2)) + "min";

					//adding this into data.
					data['average_Time'] = average_Time;
					data['maxTime'] = maxTime;
					data['minTime'] = minTime;
					data['average_Week'] = tempWeek;

					var adminList = await GetAdmins();
					res.render("index", {action: "Admin", user: req.session.username, page: "modify-client", data: data, privileges: privileges, names: null, shifts: shifts, IP:Config.ip, PORT: Config.port, workDays: client['workDays'], vastuu: vast, admins: adminList, pageSettings: null, plugins: require('./admin.js').plugins, wsSecret: req.session.websocketSecret});
				}
			});
		}catch(error){
			console.log(error);
			res.send("failed");
		}
	}
});


//remove client
router.post('/remove', PrivilegesHandler.islogedIn, async function(req,res, error){

	var code = req.param('code');
	var privileges = await PrivilegesHandler.GetPrivileges(req.session.username);

	if(privileges[2] != true){
		res.send('400');
		return;
	}
	Client.findOne({id:code}, function(err, client){
		if(client){
			var file = req.session.username + '.txt';
			var filepath = '/logs/';
			Logger.WriteInFile(path.join(__dirname, filepath + file),'-----Kävijän poistaminen------', req.session.username);
			Logger.WriteInFile(path.join(__dirname, filepath + file),'Kohde: ' + client['firstname'] + " " + client['lastname'], req.session.username);
			Logger.WriteInFile(path.join(__dirname, filepath + file),'---------Poistaminen loppu---------' + '\r\n', req.session.username);
		}
	})
	Client.deleteOne({id:code}, function(err){

		if(err){console.log("can do nothing");}

	});

	res.send("ok");
});


router.post('/mod', PrivilegesHandler.islogedIn, async function(req,res,error){

	var qr = req.param('qr');
	console.log('QR='+qr);
	var f = req.param('fname');
	var l = req.param('lname');
	var shift = req.param('shift');
	var vastuu = req.param('vastuu');

	var workDays = JSON.parse(req.param('workDays'));

	var privileges = await PrivilegesHandler.GetPrivileges(req.session.username);
	
	if(privileges[3] != true){
		res.send('400');
		return;
	}
	
	Client.findOne({id:qr}, function(err, client){

		if(!client){
			res.send('400');
			return;
		}

		if(f != null && f != undefined && f != ""){
			f = Extented.Uppercase(f);
			client['firstname'] = f;
		}
		if(l != null && l != undefined && l != ""){
			l = Extented.Uppercase(l);
			client['lastname'] = l;
		}
		if(shift != null && shift != undefined && shift != ""){
			client['shift'] = shift;
		}
		if(vastuu != null){
			if(vastuu == "ei_vast"){
				client['vastuu'] = null;
			}else{
				client['vastuu'] = vastuu;
			}
			
		}

		client['workDays'] = workDays;

		client.save(function(err){
			if(err){
				res.send('400');
				console.log(err);
			}else{
				 res.send('ok');
			}
		});
	});
});



module.exports.router = router;