import "@webcomponents/scoped-custom-element-registry";
import "@omicronenergy/oscd-shell/oscd-shell.js";
import { loadPlugins } from "./plugins.js";

import {
  registerTranslateConfig,
  use,
} from "./plugins/openscd.github.io/_snowpack/pkg/lit-translate.js";
import { loader as openscdTranslationLoader } from "./plugins/openscd.github.io/openscd/dist/translations/loader.js";

const _customElementsDefine = window.customElements.define;
window.customElements.define = (name, cl, conf) => {
  if (!customElements.get(name)) {
    try {
      _customElementsDefine.call(window.customElements, name, cl, conf);
    } catch (e) {
      console.warn(e);
    }
  }
};

const oscdShell = document.querySelector("oscd-shell");
try {
  loadPlugins(oscdShell);
} catch (err) {
  console.error("Error loading plugins:", err);
}

/*
 * The plugins currently located in the SprintEins monorepo are using the lit-translate library.
 * This requires us to register their loader with their copy of the lit-translate, so that translations work properly.
 */
registerTranslateConfig({
  loader: openscdTranslationLoader,
  empty: (key) => key,
});
use("en");

const params = new URL(document.location).searchParams;
for (const [name, value] of params) {
  oscdShell.setAttribute(name, value);
}

const isElectron = !!window?.electronAPI;

if (isElectron) {
  window.electronAPI.onFileOpen(async (fileName, filePath) => {
    try {
      const text = await window.electronAPI.readFile(filePath);
      const doc = new DOMParser().parseFromString(text, "application/xml");
      const openScd = document.querySelector("oscd-shell");
      openScd.dispatchEvent(
        new CustomEvent("oscd-open", {
          bubbles: true,
          composed: true,
          detail: { doc, docName: fileName },
        }),
      );
    } catch (err) {
      console.error("Error reading file:", err);
    }
  });

  window.electronAPI.onZoom((direction) => {
    window.electronAPI.zoom(direction);
  });

  document.addEventListener(
    "wheel",
    (event) => {
      if (event.ctrlKey) {
        event.preventDefault();
        // Send zoom event to preload script via window.postMessage
        window.postMessage(
          {
            type: "zoom",
            direction: event.deltaY < 0 ? "in" : "out",
          },
          "*",
        );
      }
    },
    { passive: false },
  );
}
