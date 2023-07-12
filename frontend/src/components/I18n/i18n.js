import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import i18n from "i18next";                     // i18n 的主要模块
import zh from '../../locales/zh-cn.json';
import en from '../../locales/en-us.json';
import { initReactI18next } from 'react-i18next'; 


const resources = {
    en: {
        translation: en
    },
    zh: {
        translation: zh
    }
}

i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next) //init i18next
    .init({
        resources,
        fallbackLng: 'zh',
        debug: false,
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
    });

export default i18n;
