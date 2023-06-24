import React, {useRef,useState} from 'react';
import {Layout} from 'antd';
import ChatBox from '../ChatBox';
import LeftSidebar from '../LeftSidebar';

import './index.css'

const { Content, Sider} = Layout;

const MainLayout = () => {
    return (
        <div className="background"
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
                background: '#f9f9f9',
                position: 'relative',
            }}>
                <div
                    style={{
                        width: '80%',
                        height: '90%',
                        background: '#fff',
                        border: '1px solid #ccc',
                        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                    }}>
                    <Layout className="center-box" style={{ width: '100%', height: '100%', display: 'flex'}}>
                        <Sider className='Sider' width={360}>
                            <LeftSidebar/>
                        </Sider>
                        <Layout>
                            <Content>
                                <ChatBox />
                            </Content>
                        </Layout>
                    </Layout>
            </div>
        </div>
    );
  };

export default MainLayout;