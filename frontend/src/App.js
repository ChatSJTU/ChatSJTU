import React, { useState, useEffect } from 'react';
import { Button, message, Typography, ConfigProvider} from 'antd';
import { useTranslation, Trans, Translation } from 'react-i18next'
import { useMediaQuery } from 'react-responsive'

import MainLayout from './components/MainLayout/desktop'
import MainLayoutMobile from './components/MainLayout/mobile';
import LoginLayout from './components/LoginLayout';
import { request } from "./services/request";
import { jAccountAuth, jAccountLogin} from "./services/user";
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import i18n from './components/I18n/i18n';

import './App.css';

const { Title } = Typography;

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
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
        if (autologin === 'true') {
            jAccountLogin('/');
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
            handleJacTokenExchange(code, state);
        }
    });

    //jaccount登录之交换令牌
    const handleJacTokenExchange = async (code, state) => {
        try {
            const response = await jAccountAuth(code, state, "/", "");
            if (response.status === 200) {
                setIsLoggedIn(true);
            }
        } catch (error) {
            console.error('Failed to exchange token:', error);
            if (error.response && error.response.status === 403) {
                //message.error('登陆失败，该账户类型暂时无法访问', 2);
                message.error('开发中仅内测用户可登录', 2);
            } else {
                message.error('登陆失败', 2);
            }
        }
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
            <ConfigProvider locale={locale}>
                <div style={{ background: '#f0f2f5', height: '100%' }}>
                {isDesktop ? 
                <MainLayout handleLogout={handleLogout} changeLanguage={changeLanguage}/> 
                : <MainLayoutMobile handleLogout={handleLogout} changeLanguage={changeLanguage}/>}
            </div>
            </ConfigProvider>
        );
    } else {
        return (
            <ConfigProvider locale={locale}>
                <div style={{ background: '#f0f2f5', height: '100%' }}>
                    <LoginLayout 
                        handleLogin={() => jAccountLogin('/')}
                        changeLanguage={changeLanguage}
                    />
                </div>
            </ConfigProvider>
        );
    }
};

export default App;
