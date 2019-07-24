# **QR-TimeCard** #

HTML, JAVASCRIPT, NODEJS, C# Pohjalta tehty serveri/client kokonaisuus esim työpajan asiakkaiden kulkemisen seuraamiseksi.
Yksinkertainen ja helppo UI.

- - - -


## TARVITTAVAT ASIAT: ##
* QR Koodilukija. 
  > Joka kykenee syöttämään usb portin kautta näppäimistö syötettä.
* Serveri tietokone. 
  > Testattu windows 10, Ubuntu v. ??? ja Debian 9.
* Windows 7 tai 10 client sovellukselle. 
  > Voi olla sama kuin serveri jos on windows 10, mielummin eri.

- - - -


## Pääominaisuudet: ##
* Luo uusi kävijä/asiakas
* Tulosta asiakkaalle QR:n pohjautuva kulkukortti
* Katso kirjautumistietoja / Poissaolojo / Merkata vapaa- tai työpäiviä / Muuta statistiikkaa
* Muokkaa kirjautumistietoja yms
* Lataakirjautumistiedot CSV tiedostona
* Tulosta ruokalippuja


## Esiasennus: ##

### Debian Ja Ubuntu ###

Curl
-sudo apt-get install curl

Source
-curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -

NodeJS
-sudo apt-get install -y nodejs


### MongoDB asennus: ###

Debian Ja Ubuntu

Keyserver
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4

Source
echo "deb http://repo.mongodb.org/apt/debian stretch/mongodb-org/4.0 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.0.list

Reload local package database
sudo apt-get update

MongoDB
sudo apt-get install -y mongodb-org

Enable & Start
sudo systemctl enable mongo
sudo systemctl start mongo


## Kulunvalvonnan asennus: ##

### Tiedostot ###
Kopio kaikki tiedostot paitsi kansiota Logs, node_modules ja tiedostoja package.json.*

### Node Modules ###
Navigoi shellillä asennuskansioon. Kirjoita komento npm init. Tarkista että komento antaa lähtö tiedostoksi app.js. Tämän jälkeen kirjoita komento npm install.

### Asetukset ###
Navigoi sovelluksen juureen ja avaa tiedosto config.js. Tarkista kohdat  url ( mongodb osoite / databasen nimi ), ip (serverin ip) & port (avoin portti jota serveri kuuntelee).

```javascript
module.exports = {

	url : "mongodb://localhost/logsite",
	sessionOptions : {

		  secret: "salaisuus",
		  cookie : { username: "username", httpOnly: true, maxAge: null }
	},

	ip : "127.0.0.1",
	port : 808
	
};
```


### Käynnistys ###
Lisää app.js joko serviceksi tai vaihtoehtoisesti voit asentaa sudo apt-get install nodemon -g. Nodemonilla sovellus käynnistyy kohdekansiossa ollessa komennolla nodemon. Voit myös testata sovellusta komennolla node app.js.
