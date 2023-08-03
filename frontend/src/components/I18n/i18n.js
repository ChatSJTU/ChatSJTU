import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import i18n from "i18next";                     // i18n 的主要模块
import LoginLayout_zh from '../../locales/zh-cn/LoginLayout.json';
import LoginLayout_en from '../../locales/en-us/LoginLayout.json';
import { initReactI18next } from 'react-i18next'; 


const i18nResources = {
    en: {
        LoginLayout: LoginLayout_en
    },
    zh: {
        LoginLayout: LoginLayout_zh
    }
}

i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next) //init i18next
    .init({
        resources: i18nResources,
        fallbackLng: 'zh',
        debug: false,
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
    });
    

export default i18n;
