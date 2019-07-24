var express = require('express');
var router = express.Router();
var PrivilegesHandler = require('./privileges');
var Config = require('./config');

var Client = require('./models/client').client;

var ShiftHandler = require('./models/shifts');
var ServerConf = require('./models/config');
var AdminByName = require('./models/admin').getAccount;

async function GetPageSettings(account, setting){
	
	var pageSettings;
	var admin = await AdminByName(account);
	console.log("ADMIN: " + admin);
	pageSettings = admin[setting];

	return pageSettings;

}

/* POLUT ALIMPANA, SIELTÄ HYVÄ LÄHTEÄ AVAAMAAN */
function ChartHeaders(headers, data){
	this.headers = headers;
	this.data = data;
}
function UserChartData(date, users, absence){
	this.date = date,
	this.users = users,
	this.absence = absence
}
function StatData(currentini,currentinb,currentino,Estimate,missing,clients){
	this.currentini = currentini,
	this.currentinb = currentinb,
	this.currentino = currentino,
 	this.Estimate = Estimate,
 	this.missing = missing,
 	this.clients = clients
}


/* Palauttaa kaikki käyttäjät */
async function GetUsers(filter){

	var ret = null;

	await Client.find({}).exec().then((clients) => {
		ret = clients;
		if(clients && filter != null && filter != undefined && filter['shift'] != null && filter['shift'] != undefined){
				var filtered = [];
				for(var i = 0; i < clients.length; i++){
					if(filter['shift'] != null && filter['shift'] != undefined){
						if(clients[i]['shift'] == filter['shift']){
							filtered.push(clients[i]);
						}
					}

				ret = filtered;
			}
		}
		
	});

	return ret;
}


/* Tällä hetkellä kirjautuneet, pois kirjautuneen ja molemmat */
function GetNowInUsers(today, users, type){

	var day = today.getDate();
	var month = today.getMonth();
	var year = today.getFullYear();

	var amount = 0;

	for(var i = 0; i < users.length; i++){

		var current = users[i];

		for(var j = current['loggins'].length - 1; j >= 0; j--){

			var loggin = current['loggins'][j];
			/* Tässä sääntö */
			if((type=="onlyLogin" && loggin['loginTime'] != null && loggin['logoutTime'] == null) || (type=="both" && loggin['loginTime'] != null) || (type=="onlyLogout" && loggin['loginTime'] != null && loggin['logoutTime'] != null) ){
				var uDate = loggin['date'];
				var uDay = uDate.getDate();
				var uMonth = uDate.getMonth();
				var uYear = uDate.getFullYear();

				if(uDay == day && uMonth == month && uYear == year){	
					amount+=1;
				}

			}

		}

	}

	return amount;
}

/* Koko data kirjautumisista (Poissaolot, aloituspäivät etc..) */
async function GetUsersAndLogins(users, today,filter){
	var dateday = today.getDate();
	var month = today.getMonth();
	var year = today.getFullYear();


	var usr = [];
	var absence = [];
	for(var i = 0; i < users.length; i++){

		var current = users[i];
		var dateFound = false;
		var disapleCreation = filter != null ? filter['disapleCreation'] : false;

		for(var j = current['loggins'].length - 1; j >= 0; j--){

			var loggin = current['loggins'][j];
			var uDate = loggin['date'];
			var uDay = uDate.getDate();
			var uMonth = uDate.getMonth();
			var uYear = uDate.getFullYear();


	


			if(uDay == dateday && uMonth == month && uYear == year){
				if(!disapleCreation || filter == null){	

					if(loggin['loginTime'] != null){
							usr.push(current['firstname'] + " " + current['lastname']);
					}else{
						var tempCreate = new Date(current['createDate']);
						tempCreate.setDate(tempCreate.getDate() - 1);
						tempCreate.setSeconds(59);
						tempCreate.setHours(23);
						tempCreate.setMinutes(59);
						console.log("CREATE DATE: " + tempCreate);
				
						if(loggin['workDay'] == true){
							absence.push(current['firstname'] + " " + current['lastname']);
						}
					}

					dateFound = true;
				}else{

					var tempCreate = new Date(current['createDate']);
					tempCreate.setDate(tempCreate.getDate() - 1);
						tempCreate.setSeconds(59);
						tempCreate.setHours(23);
						tempCreate.setMinutes(59);

					if(tempCreate <= uDate){
						if(loggin['loginTime'] != null){
							usr.push(current['firstname'] + " " + current['lastname']);
						}else{
							if(loggin['workDay'] == true){
								absence.push(current['firstname'] + " " + current['lastname']);
							}
						}

						
					}
					dateFound = true;
				}
			}

		}

		if(!dateFound){
			var day = today.getDay();

			var tempCreate = new Date(current['createDate']);
			tempCreate.setDate(tempCreate.getDate() - 1);
			tempCreate.setSeconds(59);
			tempCreate.setHours(23);
			tempCreate.setMinutes(59);
		
			console.log("CREATE DATE VS TODAY: " + tempCreate + " vs " + today);
			if(current['workDays'][day] == true && ((disapleCreation && tempCreate <= today) || !disapleCreation )){
				absence.push(current['firstname'] + " " + current['lastname']);
			}
		}

	}
	return [usr, absence];
}

