const fs = require('fs');

let events = [];
let lastEventId = 0;

async function readEvents() {
    return new Promise(function (resolve, reject){
        fs.readFile('./database.json', 'utf8', (err, data) => {

            if (err) {
                console.log(`Error reading file from disk: ${err}`);
                reject(err);
            } else {
                if(data !== '') {
                    events = JSON.parse(data);
                    if(events.length > 0)  lastEventId = events[0].eventId;
                    resolve();
                }
            }

        });
    });

}

async function writeEvents() {
    return new Promise(function (resolve, reject) {
        fs.writeFile('./database.json', JSON.stringify(events), 'utf8', (err) => {
            if (err) {
                console.log(`Error writing file: ${err}`);
                reject(err);
            } else {
                console.log(`File is written successfully!`);
                resolve();
            }
        });
    });
}

async function saveEvent(event) {
    events.splice(0, 0, event);
    await writeEvents();
}

async function getEvents() {
    return new Promise(async function (resolve, reject) {
        await readEvents();
        resolve(events);
    });
}

async function getLastId() {
    return new Promise(async function (resolve, reject) {
        await readEvents();
        resolve(lastEventId);
    });
}

async function clear() {
    events = [];
    await writeEvents();
}

// clear();

async function readSensors() {
    return new Promise(function (resolve, reject){
        fs.readFile('./sensors.json', 'utf8', (err, data) => {

            if (err) {
                console.log(`Error sensors reading file from disk: ${err}`);
                reject(err);
            } else {
                if(data !== '') {
                    let sensors = JSON.parse(data);
                    resolve(sensors);
                }
            }

        });
    });
}

async function readPlans() {
    return new Promise(function (resolve, reject){
        fs.readFile('./plans.json', 'utf8', (err, data) => {

            if (err) {
                console.log(`Error plans reading file from disk: ${err}`);
                reject(err);
            } else {
                if(data !== '') {
                    let plans = JSON.parse(data);
                    resolve(plans);
                }
            }

        });
    });
}

async function writeSensors(sensors) {
    return new Promise(function (resolve, reject) {
        fs.writeFile('./sensors.json', JSON.stringify(sensors), 'utf8', (err) => {
            if (err) {
                console.log(`Error writing file: ${err}`);
                reject(err);
            } else {
                console.log(`File for sensors is written successfully!`);
                resolve();
            }
        });
    });

}

async function writePlans(plans) {
    return new Promise(function (resolve, reject) {
        fs.writeFile('./plans.json', JSON.stringify(plans), 'utf8', (err) => {
            if (err) {
                console.log(`Error writing file: ${err}`);
                reject(err);
            } else {
                console.log(`File for sensors is written successfully!`);
                resolve();
            }
        });
    });

}

module.exports = {
    saveEvent,
    getEvents,
    getLastId,
    readSensors,
    writeSensors,
    readPlans,
    writePlans
}
