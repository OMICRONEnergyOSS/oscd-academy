# OpenSCD Academy Edition

OpenSCD Academy Edition is a browser-based and desktop distribution of the OpenSCD editor for IEC 61850 training, with a focus on Omicron trainers. It is an independent project, not an official OMICRON product, and is not officially supported by OMICRON.

Try the [browser app](https://omicronenergyoss.github.io/oscd-academy/) or download desktop installers from the [GitHub releases page](https://github.com/OMICRONEnergyOSS/oscd-academy/releases).

## Privacy

No account or login is required. This distribution does not include user tracking, usage monitoring, or session recording. SCL files you open are processed locally and are not uploaded by the app.

The browser app downloads its code and assets from GitHub Pages. GitHub and network providers may process ordinary connection data under their own policies.

## Adding a plugin

Plugin configuration lives in `plugins.js`. For an imported plugin, add its import and register its class with `oscdShell.registry` inside `loadPlugins`, then add an entry to the appropriate `menu`, `editor`, or `background` list in `oscdShell.plugins`. For a prebuilt plugin bundle, add an entry with a `src` path to that bundle under `plugins/`.

## Releases

The release workflow uses [Release Please](https://github.com/googleapis/release-please). Conventional Commits are used to prepare release pull requests; when one is merged, the workflow publishes the browser build to GitHub Pages and builds desktop installers on native Linux and Windows runners.

Desktop targets are Linux AppImage, `.deb`, and `.rpm` packages, plus Windows NSIS and `.msi` installers and a portable `.exe`. Both packaged apps must pass startup and local-file-opening smoke tests before any installers are uploaded to the [release assets](https://github.com/OMICRONEnergyOSS/oscd-academy/releases). Code signing is not provided.

Manually running the Release Please workflow also builds and tests the installers, even when no release is created. In that case, they are available as workflow artifacts rather than published to a release.

The **Electron Build Test** workflow runs the same build and smoke tests on every push and can also be run manually. It uses the checked-in version, uploads installers as workflow artifacts, and never publishes a release.

### Desktop icons

Desktop and installer icons use the artwork from `openscd-icon.svg`, with French Blue 55 (`#2485e5` from `themes.css`) filling the interior of the white rounded border. The square canvas outside the border remains transparent, and the browser SVG is unchanged. The generated PNG and multi-resolution ICO are checked in, so builds do not require image-conversion tools. To regenerate them with Inkscape and ImageMagick:

```sh
mkdir -p temp
# Place the blue fill behind the artwork, overlapping only the inside of the border.
sed '1a\    <rect x="1" y="1" width="28.1816" height="26" rx="1.72725" fill="#2485e5"/>' openscd-icon.svg > temp/electron-icon.svg
inkscape "$PWD/temp/electron-icon.svg" --export-type=png --export-background-opacity=0 --export-width=512 --export-filename="$PWD/temp/electron-icon.png"
convert temp/electron-icon.png -background none -gravity center -extent 512x512 build/icons/png/icon.png
cp build/icons/png/icon.png build/icons/linux/icon.png
convert build/icons/png/icon.png -define icon:auto-resize=256,128,64,48,32,24,16 build/icons/win/icon.ico
rm temp/electron-icon.svg temp/electron-icon.png
```
