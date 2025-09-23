export const plugins = {
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
      src: "https://openenergytools.github.io/scl-validating/scl-validating.js",
    },
    {
      name: "Import IEDs",
      translations: { de: "Import IEDs" },
      requireDoc: true,
      icon: "snippet_folder",
      src: "https://openscd.github.io/plugins/src/menu/ImportIEDs.js",
    },
    {
      name: "Rename IEDs",
      translations: { de: "Rename IEDs" },
      icon: "edit",
      requireDoc: true,
      src: "https://danyill.github.io/oscd-rename-ieds/oscd-rename-ieds.js",
    },
    // Needs to be forked and published
    // https://github.com/danyill/oscd-remove-ieds
    // {
    //   name: "Remove IEDs",
    //   translations: { de: "Remove IEDs" },
    //   icon: "delete",
    //   requireDoc: true,
    //   src: "plugins/oscd-rename-ieds/oscd-rename-ieds.js",
    // },
    {
      name: "Merge Project",
      translations: { de: "Merge Project" },
      icon: "merge_type",
      requireDoc: true,
      src: "https://openscd.github.io/plugins/src/menu/Merge.js",
    },

    // Doesn't exist as a plugin :-(
    // {
    //   name: "Plug-ins",
    //   translations: { de: "Plug-ins" },
    //   icon: "",
    //   requireDoc: true,
    //   src: "??",
    // },
    {
      name: "Plugin Store (Beta)",
      translations: { de: "Plugin Store (Beta)" },
      requireDoc: false,
      icon: "shopping_bag",
      src: "https://sprinteins.github.io/oscd-plugin-store/index.js",
    },
    // Doesn't exist as a plugin
    // {
    //   name: "Pro Mode",
    //   translations: { de: "Pro Mode" },
    //   icon: "??",
    //   requireDoc: true,
    //   src: "??",
    // },
  ],
  editor: [
    {
      name: "SLD Designer",
      translations: {
        de: "SLD Designer",
      },
      icon: "add_box",
      requireDoc: true,
      src: "https://omicronenergyoss.github.io/oscd-editor-sld/oscd-editor-sld.js",
    },
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
      src: "https://omicronenergyoss.github.io/oscd-editor-template-generator/oscd-editor-template-generator.js",
    },
    {
      name: "Template Update",
      translations: {
        de: "Template Update",
      },
      icon: "copy_all",
      requireDoc: true,
      src: "https://omicronenergyoss.github.io/oscd-editor-template-update/oscd-editor-template-update.js",
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
      name: "Bay Template Editor??",
      translations: {
        de: "Bay Template Editor",
      },
      icon: "edit",
      requireDoc: true,
      src: "https://openenergytools.github.io/scl-bay-template/scl-bay-template.js",
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
      name: "Communication",
      translations: {
        de: "Communication",
      },
      icon: "settings_ethernet",
      requireDoc: true,
      src: "https://omicronenergyoss.github.io/oscd-editor-communication/oscd-editor-communication.js",
    },

    {
      name: "Edit IED",
      translations: {
        de: "Edit IED",
      },
      icon: "developer_board",
      requireDoc: true,
      src: "https://meinberg-sync.github.io/mbg-ied-editor/mbg-ied-editor.js",
    },

    //I cannot find this plugin :-()
    // {
    //   name: "LNode Mapping",
    //   translations: {
    //     de: "LNOde Mapping",
    //   },
    //   icon: "",
    //   requireDoc: true,
    //   src: "",
    // },

    {
      name: "Publisher",
      translations: {
        de: "Publisher",
      },
      src: "https://openscd.github.io/external-plugins/oscd-publisher/oscd-publisher.js",
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
      src: "https://openscd.github.io/plugins/src/editors/GooseSubscriberMessageBinding.js",
    },
    {
      name: "Subscriber Data Binding (GOOSE)",
      translations: {
        de: "Subscriber Data Binding (GOOSE)",
      },
      icon: "link",
      requireDoc: true,
      src: "https://openscd.github.io/plugins/src/editors/GooseSubscriberDataBinding.js",
    },
    {
      name: "Subscriber Message Binding (SMV)",
      translations: {
        de: "Subscriber Message Binding (SMV)",
      },
      icon: "link",
      requireDoc: true,
      src: "https://openscd.github.io/plugins/src/editors/SMVSubscriberMessageBinding.js",
    },
    {
      name: "Subscriber Later Binding (SMV/GOOSE)",
      translations: {
        de: "Subscriber Later Binding (SMV/GOOSE)",
      },
      icon: "link",
      requireDoc: true,
      src: "https://openscd.github.io/external-plugins/oscd-subscriber-later-binding/oscd-subscriber-later-binding.js",
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
  ],
  background: [
    {
      name: "EditV1 Events Listener",
      icon: "none",
      requireDoc: true,
      tagName: "oscd-background-editv1",
    },
    // {
    //   name: "Wizard Events Listener",
    //   icon: "none",
    //   requireDoc: true,
    //   tagName: "oscd-background-wizard-events",
    // },
  ],
};
