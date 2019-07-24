var Extented = require('./Extented.js');
var fs = require('fs');


//Writing data into file
module.exports.WriteInFile = async function WriteInFile(file,text, name){

	var data = "";

	var string = Extented.createDateString(new Date());

	text = '\r\n'+ "["+string+"]  " + text;
	if(fs.existsSync(file)){
		data = data + fs.readFileSync(file, 'utf8');
	}else if(text != "["+string+"]  " + 'SYKE LOG ['+name+']'  + '\r\n'){														
		data = "["+string+"]  " + 'SYKE LOG ['+name+']'  + '\r\n';
	}

	text = data + text;

	try{
		fs.writeFileSync(file, text);
	}catch(err){
		console.log(err);
	}
	
}