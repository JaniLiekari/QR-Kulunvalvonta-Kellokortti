var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Plugin = new Schema({
    name: String,
    use: Boolean,
    file: String
});


var model = mongoose.model('plugin', Plugin, "plugin");

module.exports.plugin = model;