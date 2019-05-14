var wsClients = [];
var WebSocketServer = require('websocket').server;
var http = require('http');
var AdminModel = require('./models/admin');

var wsReader = null;


function originIsAllowed(origin) {
  return true;
}

var server = http.createServer(function(request, response) {
        console.log((new Date()) + ' Received request for ' + request.url);
        response.writeHead(404);
        response.end();
});

server.listen(3330, function() {
        console.log((new Date()) + ' Server is listening on port 3330');
});

wsServer = new WebSocketServer({
        httpServer: server,
        // You should not use autoAcceptConnections for production
        // applications, as it defeats all standard cross-origin protection
        // facilities built into the protocol and the browser.  You should
        // *always* verify the connection's origin and decide whether or not
        // to accept it.
        autoAcceptConnections: false
});


var BoardCast = function BoardCast(message){
    for(var i = 0; i < wsClients.length; i++){
        if(wsClients[i][0] == "Client" && wsClients[i][2] == true){
            wsClients[i][1].sendUTF(message);
        }
    }
}

module.exports.BoardCast = BoardCast;


wsServer.on('request', function(request) {
    console.log("New Request");
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    console.log("ORIGIN: "+request.origin);
    //request.accept();
    var connection = request.accept('echo-protocol', request.origin);
    connection.on('message', async function(message) {
        console.log("MESSAGE TYPE: "+message.type);
        if (message.type === 'utf8') {
            console.log(message.utf8Data);
            if(message.utf8Data == "Reader"){

                console.log("HELLO WORLD");
                wsReader = connection;
                BoardCast('04:xx');
            }
            else{

                var split = message.utf8Data.split(',');

                var bool = await AdminModel.wsKeyValidate(split[0], split[1]);

                console.log("BOOL: " + bool);
                console.log("Name: " + split[0]);
                console.log("Key: " + split[1]);


                var data = [];
               
                data.push('Client');
                data.push(connection);
                data.push(bool);

                wsClients.push(data);
                if(wsReader == null && bool == true){
                    connection.sendUTF('03:xx');
                }
            }
        }
    });
    connection.on('close', function(reasonCode, description) {
        var type = ReturnConnectionType(connection);
        if(type == "Client"){
            console.log("client_close");
            RemoveClientFromArr(connection);

        }else{
            BoardCast('03:xx');
            wsReader = null;
        }
    });
});

function ReturnConnectionType(conn){
    for(var i = 0; i < wsClients.length; i++){
        if(wsClients[i][1] == conn){
            return wsClients[i][0];
        }
    }
    return "Reader";
}

function RemoveClientFromArr(conn){
    var index = 0;
    for(var i = 0; i < wsClients.length; i++){
        if(wsClients[i][1] == conn){
            index = i;
        }
    }

    wsClients.slice(index,1);
}

