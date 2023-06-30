import React, { useState, useEffect } from 'react';
import { Button } from 'antd';

import MainLayout from './components/MainLayout'
import { request } from "./services/request";
import { jAccountAuth, jAccountLogin} from "./services/user";

import './App.css';

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
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5', height: '100vh'}}>
                {/* <Button type="primary" onClick={handleLogin_DeviceId} size="large">使用 device_id 登录</Button> */}
                <Button type="primary" onClick={() => jAccountLogin('/')} size="large">使用 jAccount 登录</Button>
                <div
                    style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    textAlign: 'center',
                }}>
                <p style={{fontSize: '12px', color: '#aaaaaa'}}>© 2023 上海交通大学 沪交ICP备20230139</p>
            </div>
            </div>
            
        );
    }
};

export default App;
