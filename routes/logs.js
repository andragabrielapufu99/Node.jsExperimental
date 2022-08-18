const express = require('express');
const bodyParser = require('body-parser');
const store = require('../store');
const router = express.Router();
router.use(bodyParser.urlencoded({
    extended: true,
}));

router.use(bodyParser.json());

eventId = 0;

function getDateString() {
    let dateNow = new Date();
    return dateNow.getFullYear() + "-" +
        ("0"+(dateNow.getMonth()+1)).slice(-2) + "-" +
        ("0"+dateNow.getDate()).slice(-2)+" "+
        ("0"+dateNow.getHours()).slice(-2)+":"+
        ("0"+dateNow.getMinutes()).slice(-2)+":"+
        ("0"+dateNow.getSeconds()).slice(-2);
}

function createEvent() {
    let message = {"zones": [ { "system": "System Schrack", "sensorId": "schrack0", "mapId": "lvl0", "siteId" : "tomesti", "locationId" : "is" }],
        "event": "NORMAL",
        "eventType": "RESTORE",
        "message": "Open Alarm (from DB)",
        "date" : getDateString(),
        "eventId": eventId+1
    };
    eventId += 1;
    return message;
}

router.get('/getevents',async (req, res) => {
    try {
        let events = await store.getEvents();
        // for(var i=0; i<1000; i++){
        //     events.push(createEvent());
        // }
        res.status(200).send(events);
    } catch (err) {
        res.status(500).send('{"error" : "'+err+'"}');
    }
});

var fields = {}

const initFields = () => {
    for(let i=1; i<=6; i++){
        fields[i] = [
            {key: `ID`, title: `${i}`},
            {key: `Mode_${i}`, title: `Mode ${i} from DB`},
            {key: `Control_${i}`, title: `Control ${i} from DB`},
            {key: `ReadyToReceive_${i}`, title: `Ready To Receive ${i} from DB`},
            {key: `HighVoltage_${i}`, title: `High Voltage ${i} from DB`},
            {key: `Belt_${i}`, title: `Belt ${i} from DB`},
            {key: `Status_${i}`, title: `Status ${i} from DB`},
            {key: `StatusInfo_${i}`, title: `Status Info_${i} from DB`}
        ]
    }
}

initFields();

function createStatus(statusId) {
    let message = {};
    fields[statusId].forEach(field => message[field.key] = field.title);
    return message;
}

router.get('/getstatus/:id',async (req, res) => {
    try {
        let status = createStatus(req.params.id);
        res.status(200).send(status);
    } catch (err) {
        res.status(500).send('{"error" : "'+err+'"}');
    }
});

module.exports = router ;