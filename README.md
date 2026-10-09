# OpenSCD Academy

OpenSCD Academy is a browser-based and desktop distribution of the OpenSCD editor for IEC 61850 training, with a focus on Omicron trainers. It is an independent project, not an official OMICRON product, and is not officially supported by OMICRON.

Try the [browser app](https://omicronenergyoss.github.io/oscd-academy/) or download desktop installers from the [GitHub releases page](https://github.com/OMICRONEnergyOSS/oscd-academy/releases).

## Privacy

No account or login is required. This distribution does not include user tracking, usage monitoring, or session recording. SCL files you open are processed locally and are not uploaded by the app.

The browser app downloads its code and assets from GitHub Pages. GitHub and network providers may process ordinary connection data under their own policies.

## Adding a plugin

Plugin configuration lives in `plugins.js`. For an imported plugin, add its import and register its class with `oscdShell.registry` inside `loadPlugins`, then add an entry to the appropriate `menu`, `editor`, or `background` list in `oscdShell.plugins`. For a prebuilt plugin bundle, add an entry with a `src` path to that bundle under `plugins/`.

## Releases

The release workflow uses [Release Please](https://github.com/googleapis/release-please). Conventional Commits are used to prepare release pull requests; when one is merged, the workflow publishes the browser build to GitHub Pages and attempts to build desktop installers.

Configured desktop targets are Linux AppImage, `.deb`, and `.rpm` packages, plus Windows NSIS, portable `.exe`, and `.msi` installers. The installer build is allowed to fail without stopping the workflow, so the available files may vary by release. Check the [release assets](https://github.com/OMICRONEnergyOSS/oscd-academy/releases) for what was actually published.
