var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var QuestionPlugin = new Schema({
    name: String,
    description: String,
    options: [String],
    answers: [String], // MUOTOA 'VASTAAJAN_QR|VASTAUS'
    experiense: Date
});


var model = mongoose.model('questionplugin', QuestionPlugin, "questionplugin");
module.exports = model;