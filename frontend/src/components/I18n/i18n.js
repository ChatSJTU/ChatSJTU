import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import i18n from "i18next";                     // i18n 的主要模块

import LoginLayout_zh from '../../locales/zh-cn/LoginLayout.json';
import Tabs_about_zh from '../../locales/zh-cn/Tabs_about.json';
import Tabs_disclaimer_zh from '../../locales/zh-cn/Tabs_disclaimer.json';
import Tabs_wallet_zh from '../../locales/zh-cn/Tabs_wallet.json';

import LoginLayout_en from '../../locales/en-us/LoginLayout.json';
import Tabs_about_en from '../../locales/en-us/Tabs_about.json';
import Tabs_disclaimer_en from '../../locales/en-us/Tabs_disclaimer.json';
import Tabs_wallet_en from '../../locales/en-us/Tabs_wallet.json';

import { initReactI18next } from 'react-i18next'; 


const i18nResources = {
    en: {
        LoginLayout: LoginLayout_en,
        Tabs_about: Tabs_about_en,
        Tabs_disclaimer: Tabs_disclaimer_en,
        Tabs_wallet: Tabs_wallet_en,
        
    },
    zh: {
        LoginLayout: LoginLayout_zh,
        Tabs_about: Tabs_about_zh,
        Tabs_disclaimer: Tabs_disclaimer_zh,
        Tabs_wallet: Tabs_wallet_zh,
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
