var express = require('express');
var router = express.Router();

var PrivilegesHandler = require('./privileges');
var Shift = require('./models/shifts').shift;


var Logger = require('./logger.js');
var path = require('path');

//Add new shift
router.post('/add', PrivilegesHandler.islogedIn, async function(req,res,error){
	var name = req.param('name');
	var rqtime = req.param('rqTime');

	var hours = rqtime.split(":")[0];
	var minutes = rqtime.split(":")[1];

	var privileges = await PrivilegesHandler.GetPrivileges(req.session.username);

	if(privileges[4] != true){
		res.send('400');
		return;
	}
	if(name === null || name === undefined){
		res.send('400');
		return;
	}

	var new_shift = new Shift({
		name: name,
		hours: hours,
		minutes: minutes
	});

	new_shift.save(function(err){
		if(err){
			res.send('400');
		}else{
			res.send('ok');
		}
	});
})

//Remove shift
router.post('/remove', PrivilegesHandler.islogedIn, async function(req,res,error){
	var name = req.param('name');
	var privileges = await PrivilegesHandler.GetPrivileges(req.session.username);

	if(privileges[4] != true){
		res.send('400');
		return;
	}
	if(name === null || name === undefined){
		res.send('400');
		return;
	}

	Shift.deleteOne({name:name}, function(err){
		if(err){res.send('400');}
		else{
			res.send('ok');
		}
	})
})

//Change order of shifts
router.post("/order", PrivilegesHandler.islogedIn, async function(req, res, err){
	var privileges = await PrivilegesHandler.GetPrivileges(req.session.username);

	var order = JSON.parse(req.body.order);

	if(privileges[4] != true){
		res.send('400');
		return;
	}

	Shift.find({}, function(err, data){
		if(!data){
			//shifts.push('empty');
		}
		try{
		 	

			for(var i = 0; i < order.length; i++){


				data[i]['name'] = order[i][0];
				data[i]['hours'] = order[i][1];
				data[i]['minutes'] = order[i][2];


				data[i].save(function(err){
				});

			}

			res.send("ok");


		}catch(err){
		 	console.log("catch " + err);
		}
	});

});

//Edit shift name and expected time
router.post('/edit', PrivilegesHandler.islogedIn, async function(req,res,error){
	var name = req.param('name');
	var rqtime = req.param('rqTime');
	var org = req.param('org');
	var hours = rqtime.split(":")[0];
	var minutes = rqtime.split(":")[1];

	var privileges = await PrivilegesHandler.GetPrivileges(req.session.username);

	if(privileges[4] != true){
		res.send('400');
		return;
	}
	if(name === null || name === undefined){
		res.send('400');
		return;
	}

	Shift.findOne({name: org}, function(error, s){
		s['name'] = name;
		s['hours'] = hours;
		s['minutes'] = minutes;

		s.save(function(err){
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



module.exports = router