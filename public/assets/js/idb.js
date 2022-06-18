// create variable to hold db connection
let db;

// establish a connection to indexdDB database called 'budget_tracker' and set it to version 1
const request = indexedDB.open('budget_tracker', 1);

// use an event that will emit if the database version changes (null to ver 1, v1 to v2 etc...)
request.onupgradeneeded = function(event) {
    const db = event.target.result;
    // create an object store or table called new_tracker with auto incrementing primary key
    db.createObjectStore('new_tracker', { autoIncrement: true });
};

// after successful request
request.onsuccess = function(event) {
    db = event.target.result;

    // check if app is online
    if (navigator.onLine) {
        uploadTracker();
    }
};

request.onerror = function(event) {
    // log error 
    console.log(event.target.errorCode)
};

// execute a function if an attempt is made to submit a new tracker and there's no internet connection
function saveRecord(record) {
    const transaction = db.transaction(['new_tracker'], 'readwrite');

    const trackerObjectStore = transaction.objectStore('new_tracker');

    trackerObjectStore.add(record);
}