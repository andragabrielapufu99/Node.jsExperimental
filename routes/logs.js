const express = require('express');
const bodyParser = require('body-parser');
const store = require('../store');
const router = express.Router();
const mjpeg = require('mp4-mjpeg');
const fs = require('fs');
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

// var sensorsList = [];

router.post('/add', async(req, res) => {
    console.log('ADD SENSORS');
    try {
        // console.log(req.body.sensors);
        // let s = req.body.sensors;
        let sensorsList = await store.readSensors();
        let s = req.body;
        let sadd = [];
        s.forEach(x => {
            if(!sensorsList.includes(x)){
                sensorsList.push(x);
                sadd.push(x);
            }
        });
        await store.writeSensors(sensorsList);
        // res.status(200).send({"sensors": sadd});
        res.status(200).send(sadd);
    } catch (err) {
        res.status(500).send('{"error" : "'+err+'"}');
    }
});

router.post('/update', async(req, res) => {
    console.log('UPDATE SENSORS');
    try {
        // let s = req.body.sensors;
        let sensorsList = await store.readSensors();
        let s = req.body;
        let supd = [];
        s.forEach((value) => {
          let idx = sensorsList.findIndex((x) => x.id === value.id);
          sensorsList[idx] = value;
          supd.push(value);
        });
        // res.status(200).send({"sensors": supd});
        await store.writeSensors(sensorsList);
        res.status(200).send(supd);
    } catch (err) {
        res.status(500).send('{"error" : "'+err+'"}');
    }
});

const checkEqualObj = (obj1, obj2) => {
    let result = true;
    Object.keys(obj1).forEach((k) => {
        if(result) result = k in obj2 && (obj1[k] === obj2[k]);
    });
    return result;
}

const findPosArray = (obj, arr) => {
    let idx = 0;
    let pos = -1;
    arr.forEach(x => {
       // if(pos === -1 && checkEqualObj(x, obj) && checkEqualObj(obj, x)) pos = idx;
        if(x.id === obj.id) pos = idx;
       idx = idx +1;
    });
    return pos;
}

router.post('/delete', async(req, res) => {
    console.log('DELETE SENSORS');
    try {
        // let s = req.body.sensors;
        let sensorsList = await store.readSensors();
        let s = req.body;
        let sdel = [];
        s.forEach(x => {
            let pos = findPosArray(x, sensorsList);
            if(pos !== -1){
                sensorsList.splice(pos, 1);
                sdel.push(x);
            }
        });
        // res.status(200).send({"sensors": sdel});
        await store.writeSensors(sensorsList);
        res.status(200).send(sdel);
    } catch (err) {
        res.status(500).send('{"error" : "'+err+'"}');
    }
});

router.get('/sensors', async(req, res) => {
    console.log('GET SENSORS');
    try {
        // res.status(200).send({"sensors": sensorsList});
        let sensorsList = await store.readSensors();
        res.status(200).send(sensorsList);
    } catch (err) {
        res.status(500).send('{"error" : "'+err+'"}');
    }
});

router.get('/sensors/:plan_id', async(req, res) => {
    console.log('GET SENSORS');
    try {
        let plan_id = req.params.plan_id;
        // res.status(200).send({"sensors": sensorsList});
        let sensorsList = await store.readSensors();
        let planSensorList = [];
        for(let index=0; index<sensorsList.length; index++){
            if('plan_id' in sensorsList[index] && sensorsList[index].plan_id === plan_id){
                planSensorList.push(sensorsList[index]);
            }
        }
        res.status(200).send(planSensorList);
    } catch (err) {
        res.status(500).send('{"error" : "'+err+'"}');
    }
});

router.get('/streaming', async(req, res) => {
    // starting a video file
    const imageAsDataURL = 'http://192.168.60.14:10090/video31.mjpg';
    mjpeg({ fileName: "file.mp4" })
        .then( (recorder) => {

            // append a JPEG image as a data URL to the video
            recorder.appendImageDataUrl( imageAsDataURL )
                .then( () => {
                    // image added
                })
                .catch( (error) => {
                    // something bad happened
                })

            // all the images added ?
            // let finalize the MP4 file to make it playable
            recorder.finalize()
                .then( () => {
                    // MP4 video file is ready
                    fs.readFile('file.mp4', 'utf8', (err, data) => {

                        if (err) {
                            console.log(`Error sensors reading file from disk: ${err}`);
                            res.status(500).send('{"error" : "'+err+'"}');
                        } else {
                            res.status(200).send(data);
                        }

                    });
                })
                .catch( (error) => {
                // too bad
            })

        })
        .catch( (error) => {
            // could not create the file
        })
});



module.exports = router ;