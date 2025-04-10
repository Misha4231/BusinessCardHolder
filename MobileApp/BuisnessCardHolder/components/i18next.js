import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json"
import uk from "../locales/uk.json"
import pl from "../locales/pl.json"
import ru from "../locales/ru.json"
import cs from "../locales/cs.json"
import da from "../locales/da.json"
import de from "../locales/de.json"
import fr from "../locales/fr.json"

export const languageResources = {
    en: {translation: en, langTitle: "English"},
    uk: {translation: uk, langTitle: "Ukrainian"},
    pl: {translation: pl, langTitle: "Polish"},
    ru: {translation: ru, langTitle: "Russian"},
    cs: {translation: cs, langTitle: "Czech"},
    da: {translation: da, langTitle: "Dutch"},
    de: {translation: de, langTitle: "German"},
    fr: {translation: fr, langTitle: "French"},
}

export const defaultLanguage = 'en';

i18next.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    lng: defaultLanguage,
    fallback: defaultLanguage,
    resources: languageResources
})

export default i18next;