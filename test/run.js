'use strict';
var server = require('../node_modules/panic-server/src/server.js');
var clients = require('../node_modules/panic-server/src/clients.js');

// Start the server on port 8080.
server().listen(8080);

// Create dynamic lists of
// browsers and servers.
var servers = clients.filter('Node.js');
var browsers = clients.excluding(servers);

// Wait for the browser to connect.
browsers.on('add', function (browser) {

  browser.run(function () {

    // This is run in the browser!
    var header = document.createElement('h1');
    header.innerHTML = 'OHAI BROWSR!';
    document.body.appendChild(header);

    // send event to content script to get bookmarks tree
    document.querySelector('button').addEventListener("click", () => {
      window.addEventListener("message", (event) => {
        const {source, data} = event;
        const fromContentScript = source === window && data?.from === "contentScript";
        if (fromContentScript) {
          console.log("MAXMAXMAX:panic:", data);
        }
      });

      window.postMessage({
        from: "panic",
        method: "getTree"
      });
    });
  });
});

