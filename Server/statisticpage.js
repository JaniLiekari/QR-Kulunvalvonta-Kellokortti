var express = require('express');
var router = express.Router();
var PrivilegesHandler = require('./privileges');
var Config = require('./config');

var Client = require('./models/client').client;
var Shift = require('./models/shifts').shift;

var ShiftHandler = require('./models/shifts');

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
						console.log("FILTERED PUSH");
					}
				}
			}

			ret = filtered;
		}
		
	});

	return ret;
}


function GetTimeBetween(Date1, Date2){
	var diff = Math.abs(Date2 - Date1);
	return diff;
}

async function getSingleShift(name){

	var shift = null;


	await Shift.findOne({name: name}).exec().then((s) =>{
		shift = s;
	});

	return shift;

}

function GetNowInUsers(today, users, type){

	var day = today.getDate();
	var month = today.getMonth();
	var year = today.getFullYear();

	var amount = 0;

	for(var i = 0; i < users.length; i++){

		var current = users[i];

		for(var j = current['loggins'].length - 1; j >= 0; j--){

			var loggin = current['loggins'][j];
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


async function GetUsersAndLogins(users, today){
	var day = today.getDate();
	var month = today.getMonth();
	var year = today.getFullYear();

	var usr = [];
	var absence = [];
	for(var i = 0; i < users.length; i++){

		var current = users[i];
		var dateFound = false;

		for(var j = current['loggins'].length - 1; j >= 0; j--){

			var loggin = current['loggins'][j];
			var uDate = loggin['date'];
			var uDay = uDate.getDate();
			var uMonth = uDate.getMonth();
			var uYear = uDate.getFullYear();

			if(uDay == day && uMonth == month && uYear == year){	
				if(loggin['loginTime'] != null){
						usr.push(current['firstname'] + " " + current['lastname']);
				}else{
					if(loggin['workDay'] == true){
						absence.push(current['firstname'] + " " + current['lastname']);
					}
				}

				dateFound = true;
			}

		}

		if(!dateFound){
			var day = today.getDay();
			if(current['workDays'][day] == true && current['createDate'] <= today){
				absence.push(current['firstname'] + " " + current['lastname']);
			}
		}

	}
	return [usr, absence];
}

async function UsersChart(start, end, clients){

	var header = ["", "Kirjautumiset"];
	var data = [];
	
	
	while(end >= start){

		end.setDate(end.getDate() - 1);
		if(end.getDay() != 0 && end.getDay() != 6){

			var temp = await GetUsersAndLogins(clients, end);
			var date = end.getDate() + "." + (end.getMonth() + 1 );
			data.push(new UserChartData(date, temp[0], temp[1]));

		}

	}

	data.reverse();

	return new ChartHeaders(header, data);
}

function returnLastWeekFriday(date){


    var day = date.getDay();
    var prevMonday;
    if(date.getDay() == 0){
        prevMonday = new Date();
        prevMonday.setDate(date.getDate() - 7 + 5);
    }
    else{
        prevMonday = new Date();
        prevMonday.setDate(date.getDate() - day - 7 + 5);
    }

    return prevMonday;
}


async function GetWorkDayUserLoginTime(today, user){


	var day = today.getDate();
	var month = today.getMonth();
	var year = today.getFullYear();


	for(var j = user['loggins'].length - 1; j >= 0; j--){

		var loggin = user['loggins'][j];

		var uDate = loggin['date'];
		var uDay = uDate.getDate();
		var uMonth = uDate.getMonth();
		var uYear = uDate.getFullYear();

		console.log(loggin['workDay']);

		if(uDay == day && uMonth == month && uYear == year){	
			if(loggin['loginTime'] != null && loggin['logoutTime'] != null && loggin['workDay'] == true){
				return GetTimeBetween(loggin['loginTime'], loggin['logoutTime']);
			}else if(loggin['loginTime'] == null && loggin['workDay'] == true){
					return 0;
			}else if(loggin['loginTime'] != null && loggin['logoutTime'] == null && loggin['workDay'] == true){
					return 0;
			}else if(loggin['workDay'] == false){
				return "false";
			}
		}

	}

	var day = today.getDay();

	if(user['workDays'][day] == true && user['createDate'] <= today){
		return 0;
	}

	return "false";

}

function HasLoginData(today, user){

	var day = today.getDate();
	var month = today.getMonth();
	var year = today.getFullYear();

	var dataFound = false;
	
	for(var j = 0; j < user['loggins'].length; j++){

		var loggin = user['loggins'][j];

		var uDate = loggin['date'];
		var uDay = uDate.getDate();
		var uMonth = uDate.getMonth();
		var uYear = uDate.getFullYear();

		if(uDay == day && uMonth == month && uYear == year){
			dataFound = true;
			if((loggin['loginTime'] != null && loggin['workDay'] == true) || loggin['workDay'] == false){
				return true;
			}else{
				return false;
			}
		}

	}

	if(!dataFound){

		var day = today.getDay();
		if(user["workDays"][day] == true && user['createDate'] <= today){
			return false;
		}

	}


	return true;
}


function shiftToTime(shift){
	var h = parseInt(shift['hours']);
	var m = parseInt(shift['minutes']);

	var millisecond = (h * 3600000) + (m * 60000);
	return millisecond;
}

async function GetEstimate(start, end, clients){

	var estimate = [];

	for(var i = 0; i < clients.length; i++){
		var currentClient = clients[i];

		var curDate = new Date(start);
		while(curDate <= end){
			
			var time = await GetWorkDayUserLoginTime(curDate, currentClient);
			console.log("TIME = " + time);
			if(time != "false"){


					var shift = await getSingleShift(currentClient['shift']);
					
					var h = parseInt(shift['hours']);
					var m = parseInt(shift['minutes']);

					var millisecond = (h * 3600000) + (m * 60000);
					console.log("FILL RATE: " + time/millisecond);
					estimate.push(time/millisecond);


			}

			curDate.setDate(curDate.getDate() + 1);

		}

	}

	var est = 0;

	for(var i = 0; i < estimate.length; i++){
		est += estimate[i];
	}


	return Math.round((est/estimate.length) * 100.0);
}

var GetMissing = async function GetMissing(start, end,clients){

	var amount = 0;
	console.log(clients.length);
	for(var i = 0; i < clients.length; i++){
		var currentClient = clients[i];
		var curDate = new Date(start);
		while(curDate <= end){
			var data = HasLoginData(curDate, currentClient);
			if(data === false){
				amount += 1;
			}

			curDate.setDate(curDate.getDate() + 1);
		}

	}
	console.log(amount);
	return amount;
}


router.get('/', PrivilegesHandler.islogedIn, async function(req,res){
	var privileges = await PrivilegesHandler.GetPrivileges(req.session.username);
	var shifts = await ShiftHandler.GetShifts();
	res.render("index", {	user: req.session.username, 
							page: "statistic", 
							IP:Config.ip, 
							PORT: Config.port, 
							privileges: privileges,
							shifts: shifts,
							plugins: require('./admin.js').plugins, 
							wsSecret: req.session.websocketSecret	}
				);
});


router.post('/stats', PrivilegesHandler.islogedIn, async function(req,res){

	
	var startDay = new Date(req.body.startDay);
	var endDay = new Date(req.body.endDay);

	var filter = req.body.filter;
	if(filter != null && filter != undefined){
		filter = JSON.parse(filter);
	}

	var clients = await GetUsers(filter);


	var currentini = GetNowInUsers(new Date(), clients, "onlyLogin", filter);
	var currentinb = GetNowInUsers(new Date(), clients, "both", filter);
	var currentino = GetNowInUsers(new Date(), clients, "onlyLogout", filter);
 	var Estimate = await GetEstimate(startDay, endDay, clients, filter);
 	var missing = await GetMissing(startDay, endDay, clients, filter);

 	var data = new StatData(currentini, currentinb, currentino, Estimate, missing, clients.length);
	res.send(JSON.stringify(data));
	
});



router.post('/chartData',PrivilegesHandler.islogedIn, async function(req,res){

	var startDay = new Date(req.body.startDay);
	var endDay = new Date(req.body.endDay);
	var data = await UsersChart(startDay, endDay, await GetUsers());
	res.send(JSON.stringify(data));
});

module.exports.router = router;
module.exports.GetMissing = GetMissing;
