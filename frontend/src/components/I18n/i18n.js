import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import i18n from "i18next";                     // i18n 的主要模块

import LoginLayout_zh from '../../locales/zh-cn/LoginLayout.json';
import LeftSidebar_zh  from '../../locales/zh-cn/LeftSidebar.json';
import exportModal_zh from '../../locales/zh-cn/exportModal.json';
import Tabs_about_zh from '../../locales/zh-cn/Tabs_about.json';
import Tabs_disclaimer_zh from '../../locales/zh-cn/Tabs_disclaimer.json';
import Tabs_wallet_zh from '../../locales/zh-cn/Tabs_wallet.json';
import Tabs_help_zh from '../../locales/zh-cn/Tabs_help.json';
import Tabs_settings_zh from '../../locales/zh-cn/Tabs_settings.json';
import Tabs_plugins_zh from '../../locales/zh-cn/Tabs_plugins.json';
import ChatBox_zh from '../../locales/zh-cn/ChatBox.json';
import MainLayout_zh from '../../locales/zh-cn/MainLayout.json';
import MarkdownRenderer_zh from '../../locales/zh-cn/MarkdownRenderer.json';

import LoginLayout_en from '../../locales/en-us/LoginLayout.json';
import LeftSidebar_en  from '../../locales/en-us/LeftSidebar.json';
import exportModal_en from '../../locales/en-us/exportModal.json';
import Tabs_about_en from '../../locales/en-us/Tabs_about.json';
import Tabs_disclaimer_en from '../../locales/en-us/Tabs_disclaimer.json';
import Tabs_wallet_en from '../../locales/en-us/Tabs_wallet.json';
import Tabs_help_en from '../../locales/en-us/Tabs_help.json';
import Tabs_settings_en from '../../locales/en-us/Tabs_settings.json';
import Tabs_plugins_en from '../../locales/en-us/Tabs_plugins.json';
import ChatBox_en from '../../locales/en-us/ChatBox.json';
import MainLayout_en from '../../locales/en-us/MainLayout.json';
import MarkdownRenderer_en from '../../locales/en-us/MarkdownRenderer.json';



import { initReactI18next } from 'react-i18next'; 


const i18nResources = {
    en: {
        LoginLayout: LoginLayout_en,
        LeftSidebar: LeftSidebar_en,
        exportModal: exportModal_en,
        Tabs_about: Tabs_about_en,
        Tabs_disclaimer: Tabs_disclaimer_en,
        Tabs_wallet: Tabs_wallet_en,
        Tabs_help: Tabs_help_en,
        Tabs_settings: Tabs_settings_en,
        Tabs_plugins: Tabs_plugins_en,
        ChatBox: ChatBox_en,
        MainLayout: MainLayout_en,
        MarkdownRenderer: MarkdownRenderer_en
    },
    zh: {
        LoginLayout: LoginLayout_zh,
        LeftSidebar: LeftSidebar_zh,
        exportModal: exportModal_zh,
        Tabs_about: Tabs_about_zh,
        Tabs_disclaimer: Tabs_disclaimer_zh,
        Tabs_wallet: Tabs_wallet_zh,
        Tabs_help: Tabs_help_zh,
        Tabs_settings: Tabs_settings_zh,
        Tabs_plugins: Tabs_plugins_zh,
        ChatBox: ChatBox_zh,
        MainLayout: MainLayout_zh,
        MarkdownRenderer: MarkdownRenderer_zh
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
