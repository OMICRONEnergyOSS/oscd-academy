import {en} from "./en.js";
import {de} from "./de.js";
const languages = {en, de};
export function get(key, params) {
  const language = navigator.language.split("-")[0] || "en";
  const lang = language in languages ? language : "en";
  const translations = languages[lang];
  const path = key.split(".");
  let result = translations;
  for (const segment of path) {
    if (!result)
      return key;
    result = result[segment];
  }
  if (typeof result !== "string")
    return key;
  if (params) {
    return Object.entries(params).reduce((str, [paramKey, value]) => str.replace(new RegExp(`{{\\s*${paramKey}\\s*}}`, "g"), value), result);
  }
  return result;
}
export function getLocale() {
  return navigator.language.split("-")[0] || "en";
}
export function registerTranslateConfig(_config) {
}
export function use(language) {
}
