import React, {useRef,useState} from 'react';
import {Layout} from 'antd';
import ChatBox from './components/ChatBox';

import './App.css';

const {Header, Content, Sider, Footer} = Layout;

const App = () => {
    return (
        <Layout
        style={{
            height: '100vh',
            display: 'flex',
            flexFlow: 'column'
        }}>
        <Header className='Header' style={{paddingLeft: '20px'}}>
            <div>
                {/* <img className='logo' src="https://www.si.sjtu.edu.cn/media/backend/cover/843a76193ea8021f3661b5366a082778.png" alt="logo" ></img> */}
                <span className='title'>Chat-SJTU</span>
            </div>
        </Header>
        <Layout style={{flex: 1}}>
            <Sider className='Sider' width={260}>
            </Sider>
            <Layout>
                <Content>
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <ChatBox />
                    </div>
                </Content>
            </Layout>
        </Layout>
        <Footer className='Footer' style={{height:25,padding: '0px 0px 0px 10px'}}>
            Powered on ChatGPT
        </Footer>
    </Layout>
    )
}
export default App;