var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    username: String,
    password: String,
    mod_log: Boolean,
    create_user: Boolean,
    remove_user: Boolean,
    mod_user: Boolean,
    mod_shifts: Boolean,
    mod_accounts: Boolean,
    remove_accounts: Boolean,
    WebSocketKey: String,
    FirstPageName: String,
    show_log: Boolean
});

Account.pre('save', function(next){

	next();
});

Account.plugin(passportLocalMongoose);

var model = mongoose.model('account', Account, "account");

module.exports.model = model;

module.exports.getNameList = async function(){

    var accounts = [];

    await model.find({}).exec().then((account) => {
        if(account){
            for(var i = 0; i < account.length; i++){
                accounts.push(account[i]['username']);
            }
        }
    });

    return accounts;

}

module.exports.getAccount = async function(name){

    var result;

    await model.findOne({username: name}).exec().then((account) => {
        if(account){
            result = account;
        }
    });

    return result;

}


module.exports.saveWSKey = async function(name, key){
    await model.findOne({username: name}).exec().then((account) => {

            if(account){
                account['WebSocketKey'] = key;


                account.save(function(err){

                });
            }

    });
}

module.exports.wsKeyValidate = async function(name, key){

    var validate = false;

    await model.findOne({username: name}).exec().then((account) => {
        if(account){
            if(account['WebSocketKey'] == key){
                validate = true;
            } 
        }
    });

    return validate;
}
