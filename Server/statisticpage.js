var express = require('express');
var router = express.Router();
var PrivilegesHandler = require('./privileges');
var Config = require('./config');

var Client = require('./models/client').client;
var Shift = require('./models/shifts').shift;

async function GetUsers(){

	var ret = null;

	await Client.find({}).exec().then((clients) => {
		ret = clients;
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

function GetNowInUsers(today, users, notLoggedOut = true, returnUsers = false, returnDateOfFilled = false, returnOnlyName = false){

	var day = today.getDate();
	var month = today.getMonth();
	var year = today.getFullYear();

	var amount = 0;
	var r_users = [];

	for(var i = 0; i < users.length; i++){

		var current = users[i];

		for(var j = current['loggins'].length - 1; j >= 0; j--){

			var loggin = current['loggins'][j];
			if((loggin['loginTime'] != null && loggin['logoutTime'] == null) || (notLoggedOut == false && loggin['loginTime'] != null)){

				var uDate = loggin['date'];
				var uDay = uDate.getDate();
				var uMonth = uDate.getMonth();
				var uYear = uDate.getFullYear();

				if(uDay == day && uMonth == month && uYear == year){

					if(!returnUsers && !returnDateOfFilled){
						amount+=1;
					}else if(returnUsers && !returnOnlyName){
						r_users.push(current);
					}else if(returnUsers && returnOnlyName){
						r_users.push(current['firstname'] +" "+current['lastname']);
					}else if(returnDateOfFilled){
						if(loggin['loginTime'] != null && loggin['logoutTime'] != null){
							return GetTimeBetween(loggin['loginTime'], loggin['logoutTime']);
						}else if(loggin['workDay'] == true && loggin['loginTime'] == null){
							return GetTimeBetween(0, 0);
						}else{
							return false;
						}
					}
					

				}

			}

		}

	}

	if(!returnUsers)
		return amount;
	else
		return r_users;


}

function UsersChart(clients){

	var data = [];
	var header = ["", "Kirjautumiset"];
	
	var today = new Date();
	while(data.length < 30){

		today.setDate(today.getDate() - 1);
		if(today.getDay() != 0 && today.getDay() != 6){

			var loggins = GetNowInUsers(today, clients, false);
			var usr = GetNowInUsers(today, clients, false, true, false, true);
			console.log("USERS: "+ usr);
			var date = today.getDate() + "." + (today.getMonth() + 1 );
			data.push([date, loggins, usr]);

		}

	}

	data.reverse();
	data.unshift(header);

	return data;


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

async function GetEstimate(clients){

	var estimate = [];

	for(var i = 0; i < clients.length; i++){
		var currentClient = clients[i];

		console.log(lastWeekFriday);
		for(var j = 0; j < 5; j++){
			var lastWeekFriday = returnLastWeekFriday(new Date());
			lastWeekFriday.setDate(lastWeekFriday.getDate() - j);
			var time = GetNowInUsers(lastWeekFriday, [currentClient], false, false, true);

			if(time != false){


					var shift = await getSingleShift(currentClient['shift']);
					
					var h = parseInt(shift['hours']);
					var m = parseInt(shift['minutes']);

					var millisecond = (h * 3600000) + (m * 60000);

					estimate.push(time/millisecond);


			}

		}

	}

	var est = 0;

	for(var i = 0; i < estimate.length; i++){
		est += estimate[i];
	}


	return Math.round((est/estimate.length) * 100);


}


router.get('/', PrivilegesHandler.islogedIn, async function(req,res){

	var privileges = await PrivilegesHandler.GetPrivileges(req.session.username);

	var clients = await GetUsers();
	var currentIn = GetNowInUsers(new Date(), clients);
	var fullDayLoggins = GetNowInUsers(new Date(), clients, false);

	var userChartData = UsersChart(clients);

	var estimatedProsentOfWeek = await GetEstimate(clients);

	res.render("index", {	user: req.session.username, 
							page: "statistic", 
							IP:Config.ip, 
							PORT: Config.port, 
							privileges: privileges,
							clients: clients.length, 
							currentIn: currentIn, 
							fullDayLoggins: fullDayLoggins, 
							chartData: userChartData, 
							EST: estimatedProsentOfWeek, 
							plugins: require('./admin.js').plugins, 
							wsSecret: req.session.websocketSecret	}
				);

});


router.get('/loadChartData', PrivilegesHandler.islogedIn, async function(req,res){

	var privileges = await PrivilegesHandler.GetPrivileges(req.session.username);


	res.send('data');

});



module.exports = router;