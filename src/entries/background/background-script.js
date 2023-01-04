const {bookmarks, runtime} = globalThis.browser;

runtime.onInstalled.addListener(() => {
  runtime.onMessage.addListener(onMessageHandler);
});

// handle messages from content script
const onMessageHandler = async (message) => {
  console.log("MAXMAXMAX:background-script:", message);
  const {method} = message;
  const retVal = await (
    bookmarks[method] // call it if it exists in the bookmarks API
    ||
    ( // else return an error
      () => {
        return {error: `no such method: ${method}`};
      }
    )
  )();

  return retVal;
};
