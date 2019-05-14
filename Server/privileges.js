var ServerConf = require('./models/config');
var Config = require('./config');
var Account = require('./models/admin');

module.exports.islogedIn = function islogedIn(req, res, next){

	if(req.session.username){

		//[Render 1] Go for orginal requested route.
		next();

	}else{

		//[Condition 2] Checking if login is allowed.
		var reg;
		ServerConf.model.find({}, function (err, conf) {	 

		 	try{
		  		reg = conf[0]["allowRegister"];
		  		//[Redirect 1] Redirect to LoginPage function.
		  		LoginPage(req, res, reg, null);
			}catch(err){

				console.log("catch " + err);

			}

		});

	}	
}


module.exports.GetPrivileges = async function GetPrivileges(name){

	var result = [];

	await Account.model.findOne({username:name}).exec().then((account) => {
		if(account){
			result.push(account['mod_log']);
			result.push(account['create_user']);
			result.push(account['remove_user']);
			result.push(account['mod_user']);
			result.push(account['mod_shifts']);
			result.push(account['mod_accounts']);
			result.push(account['remove_accounts']);
		}else{
			console.log('no acco');
		}

	});

	return result;
}

function LoginPage(req, res, reg, userbool){
	res.render("index", {action: "Login", reg: reg, user: userbool, page: "login", IP:Config.ip, PORT: Config.port});
};