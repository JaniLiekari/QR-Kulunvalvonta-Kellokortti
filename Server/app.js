/* OSA NPM PAKETEISTA TULEE VALMIIKSI NODEJS:N MUKANA */

const bodyParser = require('body-parser')
const express = require('express') // https://expressjs.com/
const app = express()



const mongoose = require('mongoose') // https://mongoosejs.com/
const Jade = require('ejs') // https://ejs.co
const crypto = require('crypto');

const config = require('./config');
const admin = require('./admin');

var Client = require("./models/client").client;
var Login = require("./models/client").login;
var dbConfig = require("./models/config");
var GetShifts = require("./models/shifts").GetShifts;




app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public')) // Julkinen polku.. Ei tarvitse erikseen tehdä app.post/get jne funktioita. Kaikki /public kansiossa on avointa.

app.use('/admin', admin.router);


app.use('/file', require('./fileservice.js'));
app.use('/qrcode', require('./qrcode.js').router);
app.set('view engine', 'ejs');

mongoose.connect(config.url,  { useNewUrlParser: true } );
mongoose.Promise = global.Promise;
var db = mongoose.connection;


var webSocketJS = require('./websocket.js'); // --> Sisältää NPM websocket --> https://www.npmjs.com/package/websocket

/* HELPPERI EJS KOODILLE PLUGINIEN YHDISTÄMISEKSI HTML TIEDOSTOIHIN */
/* VOIDAAN KUTSUA HTML TIEDOSTOSTA <% var Hooks = HookPlugin(plugins, "Nimi", "Kohta") %> */
/* LISÄÄ EJS:stä ---> https://ejs.co */

app.locals.HookPlugin = function HookPlugin(plugins, PageName, Placement){
	var List = [];
	if(plugins){
		for(var i = 0; i < plugins.length; i++){
			if(plugins[i].Hooks != null && plugins[i].Hooks != undefined && plugins[i].Temp[0] == true){
				for(var j = 0; j < plugins[i].Hooks.length; j++){
					var hook = plugins[i].Hooks[j];
					if(hook[0] == PageName){
						if(PageName != "ROUTE" && PageName != "Navbar"){
							if(hook[1] == Placement){ 
								List.push(hook[2]);
							}
						}else{
							List.push(hook[1]);
						}
					}
				}
			}
		}
	}

	return List;
}

/* ************************************************************** */


function Clean(){
	var now = new Date();
	var night = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
	var msToMidnight = night.getTime() - now.getTime();

	setTimeout(function(){
		console.log('AUTO CLEAN');
		admin.clean();
		Clean();
	}, msToMidnight);
}


console.log('\n'+"WARNING! AUTO CLEAN ON! RUNNING ONCE IN DAY");
console.log("WARNING! AUTO CLEAN ON! RUNNING ONCE IN DAY");
console.log("WARNING! AUTO CLEAN ON! RUNNING ONCE IN DAY");
Clean();
admin.clean();
admin.setUp();




function jsonObject(status, date, firstname, lastname, loggedin, timebetween, done, pluginData){
	this.status = status;
	this.time = date;
	this.firstname = firstname;
	this.lastname = lastname;
	this.loggedin = loggedin;
	this.timebetween = timebetween;
	this.daydone = done;
	this.pluginData = pluginData;
}

app.route('/')
	
	.get(function(req,res){
	res.redirect('/admin');
})


function SendResponseI(message, res){
	res.send(JSON.stringify(new jsonObject("message",message,"", "", "")));
	res.end();
}


