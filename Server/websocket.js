var wsClients = [];
var WebSocketServer = require('websocket').server;
var http = require('http');
var AdminModel = require('./models/admin');

var wsReader = null;


/* Funktiota voi käyttää originin tunnistamiseen. Nyt sallii kaikki originit */
function originIsAllowed(origin) {
  return true;
}

/* Luodaan uusi yhteyspiste */
var server = http.createServer(function(request, response) {
        console.log((new Date()) + ' Received request for ' + request.url);
        response.writeHead(404);
        response.end();
});

/* Avataan yhteys ( PORTTI ---> 3330 ) */
server.listen(3330, function() {
        console.log((new Date()) + ' Server is listening on port 3330');
});


/* Luodaan uusi websocket objecti */
wsServer = new WebSocketServer({
        httpServer: server,
        // You should not use autoAcceptConnections for production
        // applications, as it defeats all standard cross-origin protection
        // facilities built into the protocol and the browser.  You should
        // *always* verify the connection's origin and decide whether or not
        // to accept it.
        autoAcceptConnections: false
});

/* Lähettää kaikille yhdistetyille clienteille viestin (UTF) */
var BoardCast = function BoardCast(message){
    for(var i = 0; i < wsClients.length; i++){
        if(wsClients[i][0] == "Client" && wsClients[i][2] == true){
            wsClients[i][1].sendUTF(message);
        }
    }
}

module.exports.BoardCast = BoardCast;


wsServer.on('request', function(request) {
    console.log("Uusi websocket pyyntö");
    if (!originIsAllowed(request.origin)) { /* Jos origin ei ole sallittu yhteys hylätään*/
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    console.log("ORIGIN: "+request.origin);
    var connection = request.accept('echo-protocol', request.origin);
    connection.on('message', async function(message) { /* Kun wsClient lähettää viestin */
        console.log("MESSAGE TYPE: "+message.type);
        if (message.type === 'utf8') {
            console.log("Viesti: " + message.utf8Data);

            /* Tarkisetaan onko kyseessä lukija vai admin käyttäjä */
            if(message.utf8Data == "Reader"){ 	// Lukija

                console.log("HELLO WORLD");
                wsReader = connection;
                BoardCast('04:xx'); // Kun lukulaite yhdistyy lähetetään kaikille admin käyttäjille viesti '04:xx'.
            }
            else{								// Admin

                var split = message.utf8Data.split(',');

                var bool = await AdminModel.wsKeyValidate(split[0], split[1]); // Tarkistaa admin käyttäjän ws avaimen oikeellisuuden. Avainta tarvitaan ws yhteyden lukemiseen / seuraamiseen.
                															   // Yhteyden voi myös katkaista jos ws avain on epäkelvollinen. Nyt olen tyytynyt vain poistamaan tuon käyttäjän viestilistalta (merkkaamaan että avain ei kelpaa).
                															   // Ws avain löytyy tiedostosta /Extend.js --> function wsKey()

                var data = [];
               
                data.push('Client');
                data.push(connection);
                data.push(bool);

                wsClients.push(data);
                if(wsReader == null && bool == true){ // Jos lukulaite ei ole yhteydessä tähän ws serveriin lähetetään kaikille admin käyttäjille viesti '03:xx'.
                    connection.sendUTF('03:xx'); 
                }
            }
        }
    });
    connection.on('close', function(reasonCode, description) { /* Kun wsClient sulkee yhteyden */
        var type = ReturnConnectionType(connection);
        if(type == "Client"){
            console.log("Websocket yhteys katkaistu clientiltä");
            RemoveClientFromArr(connection);

        }else{
        	console.log("Websocket yhteys katkaistu lukulaitteelta");
            BoardCast('03:xx'); // Jos lukulaite sulkee yhteyden lähetetään kaikille admin käyttäjille viesti '03:xx'.
            wsReader = null;
        }
    });
});


/* Palauttaa tiedon mikä yhteys kyseessä (admin käyttäjä vai lukulaite) */
function ReturnConnectionType(conn){
    for(var i = 0; i < wsClients.length; i++){
        if(wsClients[i][1] == conn){
            return wsClients[i][0];
        }
    }
    return "Reader";
}

/* Poistaa clientin viesti listalta */
function RemoveClientFromArr(conn){
    var index = 0;
    for(var i = 0; i < wsClients.length; i++){
        if(wsClients[i][1] == conn){
            index = i;
        }
    }

    wsClients.slice(index,1);
}

