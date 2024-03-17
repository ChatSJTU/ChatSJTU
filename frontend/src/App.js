import React, { useState, useEffect } from 'react';
import { Button, message, Typography, ConfigProvider, theme} from 'antd';
import { useTranslation, Trans, Translation } from 'react-i18next'
import { useMediaQuery } from 'react-responsive'

import MainLayout from './components/MainLayout/desktop'
import MainLayoutMobile from './components/MainLayout/mobile';
import LoginLayout from './components/LoginLayout';
import { request } from "./services/request";
import { accountLogin, accountRegister, jAccountAuth, jAccountLogin} from "./services/user";
import { ThemeContext } from './contexts/ThemeContext';
import { DisplayContext } from './contexts/DisplayContext';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import i18n from './components/I18n/i18n';

import './App.scss';
import styles from './assets/themes/_themify.scss';

const { Title } = Typography;

const App = () => {
    const loadedTheme = localStorage.getItem('themeContextValue');
    const loadedDisplayMode = localStorage.getItem('displayMode');

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userTheme, setUserTheme] = useState(loadedTheme);
    const [displayMode,setDisplayMode] = useState(loadedDisplayMode);
    const [locale, setLocal] = useState(zhCN);

    const changeLanguage = (e) => {
        if (e === 'zh-CN') {
            setLocal(zhCN);
            i18n.changeLanguage('zh');
        } else if (e === 'en-US') {
            setLocal(enUS);
            i18n.changeLanguage('en');
        }
    }

    const changeTheme = (themeName) => {        
        setUserTheme(themeName);
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem('themeContextValue', themeName); //保存到缓存
    }

    const changeDisplayMode = (displayModeName) => {
        console.log(displayModeName)
        setDisplayMode(displayModeName);
        localStorage.setItem('displayMode', displayModeName);
    }

    //移动端检测
    const isDesktop = useMediaQuery({ query: '(min-width: 768px)' })
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' })
    
    useEffect(() => {
        if (i18n.language === 'zh'){
            setLocal(zhCN)
        } else if (i18n.language === 'en'){
            setLocal(enUS)
        }
    })

    //无需点击jac登录按钮
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const autologin = urlParams.get('autologin');
        urlParams.delete("autologin");
        if (autologin === 'True') {
            jAccountLogin('/', "", urlParams.toString());
        }
    });

    //分析URL中code参数（jac登录）
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        if (code && state && !isLoggedIn) {
            // 发送 code 和 state 给后端进行令牌交换
            let url = new URL(window.location);
            url.searchParams.delete('code');
            url.searchParams.delete('state');
            window.history.replaceState(null, null, url.toString());
            const urlParams = new URLSearchParams(window.location.search);
            handleJacTokenExchange(code, state, urlParams.toString());
        }
    });

    //jaccount登录之交换令牌
    const handleJacTokenExchange = async (code, state, params = "") => {
        try {
            const response = await jAccountAuth(code, state, "/", "", params);
            if (response.status === 200) {
                setIsLoggedIn(true);
            }
        } catch (error) {
            console.error('Failed to exchange token:', error);
            if (error.response && error.response.status === 403) {
                message.error('开发中仅内测用户可登录', 2);
            } else {
                message.error('登陆失败', 2);
            }
        }
    };

    const onLoginFinish = (values) => {
        accountLogin(values.username, values.password)
        .then((resp) => {
            message.success('登录成功，跳转中……');
            setIsLoggedIn(true);
        })
        .catch((error) => {
            message.error('请求时发生错误：' + error?.response?.data?.message);
        })
        .finally(() => {
            
        });
    };

    const onRegisterFinish = (values) => {
        accountRegister(values.username, values.password)
        .then((resp) => {
            message.success('注册成功，跳转中……');
            setIsLoggedIn(true);
        })
        .catch((error) => {
            message.error('请求时发生错误：' + error?.response?.data?.message);
        })
        .finally(() => {
            
        });
    };


    // const getDeviceId = () => {
    //     const { userAgent } = navigator;
    //     const hashCode = (s) => {
    //         let h = 0;
    //         for (let i = 0; i < s.length; i++) {
    //             h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    //         }
    //         return h;
    //     };
    //     return hashCode(userAgent).toString();
    // };

    // //device-id登入
    // const handleLogin_DeviceId = async () => {
    //     const deviceId = getDeviceId();
    //     console.log(deviceId);
    //     try {
    //         const response = await request.post('/oauth/deviceid/login/', { device_id: deviceId });
    //         if (response.status === 200) {
    //             setIsLoggedIn(true);
    //         }
    //     } catch (error) {
    //         console.error('Failed to login:', error);
    //     }
    // };

    //登出
    const handleLogout = async () => {
        try {
            await request.post('/oauth/logout/'); 
            setIsLoggedIn(false);
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    };

    if (isLoggedIn) {
        return (
            <ThemeContext.Provider value={{ userTheme, changeTheme }}>
            <DisplayContext.Provider value={{ displayMode, changeDisplayMode }}>
            <ConfigProvider
                locale={locale}
                theme={{ 
                    token: !(styles[`${userTheme}-antd-color-primary`] && styles[`${userTheme}-antd-color-bg-container`]) ? null : {
                        colorPrimary: styles[`${userTheme}-antd-color-primary`],
                        colorBgContainer:  styles[`${userTheme}-antd-color-bg-container`]
                    },
                    algorithm: userTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
                }}
                >
                <div className="layout-container" style={{ height: '100%' }}>
                {isDesktop ? 
                <MainLayout handleLogout={handleLogout} changeLanguage={changeLanguage}/> 
                : <MainLayoutMobile handleLogout={handleLogout} changeLanguage={changeLanguage}/>}
                </div>
            </ConfigProvider>
            </DisplayContext.Provider>
            </ThemeContext.Provider>
        );
    } else {
        return (
            <ThemeContext.Provider value={{ userTheme, changeTheme }}>
            <ConfigProvider
                locale={locale}
                theme={{ 
                    token: !(styles[`${userTheme}-antd-color-primary`] && styles[`${userTheme}-antd-color-bg-container`]) ? null : {
                        colorPrimary: styles[`${userTheme}-antd-color-primary`],
                        colorBgContainer:  styles[`${userTheme}-antd-color-bg-container`]
                    },
                    algorithm: userTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
                }}
            >
                <div className="layout-container" style={{ height: '100%' }}>
                    <LoginLayout 
                        handleLogin={onLoginFinish}
                        handleRegister={onRegisterFinish}
                        changeLanguage={changeLanguage}
                    />
                </div>
            </ConfigProvider>
            </ThemeContext.Provider>
        );
    }
};

export default App;
