const {bookmarks, runtime, tabs} = globalThis.browser;

runtime.onInstalled.addListener(() => {
  runtime.onMessage.addListener(onMessageHandler);
});

// handle messages from content script
const onMessageHandler = (message) => {
  console.log("MAXMAXMAX:background-script:", message);
  const {method} = message;
  const retVal = (
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

const onBookmarksEventHandler = (eventName, args) => {
  console.log("MAXMAXMAX:background-script:onBookmarksEventHandler:", {eventName, args});
  tabs
    .query({})
    .then(
      (tabList) => tabList.forEach(
        (tab) => {
          const isRealTab = tab.url; // about tabs have no url
          if (isRealTab) {
            tabs.sendMessage(tab.id, {eventName, args});
          }
        }
      )
    )
    .catch((error) =>
      console.log("MAXMAXMAX:background-script:onBookmarksEventHandler:sendMessage error:", error)
    );
};

const bookmarksEvents = [
  "onChanged",
  //"onChildrenReordered", // not FF
  "onCreated",
  //"onImportBegan", // not FF
  //"onImportEnded", // not FF
  "onMoved",
  "onRemoved",
];
bookmarksEvents.forEach((eventName) => {
  bookmarks[eventName].addListener((...args) => onBookmarksEventHandler(eventName, args));
});
