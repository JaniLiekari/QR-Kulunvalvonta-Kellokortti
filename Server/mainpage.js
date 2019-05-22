//Main route, all routes in this admin file will check if user is admin user is loged in, 
//if not this or any other routes will not be executed.


var express = require('express');
var router = express.Router();

var PrivilegesHandler = require('./privileges');
var Extented = require('./Extented.js');
var Config = require('./config');
var AddDateInfo = require('./clientpage.js').AddDateInfo;

var Client = require('./models/client').client;
var GetAdmins = require('./models/admin').getNameList;
var Login = require('./models/client').login;
var Shift = require('./models/shifts').shift;
var ShiftHandler = require('./models/shifts');
var PageConfig = require('./models/config');

async function GetPageSettings(){
	
	var pageSettings;
	var promise = await PageConfig.model.findOne({}).exec().then((conf) => {
		if(conf)
			pageSettings = conf['FirstPageName'];
	});

	return pageSettings;

}

function personCSVData(firstname, lastname, days, shift){
	this.firstname = firstname;
	this.lastname = lastname;
	this.days = days;
	this.shift = shift;
}

//Generating Table data and sending it to admin.
async function getTable(startDay, endDay, req, res, privileges, rs, vast){

	//AIKA JOSTA TAULUKKO LUODAAN
	startDay = Extented.setDateHMS(startDay, 0,0,1);
	//AIKA JOLLE TAULUKON LUOMINEN LOPETETAAN
	endDay = Extented.setDateHMS(endDay, 23,59,59);
	var pageSettings = await GetPageSettings();


	var searchd = [];
	searchd.push(startDay);
	searchd.push(endDay);
	if(rs == null){
		searchd.push("full_list");
	}else{
		searchd.push(rs);
	}

	console.log(vast);

	if(vast == null){
		searchd.push("full_list");
	}else{
		searchd.push(vast);
	}
	var adminList = await GetAdmins();
	console.log("PAGE SETTINGS: "+pageSettings);
	try{

		//ETSI KAIKKI CLIENTIT
		Client.find({}, function (err, clients) {	
			//JOS EI CLIENTEJÄ LÖYDY ETSITÄÄN KAIKKI VUOROT VAIN JA NE LÄHETETÄÄN.
			if(!clients){

				Shift.find({}, function(err, s){
						if(shifts == null){
							res.render("index", {action: "Admin", user: req.session.username, page: "main", IP:Config.ip, PORT: Config.port, PAGESETTINGS: pageSettings, SEARCHD: searchd, plugins: require('./admin.js').plugins, wsSecret: req.session.websocketSecret});

						}
			 			try{
			 				var temp = [];
			 				for(var i = 0; i < s.length; i++){
			 					var t = [];
			 					t.push(s[i]['name']);
			 					t.push(s[i]['hours']);
			 					t.push(s[i]['minutes']);
			 					temp.push(t);
			 				}

			 				res.render("index", {action: "Admin", user: req.session.username, page: "main", shifts: temp, IP:Config.ip, PORT: Config.port, PAGESETTINGS: pageSettings, SEARCHD: searchd, vastuu: adminList, plugins: require('./admin.js').plugins, wsSecret: req.session.websocketSecret});
			 			}catch(err){
			 				console.log("catch " + err);
			 			}
		 		})
	
			}else{
				clients.sort(function(a,b){
						if(pageSettings == "Mikko M." || pageSettings == "Mikko Mallikas"){
							return a['firstname'] < b['firstname'] ? -1 : a['firstname'] > b['firstname'] ? 1 : a['lastname'] < b['lastname'] ? -1 : a['lastname'] > b['lastname'] ? 1 : 0;
						}else if(pageSettings == "Mallikas M."){
							return a['lastname'] < b['lastname'] ? -1 : a['lastname'] > b['lastname'] ? 1 : a['firstname'] < b['firstname'] ? -1 : a['firstname'] > b['firstname'] ? 1 : 0;
						}
				});

				var data = [];
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
							for(var x = 0; x < clients.length; x++){
								var exists = false;
								if(clients[x]['loggins'].length != 0){
									for(var i = 0; i < clients[x]['loggins'].length; i++){
										var y = z_day.getFullYear();
										var m = z_day.getMonth();
										var d = z_day.getDate();



										var cf = clients[x]['loggins'][i]['date'];
										var cy = cf.getFullYear();
										var cm = cf.getMonth();
										var cd = cf.getDate();

										if(y == cy && m == cm && d == cd){
											exists = true;
										}
										if(clients[x]['loggins'][i]['workDay'] == null || clients[x]['loggins'][i]['workDay'] == undefined){
											clients[x]['loggins'][i]['workDay'] = clients[x]['workDays'][z_day.getDay()];
										}
									}
								}else{

									clients[x]['loggins'].push(new Login({ date: z_day, workDay: clients[x]['workDays'][z_day.getDay()]}));
					  				exists = true;
								}
								if(exists == false){


									
									AddDateInfo("", "", clients[x], z_day, clients[x]['workDays'][z_day.getDay()], false);
									


								}
							}


						}
						z++;
					}
		
				}

				//FIRST ELEMENT IN DATA IS REQUEST DATES!
				data.push(alldays);
			 	try{
			 		if(clients != null){
			 		
			 			var i;
				  		for(i = 0; i < clients.length; i++){
				  			if(rs != null){
				  				if(clients[i]['shift'] != rs){
				  					continue;
				  				}
				  			}
				  			if(vast != null && vast != "no_add"){
				  				if(clients[i]['vastuu'] != vast){
				  					continue;
				  				}
				  			}
				  			if(vast == "no_add"){
				  				if(clients[i]['vastuu'] != null){


				  					var found = false;

				  					for(var a = 0; a < adminList.length; a++){
				  						if(adminList[a] == clients[i]['vastuu'])
				  							found = true;
				  					}
				  					if(found == true)
				  						continue;
				  				}
				  			}
				  			if(clients[i]['loggins'].length != 0){
				  				var length = clients[i]['loggins'].length;
				  				var personData = null;
				  				for(var j = length - 1; j >= 0; j--){
				  					var c_date = clients[i]['loggins'][j]['date'];

				  					c_date.setHours(0);
									c_date.setMinutes(0);
									c_date.setSeconds(2);
				  					if(c_date >= startDay && c_date < endDay){
				  						if(personData === null){
				  							personData = [];
				  						}
				  						var dayData = [];
				  						dayData.push(c_date);
				  						if(clients[i]['loggins'][j]['loginTime'] !== null){
				  							dayData.push(clients[i]['loggins'][j]['loginTime']);
				  						}else{
				  							dayData.push(null);
				  						}
				  						if(clients[i]['loggins'][j]['logoutTime'] !== null){
				  							dayData.push(clients[i]['loggins'][j]['logoutTime']);
				  						}else{
				  							dayData.push(null);
				  						}

				  						dayData.push(clients[i]['loggins'][j]['workDay']);
				  						dayData.push(clients[i]['workDays']);
				  						dayData.push(c_date.getDay());
				  						personData.push(dayData);

				  					}
				  					else if(c_date <= startDay){
				  						break;
				  					}else{
				  						if(personData !== null){
				  							personData.push(null);
				  						}
				  					}
				  				}
				  				if(personData !== null){
				  					if(data === null){
				  						data = [];
				  					}
				  					personData.sort(function(a,b){
				  						return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;
				  					});
				  					data.push(new personCSVData(clients[i]['firstname'], clients[i]['lastname'], personData, clients[i]['shift']));
				  				}else{
				  					if(data === null){
				  						data = [];
				  					}
				  					data.push(new personCSVData(clients[i]['firstname'], clients[i]['lastname'], null, clients[i]['shift']));
				  				}
				  			}else{
				  				if(data === null){
				  						data = [];
				  				}
				  				data.push(new personCSVData(clients[i]['firstname'], clients[i]['lastname'], null, clients[i]['shift']));
				  			}
				  		}
				  		Shift.find({}, function(err, s){
				 			try{
				 				var temp = [];
				 				for(var i = 0; i < s.length; i++){
				 					var t = [];
				 					t.push(s[i]['name']);
				 					t.push(s[i]['hours']);
				 					t.push(s[i]['minutes']);
				 					temp.push(t);
				 				}
				 				res.render("index", {action: "Admin", user: req.session.username, page: "main", data: data, privileges: privileges, shifts: temp,IP:Config.ip, PORT: Config.port, PAGESETTINGS: pageSettings, SEARCHD: searchd, vastuu: adminList,  plugins: require('./admin.js').plugins, wsSecret: req.session.websocketSecret});
				 			}catch(err){
				 				console.log("catch " + err);
				 			}
			 			})
			  		}
				}catch(err){
					console.log("catch " + err);
				}
			}
		});
	}catch(error){
		console.log(error);
	}
}





router.get('/', PrivilegesHandler.islogedIn, async function (req, res) {

	var privileges = await PrivilegesHandler.GetPrivileges(req.session.username);

	var request = "table";
	var startDay = req.param("startDay");
	if(startDay === null || startDay === undefined ||startDay === ""){
		startDay = Extented.getMonday(new Date());
	}else{
		startDay = new Date(startDay);
	}
	var endDay = req.param('endDay');
	if(endDay === null || endDay === undefined || endDay === ""){
		endDay = Extented.getMonday(new Date());
		endDay = new Date(endDay.setDate(endDay.getDate() + 4));
	}else{
		endDay = new Date(endDay);
	}
	var shift = req.param('shift');
	if(shift == null || shift == "" ||shift == undefined || shift == "full_list"){
		shift = null;
	}
	var vastuu = req.param('vastuu');
	if(vastuu == null || vastuu == "" || vastuu == undefined || vastuu == "full_list"){
		vastuu = null;
	}

	var _data;

	if(request === "table"){
		getTable(startDay, endDay, req, res, privileges, shift, vastuu); 
	}
});


module.exports = router;