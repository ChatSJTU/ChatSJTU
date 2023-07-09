import React, { useState, useEffect } from 'react';
import { Button, message, Typography } from 'antd';

import MainLayout from './components/MainLayout'
import LoginLayout from './components/LoginLayout';
import { request } from "./services/request";
import { jAccountAuth, jAccountLogin} from "./services/user";

import './App.css';

const { Title } = Typography;

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

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
            <div style={{ background: '#f0f2f5', height: '100%' }}>
                <MainLayout handleLogout={handleLogout} />
            </div>
        );
    } else {
        return (
            <div style={{ background: '#f0f2f5', height: '100%' }}>
                <LoginLayout handleLogin={() => jAccountLogin('/')}/>
            </div>
        );
    }
};

export default App;
