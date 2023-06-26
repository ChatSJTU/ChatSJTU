// import React, {useRef,useState} from 'react';
// import MainLayout from './components/MainLayout'
// import './App.css';

// const App = () => {
//     return (
//         <div style={{ background: '#f0f2f5', height: '100%' }}>
//             <MainLayout />
//         </div>
//     )
// }
// export default App;

import React, { useState } from 'react';
import {Button} from 'antd';
import axios from 'axios';
import MainLayout from './components/MainLayout'
import { fetcher, request } from "./services/request";

import './App.css';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const getDeviceId = () => {
        const { userAgent } = navigator;
        const hashCode = (s) => {
            let h = 0;
            for (let i = 0; i < s.length; i++) {
                h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
            }
            return h;
        };
        return hashCode(userAgent).toString();
    };

    //device-id登入
    const handleLogin = async () => {
        const deviceId = getDeviceId();
        console.log(deviceId);
        try {
            const response = await request.post('/oauth/deviceid/login/', { device_id: deviceId });
            if (response.status === 200) {
                setIsLoggedIn(true);
            }
        } catch (error) {
            console.error('Failed to login:', error);
        }
    };

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
                <Button type="primary" onClick={handleLogin} size="large">使用 device_id 登录</Button>
            </div>
            
        );
    }
};

export default App;
