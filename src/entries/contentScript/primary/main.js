const {runtime} = globalThis.browser;

// handle messages from content script
const onMessageHandler = (args) => {
  console.log("MAXMAXMAX:content-script:", args);
};

runtime.onMessage.addListener(onMessageHandler);

window.addEventListener("message", async (event) => {
  const {source, data} = event;
  const fromPanic = source === window && data?.from === "panic";
  if (fromPanic) {
    const {method} = data;
    console.log("MAXMAXMAX:method:", method);
    const tree = await runtime.sendMessage({method:"getTree"});
    window.postMessage({
      from: "contentScript",
      method,
      tree
    });
  }
});
