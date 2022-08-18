const WebSocket = require('ws');
const server = new WebSocket.Server({
   port: 8080
});

let sockets = [];

function getDateString() {
    let dateNow = new Date();
    return dateNow.getFullYear() + "-" +
        ("0"+(dateNow.getMonth()+1)).slice(-2) + "-" +
        ("0"+dateNow.getDate()).slice(-2)+" "+
        ("0"+dateNow.getHours()).slice(-2)+":"+
        ("0"+dateNow.getMinutes()).slice(-2)+":"+
        ("0"+dateNow.getSeconds()).slice(-2);
}

eventId = 0;

function createEvent() {
    let message = {"zones": [ { "system": "System Schrack", "sensorId": "schrack0", "mapId": "lvl0", "siteId" : "tomesti", "locationId" : "is" }],
            "event": "NORMAL",
            "eventType": "RESTORE",
            "message": "Open Alarm",
            "date" : getDateString(),
            "eventId": eventId+1
        };
    eventId += 1;
    return message;
}

server.on('connection', function (socket) {
    console.log(`Connected: ${socket.toString()}`);
    sockets.push(socket);

    function sendMessage() {
        let number_events = Math.floor(Math.random() * 100) + 1; // intre 1 si 100
        let messages = [];
        for(let i=0; i<number_events; i++){
            messages.push(createEvent());
        }
        let message = JSON.stringify(messages);
        sockets.forEach(s => s.send(message));
    }

    socket.on('message', function(msg) {
        console.log('Send previous events');
        sendMessage();
    });

    // setInterval(sendMessage, 10*1000); // 1 minut
    socket.on('close', function() {
       sockets = sockets.filter((s => s !== socket));
    });
});

server.on('request', app);