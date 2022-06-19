const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/css/styles.css",
    "/js/idb.js",
    "/js/index.js",
    "/manifest.json",
    "/icons/icon-72x72.png",
    "/icons/icon-96x96.png",
    "/icons/icon-128x128.png",
    "/icons/icon-144x144.png",
    "/icons/icon-152x152.png",
    "/icons/icon-192x192.png",
    "/icons/icon-384x384.png",
    "/icons/icon-512x512.png"
];

const CACHE_NAME = "budget-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

// install service worker and add waitUntil()
self.addEventListener("install", function (evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('installing cache : ' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    );

    self.skipWaiting();
});

// add an event listener to the activate event
self.addEventListener("activate", function (evt) {
    evt.waitUntil(
        caches.keys().then((keyList) => {
            // let cacheKeeplist = keyList.filter(function (key) {
            //     return key.indexOf("budget-cache-v1");
            // });
            // cacheKeeplist.push(CACHE_NAME);

            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("Removing old cache data", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

self.addEventListener("fetch", function (evt) {
    evt.respondWith(
        caches
            .open(DATA_CACHE_NAME)
            .then((cache) => {
                return fetch(evt.request)
                    .then((response) => {
                        if (response.status === 200) {
                            cache.put(evt.request.url, response.clone());
                        }
                        return response;
                    })
                    .catch((err) => {
                        return cache.match(evt.request);
                    });

                // it is possible to omit if/else for the console.log and put one line below such as this example
                // return request || fetch(e.request)
            })  
        .catch((err) => console.log(err))

    );
return;


evt.respondWith(
    fetch(evt.request).catch(function () {
        return caches.match(evt.request).then(function (response) {
            if (response) {
                return response;

            } else if (evt.request.headers.get("accept").includes("text/html")) {
                return caches.match("/");
            }
        });
    })
    );
});

