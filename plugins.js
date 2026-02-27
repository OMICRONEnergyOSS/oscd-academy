import OscdMenuOpen from "@omicronenergy/oscd-menu-open";
import OscdMenuSave from "@omicronenergy/oscd-menu-save";
import OscdMenuNew from "@omicronenergy/oscd-menu-commons/oscd-menu-new.js";
import OscdMenuUndo from "@omicronenergy/oscd-menu-commons/oscd-menu-undo.js";
import OscdMenuRedo from "@omicronenergy/oscd-menu-commons/oscd-menu-redo.js";

// import OscdEditorSld from "@omicronenergy/oscd-editor-sld";
import OscdEditorDiff from "@omicronenergy/oscd-editor-diff";
import OscdEditorSource from "@omicronenergy/oscd-editor-source";
import { OscdEditorIED } from "@omicronenergy/oscd-editor-ied";

import OscdBackgroundEditV1 from "@omicronenergy/oscd-background-editv1";
import OscdBackgroundWizardEvents from "@omicronenergy/oscd-background-wizard-events/oscd-background-wizard-events.js";

export const loadPlugins = (oscdShell) => {
  const registry = oscdShell.registry;
  registry.define("oscd-menu-open", OscdMenuOpen);
  registry.define("oscd-menu-save", OscdMenuSave);
  registry.define("oscd-menu-new", OscdMenuNew);
  registry.define("oscd-menu-undo", OscdMenuUndo);
  registry.define("oscd-menu-redo", OscdMenuRedo);
  registry.define("oscd-background-editv1", OscdBackgroundEditV1);
  registry.define("oscd-background-wizard-events", OscdBackgroundWizardEvents);
  // registry.define("oscd-editor-sld", OscdEditorSld);
  registry.define("oscd-editor-diff", OscdEditorDiff);
  registry.define("oscd-editor-source", OscdEditorSource);
  registry.define("oscd-editor-ied", OscdEditorIED);

  oscdShell.plugins = {
    menu: [
      {
        name: "Open File",
        translations: { de: "Datei öffnen" },
        icon: "folder_open",
        requireDoc: false,
        tagName: "oscd-menu-open",
      },
      {
        name: "New File",
        translations: { de: "Neu Datei" },
        icon: "create_new_folder",
        requireDoc: false,
        tagName: "oscd-menu-new",
      },
      {
        name: "Save File",
        translations: { de: "Datei speichern" },
        icon: "save",
        requireDoc: true,
        tagName: "oscd-menu-save",
      },
      {
        name: "Validating",
        translation: {
          de: "Validieren",
        },
        icon: "rule_folder",
        requireDoc: true,
        src: "plugins/scl-validating/scl-validating.js",
      },
      {
        name: "Import IEDs",
        translations: { de: "Import IEDs" },
        requireDoc: true,
        icon: "snippet_folder",
        src: "plugins/scl-import-ied/scl-import-ied.js",
      },
      {
        name: "Rename IEDs",
        translations: { de: "Rename IEDs" },
        icon: "edit",
        requireDoc: true,
        src: "https://danyill.github.io/oscd-rename-ieds/oscd-rename-ieds.js",
      },
      {
        name: "Virtual Template IED",
        translations: {
          de: "Virtual Template IED",
        },
        icon: "edit",
        requireDoc: true,
        src: "https://openenergytools.github.io/virtual-template-ied/virtual-template-ied.js",
      },
      {
        name: "Remove IEDs",
        translations: { de: "Remove IEDs" },
        icon: "delete",
        requireDoc: true,
        src: "plugins/oscd-remove-ieds/oscd-remove-ieds.js",
      },
      {
        name: "Merge Project",
        translations: { de: "Merge Project" },
        icon: "merge_type",
        requireDoc: true,
        src: "https://openscd.github.io/plugins/src/menu/Merge.js",
      },

      {
        name: "Undo",
        translations: { de: "Undo" },
        icon: "undo",
        requireDoc: true,
        tagName: "oscd-menu-undo",
      },
      {
        name: "Redo",
        translations: { de: "Redo" },
        icon: "redo",
        requireDoc: true,
        tagName: "oscd-menu-redo",
      },
    ],
    editor: [
      {
        name: "SLD Designer",
        translations: {
          de: "SLD Designer",
        },
        icon: "add_box",
        requireDoc: true,
        src: "https://stee-re.github.io/oscd-editor-sld-temp/oscd-editor-sld.js",
      },
      // {
      //   name: "SLD Designer (new)",
      //   translations: {
      //     de: "SLD Designer(new)",
      //   },
      //   icon: "add_box",
      //   requireDoc: true,
      //   tagName: "oscd-editor-sld",
      // },
      {
        name: "Substation",
        translations: {
          de: "Substation",
        },
        icon: "margin",
        requireDoc: true,
        src: "https://omicronenergyoss.github.io/oscd-editor-substation/oscd-editor-substation.js",
      },
      {
        name: "Template Generator",
        translations: {
          de: "Template Generator",
        },
        icon: "copy_all",
        requireDoc: true,
        src: "./plugins/oscd-template-generator/oscd-template-generator.js",
      },
      {
        name: "Template Update",
        translations: {
          de: "Template Update",
        },
        icon: "copy_all",
        requireDoc: true,
        src: "./plugins/scl-template-update/scl-template-update.js",
      },
      {
        name: "Template Editor",
        translations: {
          de: "Template Editor",
        },
        icon: "copy_all",
        requireDoc: true,
        src: "https://omicronenergyoss.github.io/oscd-editor-template/oscd-editor-template.js",
      },
      {
        name: "Bay Template Editor (OpenEnergyTools)",
        translations: {
          de: "Bay Template Editor (OpenEnergyTools)",
        },
        icon: "edit",
        requireDoc: true,
        src: "https://openenergytools.github.io/scl-bay-template/scl-bay-template.js",
      },
      {
        name: "Bay Template Editor (ComPAS)",
        translations: {
          de: "Bay Template Editor (ComPAS)",
        },
        icon: "edit",
        requireDoc: true,
        src: "./plugins/scl-bay-template/scl-bay-template.js",
      },
      {
        name: "Cleanup",
        src: "./plugins/openscd.github.io/plugins/dist/editors/Cleanup.js",
        icon: "cleaning_services",
        activeByDefault: false,
        kind: "editor",
        requireDoc: true,
      },

      {
        name: "Communication",
        translations: {
          de: "Communication",
        },
        icon: "settings_ethernet",
        requireDoc: true,
        src: "https://omicronenergyoss.github.io/oscd-editor-communication/oscd-editor-communication.js",
      },
      {
        name: "IED Editor",
        translations: {
          de: "IED Editor",
        },
        icon: "developer_board",
        requireDoc: true,
        tagName: "oscd-editor-ied",
      },

      {
        name: "LNode Mapping",
        translations: {
          de: "LNode Mapping",
        },
        icon: "copy_all",
        requireDoc: true,
        src: "./plugins/process-icd-creator/process-icd-creator.js",
      },

      {
        name: "Publisher",
        translations: {
          de: "Publisher",
        },
        src: "./plugins/oscd-publisher/oscd-publisher.js",
        icon: "publish",
        requireDoc: true,
      },
      {
        name: "Address Multicast (TP)",
        translations: {
          de: "Address Multicast (TP)",
        },
        icon: "auto_fix_normal",
        requireDoc: true,
        src: "https://danyill.github.io/oscd-tp-multicast-naming/oscd-tp-multicast-naming.js",
      },
      {
        name: "Subscriber Message Binding (GOOSE)",
        translations: {
          de: "Subscriber Message Binding (GOOSE)",
        },
        icon: "link",
        requireDoc: true,
        src: "./plugins/openscd.github.io/plugins/dist/editors/GooseSubscriberMessageBinding.js",
      },
      {
        name: "Subscriber Data Binding (GOOSE)",
        translations: {
          de: "Subscriber Data Binding (GOOSE)",
        },
        icon: "link",
        requireDoc: true,
        src: "./plugins/openscd.github.io/plugins/dist/editors/GooseSubscriberDataBinding.js",
      },
      {
        name: "Subscriber Message Binding (SMV)",
        translations: {
          de: "Subscriber Message Binding (SMV)",
        },
        icon: "link",
        requireDoc: true,
        src: "./plugins/openscd.github.io/plugins/dist/editors/SMVSubscriberMessageBinding.js",
      },
      {
        name: "Subscriber Data Binding (SMV)",
        translations: {
          de: "Subscriber Data Binding (SMV)",
        },
        icon: "link",
        requireDoc: true,
        src: "./plugins/openscd.github.io/plugins/dist/editors/SMVSubscriberDataBinding.js",
      },
      {
        name: "Subscriber Later Binding (SMV/GOOSE)",
        translations: {
          de: "Subscriber Later Binding (SMV/GOOSE)",
        },
        icon: "link",
        requireDoc: true,
        src: "plugins/oscd-subscriber-later-binding/oscd-subscriber-later-binding.js",
      },
      {
        name: "Communication Mapping",
        translations: {
          de: "Communication Mapping",
        },
        icon: "link",
        requireDoc: true,
        src: "https://openenergytools.github.io/scl-communication-editor/scl-communication-editor.js",
      },
      {
        name: "Explore Communication",
        translations: {
          de: "Explore Communication",
        },
        icon: "lan",
        requireDoc: true,
        src: "https://sprinteins.github.io/oscd-plugins/communication-explorer/index.js",
      },
      {
        name: "104",
        translations: {
          de: "104",
        },
        src: "https://openscd.github.io/plugins/src/editors/Protocol104.js",
        icon: "settings_ethernet",
        requireDoc: true,
      },
      {
        name: "Compare",
        translations: { de: "Vergleichen" },
        icon: "difference",
        requireDoc: true,
        tagName: "oscd-editor-diff",
      },
      {
        name: "Source Editor",
        translations: { de: "Source Editor" },
        icon: "code",
        requireDoc: true,
        tagName: "oscd-editor-source",
      },
    ],
    background: [
      {
        name: "EditV1 Events Listener",
        icon: "none",
        requireDoc: true,
        tagName: "oscd-background-editv1",
      },
      {
        name: "Wizard Events Listener",
        icon: "none",
        requireDoc: true,
        tagName: "oscd-background-wizard-events",
      },
    ],
  };
};