/* LUKULAITE KUTSUU TÄTÄ ----> VOISI SIIRTÄÄ TOISEEN POLKUUN */
app.route('/api')

	.get(function (req, res) {
		res.send("OK");
	})
	.post(async function (req, res) {

		var qr = req.body.qr;
		console.log(new Date());
		if(qr === undefined){
			console.log("undefined");
			return;
		}
		try{
			/* ETSITÄÄN LÄHETETTY QR DATABASESTA */
			Client.findOne({ 'id': qr }, async function (err, person) {
				
				var dateToFind = null;
				var flag = false;

				/* Tarkistetaan ettei erroria tai jos käyttäjää ei löydy */
		  		if (err){
		  			console.log(err);
		  			res.send(JSON.stringify(new jsonObject("404","","", "", "")));
		  			return;
		  		}
		  		if(person == null){
		  			console.log("NOT FIND");
		  			webSocketJS.BoardCast("01:"+qr);
		  			res.send(JSON.stringify(new jsonObject("404","","", "", "")));
		  			return;
		  		}
		  		/********************************************************/


		  		console.log("LUKULAITE KIRJAUTUMINEN (NIMI): " +  person['firstname']);

		  		var added = false;

		  		/* JOS KÄVIJÄ EI OLE MERKATTU KIRJAUTUNEEKSI ( ON TEHNYT ULOSKIRJAUTUMISEN ) */
		  		if(person['loggedin'] === false){ 

		  			console.log("Person was not loggedin");

		  			var today = new Date();
		  			today.setHours(3);
		  			today.setMinutes(0);
		  			today.setSeconds(1);

		  			/* JOS KÄVIJÄLLÄ ON KIRJAUTUMISTIETOJA */
		  			if(person['loggins'] != null && person['loggins'].length > 0){ 
		  				var found = false;
		  				for(var i = 0; i < person['loggins'].length; i++){

		  					var log = person['loggins'][i];
		  					if(log == undefined || log == null){
		  						break;
		  					}

		  					/* JOS KÄVIJÄLLÄ ON KIRJAUTUMISTIETOJA TÄNÄPÄIVÄNÄ */
		  					if(log['date'].getFullYear() == today.getFullYear() && log['date'].getMonth() == today.getMonth() && log['date'].getDate() == today.getDate()){
		  						console.log('not loged in, but date found');

		  						/* JOS TÄMÄ PÄIVÄ ON TYÖPÄIVÄ */
		  						if(log['workDay'] == true){  
			  						if(log['loginTime'] == undefined || log['loginTime'] == undefined ||log['loginTime'] == ""){
			  							log['loginTime'] = new Date();
			  							person['loggedin'] = true;
			  						}else{
			  							log['logoutTime'] = new Date();
			  							person['loggedin'] = false;
			  						}
			  						
			  						dateToFind = log;
			  						added = true;
		  						}
		  						/* JOS TÄMÄ PÄIVÄ ON VAPAA */
		  						else{
		  							flag = true;
		  							webSocketJS.BoardCast("02:" + person['firstname'] + " " + person['lastname']);
		  							SendResponseI('OTA YHTEYS VASTUU HENKILÖÖN! [EI TYÖPÄIVÄÄ]', res);
		  							return;
		  						}
		  					}
		  				}

		  			}
		  			/* JOS KÄVIJÄLLÄ EI OLE KIRJAUTUMISTIETOJA */
		  			else{
		  				console.log('not loged in, but date not found');
		  				person['loggedin'] = true;
		  				added = true;
		  				console.log("	Login time: " + new Date());
		  				var day = today.getDay();
		  				/* JOS TÄMÄ PÄIVÄ ON TYÖPÄIVÄ */
		  				if(person['workDays'][day] == true){
		  					dateToFind = new Login({ date: today, loginTime: new Date(), workDay: true});
		  					person['loggins'].push(dateToFind);
		  				}
		  				/* JOS TÄMÄ PÄIVÄ ON VAPAA */
		  				else{
		  					flag = true;
		  					webSocketJS.BoardCast("02:" + person['firstname'] + " " + person['lastname']);
		  					SendResponseI('OTA YHTEYS VASTUU HENKILÖÖN! [EI TYÖPÄIVÄÄ]', res);
		  					return;
		  				}
			  			
		  			}
		  		}
		  		/* JOS KÄVIJÄ ON MERKATTU KIRJAUTUNEEKSI ( EI OLE KIRJAUTUNUT TAI ON EDELLISENÄ PÄIVÄNÄ JÄTTÄNYT ULOSKIRJAUTUMATTA ) */
		  		else{

		  			/* JOS KÄVIJÄLLÄ ON KIRJAUTUMISTIETOJA */
		  			if(person['loggins'] != null && person['loggins'].length > 0){
			  			var p_date = person['loggins'][person['loggins'].length-1]['date'];
			  			p_date.setHours(0);
			  			p_date.setMinutes(0);
			  			p_date.setSeconds(1);

			  			var today = new Date();
			  			today.setHours(3);
			  			today.setMinutes(0);
			  			today.setSeconds(1);


			  			var found = false;
		  				for(var i = 0; i < person['loggins'].length; i++){

		  					var log = person['loggins'][i];
		  					if(log == undefined || log == null){
		  						break;
		  					}
		  					/* JOS KÄVIJÄLLÄ ON KIRJAUTUMISTIETOJA TÄNÄPÄIVÄNÄ */
		  					if(log['date'].getFullYear() == today.getFullYear() && log['date'].getMonth() == today.getMonth() && log['date'].getDate() == today.getDate()){


		  						console.log('loged in, but date found');
		  						/* JOS TÄMÄ PÄIVÄ ON TYÖPÄIVÄ */
		  						if(log['workDay'] == true){
			  						if(log['loginTime'] == null || log['loginTime'] == undefined || log['loginTime'] == ""){
			  							log['loginTime'] = new Date();
			  							person['loggedin'] = true;
			  						}else{
			  							log['logoutTime'] = new Date();
			  							person['loggedin'] = false;
			  						}

			  						added = true;
			  						dateToFind = log;
		  						}
		  						/* JOS TÄMÄ PÄIVÄ ON VAPAA */
		  						else{
				  					flag = true;
				  					webSocketJS.BoardCast("02:" + person['firstname'] + " " + person['lastname']);
				  					SendResponseI('OTA YHTEYS VASTUU HENKILÖÖN! [EI TYÖPÄIVÄÄ]', res);
				  					return;
				  				}
		  						
		  					}
		  				}

		  			}
		  			/* JOS KÄVIJÄLLÄ EI OLE KIRJAUTUMISTIETOJA */
		  			else{
		  				console.log('loged in, but date not found');
		  				var today = new Date();
			  			today.setHours(3);
			  			today.setMinutes(0);
			  			today.setSeconds(1);
			  			var day = today.getDay();

			  			/* JOS TÄMÄ PÄIVÄ ON TYÖPÄIVÄ */
		  				if(person['workDays'][day] == true){
			  				person['loggedin'] = true;
			  				dateToFind = new Login({ date: today, loginTime: new Date(), workDay: true});
				  			person['loggins'].push(dateToFind);
				  			added = true;
			  			}
			  			/* JOS TÄMÄ PÄIVÄ ON VAPAA */
			  			else{
			  				flag = true;
			  				webSocketJS.BoardCast("02:" + person['firstname'] + " " + person['lastname']);
		  					SendResponseI('OTA YHTEYS VASTUU HENKILÖÖN! [EI TYÖPÄIVÄÄ]', res);
		  					return;
			  			}
		  			}
		  			
		  		}

		  		/* JOS PÄIVÄÄ EI SAATU LISÄTTYÄ */
		  		if(added == false){
		  			console.log('date no added');
		  			var today = new Date();
			  			today.setHours(3);
			  			today.setMinutes(0);
			  			today.setSeconds(1);

			  		/* LUODAAN PÄIVÄ JOS TÄNÄÄN TYÖPÄIVÄ */
			  		if(person['workDays'][today.getDay()] == true){
				  		person['loggedin'] = true;
			  			dateToFind = new Login({ date: today, loginTime: new Date(), workDay: true});
				  		person['loggins'].push(dateToFind);
				  		person['loggedin'] = true;
			  		}
			  		else{
			  			flag = true;
			  			webSocketJS.BoardCast("02:" + person['firstname'] + " " + person['lastname']);
			  			SendResponseI('OTA YHTEYS VASTUU HENKILÖÖN! [EI TYÖPÄIVÄÄ]', res);
		  				return;
			  		}

		  		}

		  		
		  		/* LIPPU EI NOUSSUT, ELI KAIKKI HYVIN. SHORTATAAN PÄIVÄ TIEDOT JA TALLENNETAAN. LÄHETETÄÄN MYÖS ONNISTUNUT RESPONSE */
		  		if(flag == false){
			  		person['loggins'].sort(function(a,b){
				  			return a['date'] - b['date'];
				  	});
			  		person.save(function(err){
			  			if(err){
			  				console.log("Saving error: " + err);
			  			}else{
			  			}
			  		});
			  		var d = new Date();
			  		d = "Aika nyt: "+("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
			  		var status = person['loggedin'] == true ? "true" : "false";
			  		var timebetween;

			  		if(status == "false"){

			  			var a = new Date(dateToFind['loginTime']);
						var b = new Date();
						var seconds = (b-a) /1000 / 60 / 60;
						var h = Math.floor(seconds);
						var minutes = Math.abs(Math.round((seconds - h) * 60));
						timebetween = h + " tuntia "+ minutes+" minuuttia";
			  		}else{
			  			timebetween = null;
			  		}

			  		var shiftOBJS = await GetShifts();
			  		var done = "false";

			  		for(var i = 0; i < shiftOBJS.length; i++){
			  			if(shiftOBJS[i][0] == person['shift']){

			  				var sh = parseInt(shiftOBJS[i][1]);
			  				var sm = parseInt(shiftOBJS[i][2]);



			  				if((h > sh) || (h == sh && minutes >= sm)) {

			  					done = "true";

			  				}

			  				break;
			  			}
			  		}

			  		/* GET PLUGIN DATA */

			  		var pluginData = [];
			  		for(var i = 0; i < admin.APIPlugin.length; i++){
			  			pluginData.push(await admin.APIPlugin[i](person));
			  		}

			  		var pluginData = JSON.stringify(pluginData);


			  		res.send(JSON.stringify(new jsonObject("ok",d,person['firstname'], person['lastname'], status, timebetween, done, pluginData)));
		  		}

			});
		}catch(err){
			res.send(JSON.stringify(new jsonObject("404","","", "", "")));
		}


	})

app.route('/*')
	.get(function (req, res) {
		res.render('404');
	})


console.log('\nServer is up and running on port 6060...\n');
app.listen(config.port);


