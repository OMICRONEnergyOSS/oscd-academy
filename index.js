import "@webcomponents/scoped-custom-element-registry";
import "@omicronenergy/oscd-shell/oscd-shell.js";
import { plugins } from "./plugins.js";

import OscdMenuOpen from "@omicronenergy/oscd-menu-open";
import OscdMenuSave from "@omicronenergy/oscd-menu-save";
import {
  OscdMenuNew,
  OscdMenuUndo,
  OscdMenuRedo,
} from "@omicronenergy/oscd-menu-commons";

import OscdBackgroundEditV1 from "@omicronenergy/oscd-background-editv1";
import OscdBackgroundWizardEvents from "@omicronenergy/oscd-background-wizard-events/oscd-background-wizard-events.js";

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
const registry = oscdShell.registry;
registry.define("oscd-menu-open", OscdMenuOpen);
registry.define("oscd-menu-save", OscdMenuSave);
registry.define("oscd-menu-new", OscdMenuNew);
registry.define("oscd-menu-undo", OscdMenuUndo);
registry.define("oscd-menu-redo", OscdMenuRedo);
registry.define("oscd-background-editv1", OscdBackgroundEditV1);
registry.define("oscd-background-wizard-events", OscdBackgroundWizardEvents);

oscdShell.plugins = plugins;

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
        })
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
          "*"
        );
      }
    },
    { passive: false }
  );
}
