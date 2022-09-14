const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const store = require('../store');
const EventEmitter = require('events');

var app = require('express')();

const main = require('../routes/logs');

// app.use(cors());
// app.use('/api', main);

app.use('/', main.router);

const server = http.createServer(app);
const io = require('socket.io')(server);
const socketStatusIo = io.of('/status');

var server_port = process.env.YOUR_PORT || process.env.PORT || 3001;

let clientsEvent = [];
let clientsStatus = [];

let emitter = new EventEmitter();

main.setEmitter(emitter);
emitter.on('message', async (message) => {
    console.log(message);
    await sendMessage2(message);
})

const broadcast = async (message, clients) => {
    clients.forEach((client) => {
        client.send(JSON.stringify(message));
    });
};

io.on('connection', (socket) => {
    console.log('Connection');
    if(!clientsEvent.includes(socket)) clientsEvent.push(socket);
    socket.on('close', () => {
        console.log('Socket close');
        clientsEvent.splice(clientsEvent.indexOf(socket), 1);
    });
});

socketStatusIo.on('connection', (socket) => {
    console.log('Connection Status');
    if(!clientsStatus.includes(socket)) clientsStatus.push(socket);
    socket.on('close', () => {
        console.log('Status Socket close');
        clientsStatus.splice(clientsStatus.indexOf(socket), 1);
    });
});

var currentID = -1;

var fields = {}

const initFields = () => {
    for(let i=1; i<=6; i++){
        fields[i] = [
            {key: `ID`, title: `${i}`},
            {key: `Mode_${i}`, title: `Mode ${i}`},
            {key: `Control_${i}`, title: `Control ${i}`},
            {key: `ReadyToReceive_${i}`, title: `Ready To Receive ${i}`},
            {key: `HighVoltage_${i}`, title: `High Voltage ${i}`},
            {key: `Belt_${i}`, title: `Belt ${i}`},
            {key: `Status_${i}`, title: `Status ${i}`},
            {key: `StatusInfo_${i}`, title: `Status Info_${i}`}
        ]
    }
}

initFields();

function getDateString() {
    let dateNow = new Date();
    return dateNow.getFullYear() + "-" +
        ("0"+(dateNow.getMonth()+1)).slice(-2) + "-" +
        ("0"+dateNow.getDate()).slice(-2)+" "+
        ("0"+dateNow.getHours()).slice(-2)+":"+
        ("0"+dateNow.getMinutes()).slice(-2)+":"+
        ("0"+dateNow.getSeconds()).slice(-2);
}

var eventId = -1;
var max_events = 5000;

getRandomItem = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
}

getRandomNumber = (vmax) => {
    return Math.floor(Math.random() * vmax);
}

eventTypes = ['ALARM', 'RESTORE', 'FAULT'];

async function createEvent() {
    return new Promise(async function (resolve, reject) {
        if(eventId === -1) eventId = await store.getLastId();
        let eventType = getRandomItem(eventTypes);
        let sensors = await store.readSensors();
        let rsensor = getRandomItem(sensors);
        let system = '';
        if(rsensor.type === 'fps') system = 'MAGUS FPS System';
        else if(rsensor.type === 'geops') system = 'Magus GeoPS System';
        else if(rsensor.type === 'cctv') system = 'cctv';
        else if(rsensor.type === 'smoke') system = 'Smoke Detection System';
        else if(rsensor.type === 'pir') system = 'PIR Detectors';
        else if(rsensor.type === 'accessControl') system = 'Access Control';
        else if(rsensor.type === 'barrier') system = 'Bariera'
        let message = {"zones": [ { "system": system, "sensorId": rsensor.id, "mapId": rsensor.plan_id, "siteId" : "joitareal1id", "locationId" : "joitarealid" }],
            "event": eventType,
            "eventType": eventType,
            "message": `${system} ${eventType}`,
            "date" : getDateString(),
            "eventId": eventId+1
        };
        await store.saveEvent(message);
        eventId += 1;
        resolve(message);
    });
}

function createStatus(id) {
    let message = {};
    currentID = id;
    if(currentID !== -1){
        const date = new Date();
        fields[currentID].forEach(field => {
            if(field.key !== 'ID') message[field.key] = `${field.key}_${currentID}_${date.getMinutes()}`;
            else message[field.key] = field.title;
        });
    }
    return message;
}

async function sendMessage() {
    // let number_events = Math.floor(Math.random() * max_events) + 1; // intre 1 si 5000
    // console.log(`Emit ${number_events} events`);
    // for(let i=0; i<number_events; i++){
    //     let message = createEvent();
    //     socket.send(message);
    // }
    let message = await createEvent();
    await broadcast(message, clientsEvent);
}

async function sendMessage2(message) {
    eventId += 1;
    await broadcast(message, clientsEvent);
}

// setInterval(sendMessage, 30*1000); // 10 secunde

async function sendStatusMessage() {
    for(var i=1; i<=6; i++){
        let message = createStatus(i);
        await broadcast(message, clientsStatus);
    }
}

setInterval(sendStatusMessage, 65*1000); // 1 minut

module.exports = {sendMessage2};

server.listen(server_port, () => {
    console.log("Started on : "+ server_port);
});

