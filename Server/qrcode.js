var express = require('express');
var router = express.Router();



var QRCode = require('qrcode');
const fs = require('fs')
const util = require('util')

const unlinkAsync = util.promisify(fs.unlink)


router.get('/API/:Data', function(req,res){

	
	var datapath = "tmp/temp.png";

	QRCode.toFile(datapath, req.params.Data, {
		color: {
		    dark: '#000000',  // Black
		    light: '#ffffff' // White
		}
	}, async function (err) {
		if (err) { 
			throw err 
		}else{
			res.sendFile(__dirname + "/" + datapath);
		}
	})

});



module.exports.router = router;