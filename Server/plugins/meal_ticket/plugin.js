var express = require('express');
var router = express.Router();

var config = require('./config.js');
var Config = require('../../config.js');
var PrivilegesHandler = require('../../privileges');

router.get('/', async function(req,res){
	var privileges = await PrivilegesHandler.GetPrivileges(req.session.username);
	res.render('index', {user: req.session.username, page: config.Name, IP:Config.ip, PORT: Config.port, privileges: privileges, plugins: require('../../admin.js').plugins});

});


router.get('/init', function(req,res){

	res.sendFile(__dirname + '/loader.js');

});



router.get('/image', function(req,res){

	res.sendFile(__dirname + "/lippu.png");
});
router.get('/HTML', function(req,res){
	res.sendFile(__dirname + "/asset.html");
})


module.exports = router;