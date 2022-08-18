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

module.exports = {
    saveEvent,
    getEvents,
    getLastId
}