const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const store = require('../store');
var app = require('express')();

const main = require('../routes/logs');

// app.use(cors());
// app.use('/api', main);

app.use('/', main);

const server = http.createServer(app);
const io = require('socket.io')(server);
const socketStatusIo = io.of('/status');

var server_port = process.env.YOUR_PORT || process.env.PORT || 3001;

let clientsEvent = [];
let clientsStatus = [];

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
mapIds = ['outreal1id', 'inreal1id', 'WorldMap', 'valiza'];

sensorIds = {
    'outreal1id': {
        'maxcount': [36, 8, 5],
        'types': ['FPS', 'geo', 'cam']
    },
    'inreal1id': {
        'maxcount': [2, 3, 2, 2, 1],
        'types': ['FPS', 'cam', 'smoke', 'pir', 'ac']
    },
    // 'Plan3DJoita': {
    //     'maxcount': [1,3,2,2,1],
    //     'types': ['FPS', 'cam', 'smoke', 'pir', 'ac']
    // },
    'WorldMap': {
        'maxcount': [4],
        'types': ['FPS']
    },
    'valiza': {
        'maxcount': [1, 1, 1, 1, 1, 1, 1],
        'types': ['FPS','geo', 'cam', 'smoke', 'pir', 'ac', 'bar']
    }
}

function generateIdFPS() {
    let id = '';
    let zone = getRandomNumber(2) + 1;
    let segm;
    let side;
    switch (zone) {
        case 1:
            segm = getRandomNumber(24);
            side = getRandomItem(['', 'l', 'r']);
            id = `idj${zone}s${segm}${side}`;
            break;
        case 2:
            segm = getRandomNumber(12);
            side = getRandomItem(['', 'l', 'r']);
            id = `idj${zone}s${segm}${side}`;
            break;
        default:
            break;
    }
    return id;
}

async function createEvent() {
    return new Promise(async function (resolve, reject) {
        if(eventId === -1) eventId = await store.getLastId();
        let eventType = getRandomItem(eventTypes);
        let mapId = getRandomItem(mapIds);
        // mapId = 'valiza';
        let rtype = getRandomItem(sensorIds[mapId].types);
        // rtype = 'cam';
        let idx = sensorIds[mapId].types.indexOf(rtype);
        let ridx = getRandomNumber(sensorIds[mapId].maxcount[idx]);
        let rid = `${rtype}${ridx}`;
        if(rtype === 'FPS') {
            rid = generateIdFPS();
            if(mapId === 'valiza') rid = 'idj9s0';
        }
        let system = '';
        if(rtype === 'FPS') system = 'MAGUS FPS System';
        else if(rtype === 'geo') system = 'Magus GeoPS System';
        else if(rtype === 'cam') system = 'cctv';
        else if(rtype === 'smoke') system = 'Smoke Detection System';
        else if(rtype === 'pir') system = 'PIR Detectors';
        else if(rtype === 'ac') system = 'Access Control';
        else if(rtype === 'bar') system = 'Bariera'
        let message = {"zones": [ { "system": system, "sensorId": rid, "mapId": mapId, "siteId" : "joitareal1id", "locationId" : "joitarealid" }],
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

setInterval(sendMessage, 30*1000); // 10 secunde

async function sendStatusMessage() {
    for(var i=1; i<=6; i++){
        let message = createStatus(i);
        await broadcast(message, clientsStatus);
    }
}

setInterval(sendStatusMessage, 65*1000); // 1 minut

server.listen(server_port, () => {
    console.log("Started on : "+ server_port);
});