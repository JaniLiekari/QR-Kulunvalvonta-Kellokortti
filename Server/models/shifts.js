const mongoose = require('mongoose')
var Schema = mongoose.Schema;

var Shift = new Schema({

	name: String,
	hours: String,
	minutes: String

});


var shift = mongoose.model('shift', Shift, 'shift');
module.exports.shift = shift;


module.exports.GetShifts = async function GetShifts(){
	var shifts = [];
	await shift.find({}).exec().then((data) => {
		if(!data){
			shifts.push('empty');
		}
		 try{
		 	if(data.length === 0){
		 		shifts.push('empty');
		 	}else{
		 		
		 	}
		 	for(var i = 0; i < data.length; i++){
		 		var temp = [];
		 		temp.push(data[i]['name']);
		 		temp.push(data[i]['hours']);
		 		temp.push(data[i]['minutes']);
		 		shifts.push(temp);
		 	}
		}catch(err){
		 	console.log("catch " + err);
		}
	});

	return shifts;
}