async function UsersChart(start, end, clients, filter){

	var header = ["", "Kirjautumiset"];
	var data = [];
	
	while(end >= start){


		if(end.getDay() != 0 && end.getDay() != 6){

			var temp = await GetUsersAndLogins(clients, end, filter);
			var date = end.getDate() + "." + (end.getMonth() + 1 );
			data.push(new UserChartData(date, temp[0], temp[1]));

		}

		end.setDate(end.getDate() - 1);

	}

	data.reverse();

	return new ChartHeaders(header, data);
}

async function GetEstimate(start, end, clients, filter){

	var total = 0;
	var missing = 0;
	var curDate = new Date(start);
		
	while(end >= start){
		if(end.getDay() != 0 && end.getDay() != 6){

			var temp = await GetUsersAndLogins(clients, end, filter);
			console.log(end);
			console.log(temp);
			missing += temp[1].length;
			total += temp[1].length + temp[0].length;
		
		}
		end.setDate(end.getDate() - 1);

	}

	var prosentage = 1 - (missing / total);

	return Math.round(prosentage * 1000) / 10;
}



var GetMissing = async function GetMissing(start, end,clients, filter){

	var amount = 0;
	var curDate = new Date(start);
		
	while(end >= start){

		if(end.getDay() != 0 && end.getDay() != 6){

			var temp = await GetUsersAndLogins(clients, end, filter);
			console.log(end);
			console.log(temp);
			amount += temp[1].length;
		
		}
		end.setDate(end.getDate() - 1);

	}
	return amount;
}





// RENDERÖI SIVUN.
router.get('/', PrivilegesHandler.islogedIn, async function(req,res){


	console.log("Statistiikka sivu renderöinti / ");

	var privileges = await PrivilegesHandler.GetPrivileges(req.session.username);
	var shifts = await ShiftHandler.GetShifts();

	var CONFIG = await ServerConf.return();
	var SHOWLOG = await GetPageSettings(req.session.username, 'show_log') == true ? true : false;

	res.render("index", {	user: req.session.username, 
							page: "statistic", 
							IP:Config.ip,
							QRLOG: SHOWLOG,
							PORT: Config.port, 
							privileges: privileges,
							shifts: shifts,
							plugins: require('./admin.js').plugins, 
							wsSecret: req.session.websocketSecret	}
				);
});

//XMLHTTPREQUEST --> VASEMMAN PUOLINEN DATA.
router.post('/stats', PrivilegesHandler.islogedIn, async function(req,res){

	console.log("Ladataan sivupaneeli data");
	
	var startDay = new Date(req.body.startDay);
	var endDay = new Date(req.body.endDay);

	var filter = req.body.filter;
	if(filter != null && filter != undefined){
		filter = JSON.parse(filter);
	}

	var clients = await GetUsers(filter);


	var currentini = GetNowInUsers(new Date(), clients, "onlyLogin", filter); //KÄVIJÖITÄ TÄLLÄ HETKELLÄ KIRJAUTUNEENA (EI ULOSKIRJATUT)
	var currentinb = GetNowInUsers(new Date(), clients, "both", filter);      //KÄVIJÖITÄ KONAISMÄÄRÄISESTI TÄNÄÄN (MYÖS ULOSKIRJATUT)
	var currentino = GetNowInUsers(new Date(), clients, "onlyLogout", filter);//JO ULOSKIRJAUTUNEET TÄNÄÄN
 	var Estimate = await GetEstimate(startDay, new Date(endDay), clients, filter);      //KESKIMÄÄRÄINEN SUORITUS PROSENTTI AJALTA startDay - endDay
 	var missing = await GetMissing(startDay, new Date(endDay), clients, filter);        //POISSAOLOT AJALTA startDay - endDay 

 	var data = new StatData(currentini, currentinb, currentino, Estimate, missing, clients.length); //TEHDÄÄN TIEDOISTA OBJEKTI JOTTA SE SAADAAN JSON:ksi
 	console.log("Data: " + data);
	res.send(JSON.stringify(data));
	
});


//XMLHTTPREQUEST --> CHART TAULUKKO DATA.
router.post('/chartData',PrivilegesHandler.islogedIn, async function(req,res){

	console.log("Ladataan kuvaajan data");

	var startDay = new Date(req.body.startDay);
	var endDay = new Date(req.body.endDay);
	var filter = req.body.filter;
	if(filter != null && filter != undefined){
		filter = JSON.parse(filter);
	}
	var data = await UsersChart(startDay, endDay, await GetUsers(filter),filter); //CHART DATA (KIRJAUTUMISET/POISSAOLOT/NIMET/PÄIVÄT)
	console.log("Data: " + data);
	res.send(JSON.stringify(data));
});

module.exports.router = router;
module.exports.GetMissing = GetMissing;
