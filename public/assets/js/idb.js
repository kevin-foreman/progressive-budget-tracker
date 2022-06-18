// create variable to hold db connection
let db;

// establish a connection to indexdDB database called 'budget_tracker' and set it to version 1
const request = indexedDB.open('budget_tracker', 1);

// use an event that will emit if the database version changes (null to ver 1, v1 to v2 etc...)
request.onupgradeneeded = function(event) {
    const db = event.target.result;
    // create an object store or table called new_transaction with auto incrementing primary key
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

// after successful request
request.onsuccess = function(event) {
    db = event.target.result;

    // check if app is online
    if (navigator.onLine) {
        uploadTransaction();
    }
};

request.onerror = function(event) {
    // log error 
    console.log(event.target.errorCode)
};

// execute a function if an attempt is made to submit a new transaction and there's no internet connection
function saveRecord(record) {
    const transaction = db.transaction('new_transaction', 'readwrite');

    const transactionObjectStore = transaction.objectStore('new_transaction');

    transactionObjectStore.add(record);
}

// add a function to use the object srore in indexedDB and POST it to the server when connection returns
function uploadTransaction() {
    const transaction = db.transaction('new_transaction', 'readwrite');

    const transactionObjectStore = transaction.objectStore('new_transaction');

    const getAll = transactionObjectStore.getAll();

    // on a successful getAll execution, run the following

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['new_transaction'], 'readwrite');

                const transactionObjectStore = transaction.objectStore('new_transaction');

                // clear items from store after succesful POST
                transactionObjectStore.clear();

                alert('All saved transactions have been submitted');
            })
            .catch(err => {
                console.log(err);
            });
        }
    };
};

// listen for restarted connection or back online
window.addEventListener('online', uploadTransaction);