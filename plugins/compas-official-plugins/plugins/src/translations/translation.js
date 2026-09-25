import {languages} from "./loader.js";
export function get(key, params) {
  const language = navigator.language.split("-")[0] || "en";
  const translations = languages[language] || languages["en"];
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
    return Object.entries(params).reduce((str, [key2, value]) => str.replace(new RegExp(`{{\\s*${key2}\\s*}}`, "g"), value), result);
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
