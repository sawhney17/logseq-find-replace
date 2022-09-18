import "@logseq/libs";
import "virtual:windi.css";

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import { logseq as PL } from "../package.json";
import { handleClosePopup } from "./handleClosePopup";


const css = (t, ...args) => String.raw(t, ...args);
const pluginId = PL.id;
const isDev = process.env.NODE_ENV === "development";

function main() {
  console.info(`#${pluginId}: MAIN`);
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById("app")
  );
handleClosePopup()
  function createModel() {
    return {
      toggleFindReplaceUI() {
        logseq.showMainUI();
      },
    };
  }
  logseq.provideModel(createModel());
  logseq.setMainUIInlineStyle({
    zIndex: 11,
  });

  const openIconName = "open-find-and-replace";

  logseq.App.registerUIItem("toolbar", {
    key: openIconName,
    template: `
      <a class="button" data-on-click="toggleFindReplaceUI">
        <i class="ti ti-replace"></i>
      </a>
    `, 
  });
}

if (isDev && import.meta.hot) {
  const maybePlugin = top?.LSPluginCore.registeredPlugins.get(pluginId);
  import.meta.hot.accept(() => {});
  import.meta.hot.dispose(() => {
    top?.LSPluginCore.reload(pluginId);
    console.log(`✨Plugin ${pluginId} reloaded ✨`);
  });
  if (!maybePlugin?.loaded) {
    logseq.ready(main).catch(console.error);
  }
} else {
  logseq.ready(main).catch(console.error);
}
