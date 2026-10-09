import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { _electron as electron } from "playwright";

assert.ok(process.env.ELECTRON_APP_PATH, "ELECTRON_APP_PATH must point to the packaged executable");

const userData = await mkdtemp(path.join(tmpdir(), "oscd-academy-smoke-"));
const fixture = path.resolve("plugins/oscd-editor-publisher/demo/sample.scd");
const errors = [];
let application;

try {
  application = await electron.launch({
    executablePath: path.resolve(process.env.ELECTRON_APP_PATH),
    // Unpacked Linux apps do not have an installed setuid sandbox helper.
    args: [
      `--user-data-dir=${userData}`,
      ...(process.platform === "linux" ? ["--no-sandbox"] : []),
      fixture,
    ],
    timeout: 60000,
  });
  application.on("console", message => {
    if (message.type() === "error" || message.text().includes("[Invalid Plugin]")) {
      errors.push(message.text());
    }
  });
  assert.equal(await application.evaluate(({ app }) => app.isPackaged), true);

  const page = await application.firstWindow();
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error" || message.text().includes("[Invalid Plugin]")) {
      errors.push(message.text());
    }
  });
  page.on("requestfailed", request => {
    errors.push(`${request.url()}: ${request.failure()?.errorText}`);
  });

  await page.waitForFunction(() => {
    const shell = document.querySelector("oscd-shell");
    return window.electronAPI && shell?.shadowRoot &&
      shell.docName === "sample.scd" &&
      shell.doc?.documentElement.localName === "SCL" &&
      shell.plugins?.editor?.length > 0;
  }, null, { timeout: 60000 });
  assert.equal(await application.evaluate(({ BrowserWindow }) =>
    BrowserWindow.getAllWindows()[0].isVisible()), true);

  await application.evaluate(({ BrowserWindow }, filePath) => {
    BrowserWindow.getAllWindows()[0].webContents.send("file-opened", "reopened.scd", filePath);
  }, fixture);
  await page.waitForFunction(() => {
    const shell = document.querySelector("oscd-shell");
    return shell?.docName === "reopened.scd" && shell.doc?.documentElement.localName === "SCL";
  }, null, { timeout: 60000 });
  await page.waitForFunction(() => {
    const shell = document.querySelector("oscd-shell");
    const plugins = Object.values(shell._resolvedPlugins).flatMap(entries =>
      entries.flatMap(entry => entry.plugins ?? [entry]));
    return plugins.length > 0 && plugins.every(plugin => shell.registry.get(plugin.tagName));
  }, null, { timeout: 60000 });
  await page.evaluate(async () => {
    await document.querySelector("oscd-shell").updateComplete;
  });
  assert.deepEqual(errors, [], "Packaged app must start and open a local document without errors");
  console.log("Packaged Electron app started and opened a local SCL file successfully.");
} catch (error) {
  console.error("Packaged Electron smoke test failed. Captured errors:", errors);
  throw error;
} finally {
  if (application) {
    await application.close();
  }
  await rm(userData, { recursive: true, force: true });
}
