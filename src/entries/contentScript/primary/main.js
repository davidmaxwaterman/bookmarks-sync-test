import renderContent from "../renderContent";
import logo from "~/assets/logo.svg";
import "./style.css";

renderContent(import.meta.PLUGIN_WEB_EXT_CHUNK_CSS_PATHS, (appRoot) => {
  const logoImageUrl = new URL(logo, import.meta.url).href;

  appRoot.innerHTML = `
    <div class="logo">
      <img src="${logoImageUrl}" height="50" alt="" />
    </div>
  `;
});

const {runtime} = globalThis.browser;

// handle messages from content script
const onMessageHandler = (args) => {
  console.log("MAXMAXMAX:content-script:", args);
};

runtime.onMessage.addListener(onMessageHandler);

console.log("MAXMAXMAX:",
  await runtime.sendMessage({method:"getTree"})
);
