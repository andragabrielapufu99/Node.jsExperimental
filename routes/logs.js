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
        console.log('GET EVENTS');
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

let plans_coordinates = {
    '0': {
       'latlang': [
           [[-9,67.25], [-9.75,84.5]],
           [[-9.75,88.75], [-9.75, 106]],
           [[-9.75, 108.75], [ -9,127]],
           [[-9.25, 130.75], [ -9.25,147]],
           [[-9, 151], [ -9,168]],
           [[-9, 171.25], [ -9,188]],
           [[-8, 191.75], [ -8.25,208]],
           [[-8.5, 212], [ -8.25,229]],
           [[-8.5, 232], [ -8.5,250]],
           [[-8.5, 253.75], [ -8.25,267.75]],
           [[-8.5, 272], [ -8.5,288.75]],
           [[-8.5, 294.25], [ -9.25,300.75]],
           [[-12.5, 299.25], [ -37, 299.75]],
           [[-40.5, 299.75], [-68, 299.75]],
           [[-71.5, 299.75], [-99, 300.25]],
           [[-102.75, 299.25], [-124, 300.25]],
           [[-125, 297.75], [-124, 284.5]],
           [[-123.75, 278.75], [-124.25, 264]],
           [[-124, 258.75], [-124.25, 244.5]],
           [[-124.5, 238.25], [-124.75, 222.25]],
           [[-125, 218.5], [-124.75, 201]],
           [[-124.25, 197.5], [-124.5, 181]],
           [[-123.5, 177.75], [-124.5, 160.75]],
           [[-124.5, 157.75], [-124.25, 141.25]],
           [[-124.25, 138.25], [-124, 121.25]],
           [[-125, 118.25], [-124.5, 100]],
           [[-124.25, 97], [-124.5, 80]],
           [[-124.5, 76.75], [-123.75, 60.25]],
           [[-124.75, 57.5], [-124.25, 34.75]],
           [[-125.25, 29.75], [-98.25, 29.75]],
           [[-92.25, 30], [-66.25, 29.5]],
           [[-61.25, 30], [-49.75, 30.25]],
           [[-47, 30], [-31.5, 29.75]],
           [[-31.25, 32.5], [-31.25, 42.75]],
           [[-32, 44.75], [-31, 54.75]],
           [[-28.25, 56.25], [-16.25, 56]],
           [[-12.5, 56], [-7.25, 55.75], [-8, 63.5]]
       ],
       'circlelatlang': [
           [-19, 69.5],
           [-18, 92.5],
           [-18.75, 114],
           [-18.25, 140.5],
           [-113.75, 284],
           [-114.25, 253],
           [-112.5, 225],
           [-113.25, 201]
       ],
       'cameraPositions': [
           [-18, 44.25],
           [-10.5, 299.25],
           [-114.75, 296.5],
           [-116.5, 39.75],
           [-11.75, 173.25]
       ]
    }
}
router.get('/plans/:id/latlang',async (req, res) => {
    try {
        let plan_id = req.params.id;
        let coordinates = plans_coordinates[plan_id].latlang;
        res.status(200).send(coordinates);
    } catch (err) {
        res.status(500).send('{"error" : "'+err+'"}');
    }
});

router.get('/plans/:id/circlelatlang',async (req, res) => {
    try {
        let plan_id = req.params.id;
        let coordinates = plans_coordinates[plan_id].circlelatlang;
        res.status(200).send(coordinates);
    } catch (err) {
        res.status(500).send('{"error" : "'+err+'"}');
    }
});

router.get('/plans/:id/camerapositions',async (req, res) => {
    try {
        let plan_id = req.params.id;
        let coordinates = plans_coordinates[plan_id].cameraPositions;
        res.status(200).send(coordinates);
    } catch (err) {
        res.status(500).send('{"error" : "'+err+'"}');
    }
});



module.exports = router ;