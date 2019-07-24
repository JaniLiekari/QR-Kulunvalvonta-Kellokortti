// KÄYTIN !- MERKKIÄ NAVBAR JA ROUTE HOOKKIIN POISTAAKSENI NE KÄYTÖSTÄ. JÄTÄN TÄHÄN NE KUITENKIN ESIMERKIKSI. NAVBAR JA ROUTE HOOK TOIMII KUITENKIN.


module.exports = {

	Name: "Ruokalippu",
	Description: "Lisää etusivulle ja yksittäisen kävijän sivulle ruokalipulle tulostus painikkeen.",
	Versio: "1.0",

	
	Temp: 	[

	
			],

	Hooks: 	[																//CLIENT PUOLEN PLUGIN LIITOKSET
				[
					"!Navbar",  											// MIHIN PLUGIN LIITETÄÄN (HUOM! NAVBAR SISÄLTÄÄ VAIN MIHIN JA PLUGIN)
					"../plugins/meal_ticket/hooks/nav_hook.html" 			// LIITETTÄVÄ PLUGIN
				],
				[
					"Modify-client", 										// MIHIN PLUGIN LIITETÄÄN (HUOM! MODIFY-CLIENT SISÄLTÄÄ MYÖS MIHIN KOHTAAN TIEDOSTOA LIITETÄÄN)
					"CLIENT_ACTIONS", 										// MIHIN KOHTAAN PLUGIN LIITETÄÄN
					"../plugins/meal_ticket/hooks/actions_hook.html" 		// LIITETTÄVÄ PLUGIN
				], 
				[
					"Modify-client", 
					"END", 
					"../plugins/meal_ticket/hooks/end_hook.html"
				], 
				[
					"!ROUTE", 
					"../plugins/meal_ticket/index.html"
				],
				[
					"MainTable",
					"END_BEFORE_SCRIPT",
					"../plugins/meal_ticket/hooks/loop_hook.html"
				],
				[
					"MainTable",
					"END",
					"../plugins/meal_ticket/hooks/end_hook.html"
				]
			],

	App: 	[   															// SERVERI PUOLEN PLUGIN LIITOKSET (EXPRESS.APP.USE('POLKU', REQUIRE(TIEDOSTO))))
				[
					"/plugin.js",											// TIEDOSTO
					"/meal_ticket" 											// POLKU
				]
			]

}