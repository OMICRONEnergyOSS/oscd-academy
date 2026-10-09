/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

// Electron Builder afterPack hook configuration
// Required because package.json is especially difficult to handle:
// https://github.com/electron-userland/electron-builder/issues/4160
const afterPack = async (context) => {
  const { appOutDir, packager } = context;

  const sourcePackageJsonPath = path.join(
    packager.projectDir,
    "package.json",
  );

  const resourcesPath = path.join(appOutDir, "resources");
  fs.mkdirSync(resourcesPath, { recursive: true });

  const destPackageJsonPath = path.join(resourcesPath, "package.json");
  fs.copyFileSync(sourcePackageJsonPath, destPackageJsonPath);
};

module.exports = {
  afterPack,
};
