const mongoose = require('mongoose')
mongoose.Promise = global.Promise


var configSchema = mongoose.Schema({
	allowRegister: Boolean,
	LastClean: Date,
	FirstPageName: String
});


var Config = mongoose.model('config', configSchema, 'config');
module.exports.model = Config;

module.exports.return = async function(){

	var config;

	await Config.findOne({}).exec().then((conf) => {
		config = conf;
	});

	return config;

}