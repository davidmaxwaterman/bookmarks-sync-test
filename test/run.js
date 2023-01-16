import server from "panic-server/src/server.js";
import clients from "panic-server/src/clients.js";

// Start the server on port 8080.
server().listen(8080);

// Create dynamic lists of
// browsers and servers.
const servers = clients.filter('Node.js');
const browsers = clients.excluding(servers);

// Wait for the browser to connect.
await browsers.atLeast(2);

await browsers.each((browser, id) => {
  // set up each browser with common code
  browser.run((context) => {
    const button = document.querySelector("button");
    button.addEventListener("click", () => {}); // dummy to be able to select this code easily in debugger

    // add something to look at
    let element = document.createElement('h1');
    element.innerHTML = 'SYNC TESTING PAGE';
    document.body.appendChild(element);
    element = document.createElement('h2');
    element.innerHTML = `I AM CLIENT: ${context.props.id}`;
    document.body.appendChild(element);
  }, {id});
});

const browser0 = browsers.pluck(1);
const browser1 = browsers.excluding(browser0).pluck(1);

// set up first browser
await browser0.run(async () => {
  console.log("browser0:creating user");
  // create user and wait for response
  {
    const data = await new Promise((resolve) => {
      // set up listener
      const listener = (event) => {
        const {source, data} = event;
        console.log("MAXMAXMAX:", source, data);
        const meantForMe = source === window && data?.to === "panic";
        if (meantForMe) {
          resolve(data);
          window.removeEventListener("message", listener);
        }
      };

      window.addEventListener("message", listener);

      // create user
      window.postMessage({
        to: "contentScript",
        method: "createUser",
        username: "max",
        password: "waterman",
      });
    });

    // check response - throw an error if it isn't what is expected
    const {message} = data;
    const {type} = message;
    if (type == "setCreateSuccess") {
      console.log("browser0: createUser success:", data);
    } else {
      throw `browser0: didn't get setCreateSuccess:${data}`;
    }
  }

});

// set up second browser
await browser1.run(async () => {
  // user should already have been created on browser[0]

  console.log("browser1:logging in");
  // log in the user
  {
    const data = await new Promise((resolve) => {
      // set up listener
      const listener = (event) => {
        const {source, data} = event;
        const meantForMe = source === window && data?.to === "panic";
        if (meantForMe) {
          resolve(data);
          window.removeEventListener("message", listener);
        }
      };

      window.addEventListener("message", listener);

      window.postMessage({
        to: "contentScript",
        method: "loginUser",
        username: "max",
        password: "waterman",
      });
    });

    // check response - throw an error if it isn't what is expected
    const {message} = data;
    const {type} = message;
    if (type === "setLoginSuccess") {
      console.log("browser1: loginUser success:", data);
    } else {
      throw `browser1: didn't get setLoginSuccess:${data}`;
    }
  }

});

// now user is created and both browsers are logged in

// set up listener in browser1 and create a bookmark in browser0,
// and confirm browser1's listener gets the correct event
{
  const browser1Promise = browser1.run(async () => {
    const data = await new Promise((resolve) => {
      // set up listener
      const listener = (event) => {
        const {source, data} = event;
        console.log("browser1: got event when testing create():", data);
        const meantForMe = source === window && data?.to === "panic";
        if (meantForMe) {
          resolve(data);
          window.removeEventListener("message", listener);
        }
      };

      window.addEventListener("message", listener);
    })

    return data;
  });

  await browser0.run(() => {
    console.log("browser0: creating bookmark");

    window.postMessage({
      to: "contentScript",
      method: "create",
      params: {
        parentId: "unfiled_____",
        title: "Examples",
        url: "http://www.example.com/",
      }
    });
  });

  console.log("MAXMAXMAX: bookmark created in browser0");

  const data = await browser1Promise;
  console.log("MAXMAXMAX: got event in browser1 when creating bookmark in browser0:", JSON.stringify(data, null, 2));
  if (data[0].method === "onCreated") {
    const bookmark = data[0].params[1];
    if (bookmark.parentId === "unfiled_____"
      && bookmark.title === "Examples"
      && bookmark.url === "http://www.example.com/"
    ) {
      console.log("MAXMAXMAX: bookmark created SUCCESS");
    } else {
      console.log("MAXMAXMAX: bookmark create FAILED");
    }
  }
}

