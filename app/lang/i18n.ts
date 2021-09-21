import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// the translations
// (tip move them in a JSON file and import them)
import {langs} from "./data";
import dayjs from "dayjs";
import { store } from "../hooks/useSetting";

let language = store.getString("@cz3/lang") ?? "en-GB"
if (language === "en-US") {
  language = "en";
  store.set("@cz3/lang", "en");
}
dayjs.locale(language === "test" ? "x-pseudo" : language.toLowerCase())

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: langs,
    lng: language,
    fallbackLng: "en-GB",
    defaultNS: "main",
    nsSeparator: "__",

    // keySeparator: false, // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

i18n.on("languageChanged", (lang) => {
  store.set("@cz3/lang", lang);
  dayjs.locale(lang === "test" ? "x-pseudo" : lang.toLowerCase());
})

export const LANGS = [
  ["cs", "Čeština"],
  ["da", "Dansk"],
  ["de", "Deutsch"],
  ["en-GB", "English (UK)"],
  ["en", "English (US)"],
  ["fi", "Suomi"],
  ["fr", "Français (CA)"],
  ["hu", "Magyar"],
  ["nl", "Nederlands"],
  ["test", "Emojis"],
];

export default i18n;
