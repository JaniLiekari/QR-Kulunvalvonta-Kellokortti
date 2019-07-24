module.exports = {

	Name: "Taulukko tulostus",
	Description: "Lisää etusivulle ja yksittäisen kävijän sivulle kirjautumistietojen tulostus painikkeen.",
	Versio: "1.0",

	
	Temp: 	[

	
			],

	Hooks: 	[																//CLIENT PUOLEN PLUGIN LIITOKSET
				[
					"MainTable",
					"END_BEFORE_SCRIPT",
					"../plugins/print_csv/hooks/btn.html"
				],
				[
					"MainTable",
					"END",
					"../plugins/print_csv/hooks/scripts.html"
				],
				[
					"Modify-client",
					"TABLE_BTN",
					"../plugins/print_csv/hooks/btn.html"
				],
				[
					"Modify-client",
					"END",
					"../plugins/print_csv/hooks/scripts2.html"
				]

			],

	App: 	[   															// SERVERI PUOLEN PLUGIN LIITOKSET (EXPRESS.APP.USE('POLKU', REQUIRE(TIEDOSTO))))
				
			]

}