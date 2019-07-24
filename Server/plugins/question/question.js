var express = require('express');
var router = express.Router();
var model = require('./model.js');

router.get('/', async function(req,res){
	

	
	
	//res.render('index', {user: req.session.username, page: config.Name, IP:Config.ip, PORT: Config.port, privileges: privileges, plugins: require('../../admin.js').plugins});

});



async function ModelExist(name){

	var result = false;
	await model.findOne({name: name}).exec().then((data) => {

		if(data != null){
			result = true;
		}

	});
	return result;

}

async function GetAllModel(){

	var result = null;

	await model.find({}).exec().then((data) => {

		console.log(data);

		if(data != null)
			result = data;
	});

	return result;

}

async function ModifyModel(name, description, options, experiense){

	await model.findOne({name: name}).exec().then((data) => {

		if(data != null){
			data['name'] = name;
			data['description'] = description;
			data['options'] = options;
			data['experiense'] = experiense;

			data.save(function(err){

			});
		}

	});

}

function CreateNewModel(name, description, options, experiense){

	console.log("CREATE NEW MODEL");


	/* EHKÄ LUO XML TIEDOSTO JA TALLENNA TIEDOT SIIHEN */
	var newModel = new model({
		name: name,
		description: description,
		options: options,
		experiense: experiense
	});
	newModel.save(function(err){
		console.log(err);
	});

}

function parseOpts(opt){
	var result = JSON.parse(opt);
	var arr = [];
	for(var i = 0; i < result.length; i++){
		arr.push(opt[i]);
	}
	return arr;
}

router.post('/save', async function(req,res){

	console.log(req.body);
	var data = JSON.parse(req.body.data);
	
	if(await ModelExist(data['name'])){
		await ModifyModel(data['name'], data['description'], data['options'], new Date(data['experiense']));
	}else{
		 CreateNewModel(data['name'], data['description'], data['options'], new Date(data['experiense']));
	}


	res.send('ok');

});

router.post('/load-all', async function(req,res){

	var data = await GetAllModel();

	var json = {status: data != null, data: data};

	res.send(JSON.stringify(json));

});




module.exports = router;