const APP_PREFIX = 'FoodEvent-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION
// can't hardcode an absolute path if we want this to work in development and production, because this page will be hosted at the github.io/projectname subroute: use relative paths.
const FILES_TO_CACHE = [
  "./index.html",
  "./events.html",
  "./tickets.html",
  "./schedule.html",
  "./assets/css/style.css",
  "./assets/css/bootstrap.css",
  "./assets/css/tickets.css",
  "./dist/app.bundle.js",
  "./dist/events.bundle.js",
  "./dist/tickets.bundle.js",
  "./dist/schedule.bundle.js"
];



// -------- LIFECYLE PHASE 1: Cache resources -------------------
//use e.waitUntil to tell the browser to wait until the work is complete before terminating the service worker. 
self.addEventListener('install', function (e) {
  e.waitUntil(
    // caches.open to find the specific cache by name, then add every file in the FILES_TO_CACHE array to the cache.
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('installing cache : ' + CACHE_NAME)
      return cache.addAll(FILES_TO_CACHE)
    })
  )
});

// ---------- LIFECYCLE PHASE 2: Delete outdated caches --------------
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      // [keyList] --returned from keys()-- contains all cache names under your username.github.io
      // filter out ones that have this app prefix to create keeplist
      let cacheKeeplist = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX);
      })
      // add current cache name to keeplist
      cacheKeeplist.push(CACHE_NAME);
      // not return until all promises are resolved or rejected
      return Promise.all(keyList.map(function (key, i) {
        // if key cant be found from keyList it will be deleted
        // will ony return -1 if item is not found in the keyList
        // if not found, delete it from the cache!
        if (cacheKeeplist.indexOf(key) === -1) {
          console.log('deleting cache : ' + keyList[i]);
          return caches.delete(keyList[i]);
        }
      }));
    })
  );
});

// Respond with cached resources
self.addEventListener('fetch', function (e) {
  console.log('fetch request : ' + e.request.url)
  e.respondWith(
    //if resource IS cached retrieve it:
    caches.match(e.request).then(function (request) {
      if (request) {
        console.log('responding with cache : ' + e.request.url)
        return request
      } else { //if resource isn't cached - then get regular way:
        console.log('file is not cached, fetching : ' + e.request.url)
        return fetch(e.request)
      }
    })

    // You can omit if/else for console.log & put one line below like this too.
    // return request || fetch(e.request)
  )
})
