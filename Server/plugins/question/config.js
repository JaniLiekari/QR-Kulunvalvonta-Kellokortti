var model = require('./model.js');

function JSONMODEL(name, options, description){
	this.name = name;
	this.options = options;
	this.description = description;
}

module.exports = {

	Name: "Kysely",
	Description: "Suorita kysely lukulaiteessa, kirjautumisen yhteydessä.",
	Versio: "0.1",

	
	Temp: 	[

	
			],

	Hooks: 	[																//CLIENT PUOLEN PLUGIN LIITOKSET
				[
					"Options", 												// MIHIN PLUGIN LIITETÄÄN (HUOM! MODIFY-CLIENT SISÄLTÄÄ MYÖS MIHIN KOHTAAN TIEDOSTOA LIITETÄÄN)
					"SideBar", 												// MIHIN KOHTAAN PLUGIN LIITETÄÄN
					"../plugins/question/optionsSide_hook.html" 			// LIITETTÄVÄ PLUGIN
				],
				[
					"Options", 												// MIHIN PLUGIN LIITETÄÄN (HUOM! MODIFY-CLIENT SISÄLTÄÄ MYÖS MIHIN KOHTAAN TIEDOSTOA LIITETÄÄN)
					"Page", 												// MIHIN KOHTAAN PLUGIN LIITETÄÄN
					"../plugins/question/optionsPage_hook.html" 			// LIITETTÄVÄ PLUGIN
				],
				
			],

	App: 	[   															// SERVERI PUOLEN PLUGIN LIITOKSET (EXPRESS.APP.USE('POLKU', REQUIRE(TIEDOSTO))))
				[
					"/question.js",											// TIEDOSTO
					"/question" 											// POLKU
				]
			],

	APIPlugin: 	{															// SUORITETTAVAT KOMENNOT LEIMAUS VAIHEESSA.. RETURN NULL JOS HALUAT ETTÄ IQNORATAAN... 
					0: async function(person){								// TARKOITUS MYÖHEMMIN ETTÄ VOI LÄHETTÄÄ XML TIEDOSTOJA LUKULAITTEESEEN TAI VASTAAVAA...
						return await APIFUNCTION(person);					// EN TIEDÄ VIELÄ.....
					}
				}

}


/* HOOKATTAVA FUNKTIO APP.JS FILUUN. KOHTA APP.JS TIEDOSTOSTA LÖYTYY ETSIMÄLLÄ "APIPlugin" */
var APIFUNCTION = async function(person){

	var result = [];

	await model.find({}).exec().then((data) => {
		if(!data){
			result = null;
		}else{
			for(var i = 0; i < data.length; i++){

				var found = false;

				//HERE CHECK IF IT'S WORK DAY THEN....


				for(var j = 0; j < data[i]['answers'].length; j++){
					var answer = data[i]['answers'][j].split('|'); 
					if(answer[0] == person['id']){
						found = true;
						break;
					}
				}

				if(!found){
					var quest = new JSONMODEL(data[i]['name'], data[i]['options'], data[i]['description']);
					result.push(quest);
				}

			}
		}
		
	});

	if(result != null){
		result = JSON.stringify(result);
	}

	return result;
}