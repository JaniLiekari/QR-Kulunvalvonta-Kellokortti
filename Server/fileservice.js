var express = require('express');
var router = express.Router();




router.get('/css/:file', function(req,res){

	var file = req.params.file;
	console.log('JS File: ' + file);

	if(file == null || file == undefined){
		res.end();
	}

	res.sendFile(__dirname + "/public/styles/"+file);

});




router.get('/js/:file', function(req,res){


	var file = req.params.file;
	console.log('JS File: ' + file);

	if(file == null || file == undefined){
		res.end();
	}

	res.sendFile(__dirname + "/public/scripts/"+file);

});



router.get('/img/:file', function(req,res){
	var file = req.params.file;
	console.log('IMG File: ' + file);

	if(file == null || file == undefined){
		res.end();
	}

	res.sendFile(__dirname + "/public/img/"+file);

});

router.get('/documents/:file', function(req,res){
	var file = req.params.file;

	if(file == null || file == undefined){
		res.end();
	}
	res.sendFile(__dirname + "/public/documents/"+file);

});



module.exports = router;