import React, { useState } from 'react';
import {Layout} from 'antd';

import ChatBox from '../ChatBox';
import LeftSidebar from '../LeftSidebar';
import TabAbout from '../Tabs/about';
import TabDisclaimers from '../Tabs/disclaimers';
import TabHelp from '../Tabs/help';
import TabSettings from '../Tabs/settings';
import TabWallet from '../Tabs/wallet';

import './index.css'

const { Content, Sider } = Layout;

const MainLayout = ({handleLogout}) => {
    const [selectedSession, setSelectedSession] = useState(null);
    const [prevSelectedSession, setPrevSelectedSession] = useState(null);
    const [curRightComponent, setCurRightComponent] = useState(0);  //切换右侧部件

    //选中会话（在LeftSider中）
    const handleSelectSession = (session) => {
        setSelectedSession(session);
        setCurRightComponent(1);    //切换为聊天框
    };    

    //会话改名
    const handleChangeSessionName = (newName) => {
        setSelectedSession((prevSession) => ({
          ...prevSession,
          name: newName,
        }));
    };
    
    //右侧可显示的组件列表
    const componentList = [
        <div/>,
        <ChatBox selectedSession={selectedSession} onChangeSessionName={handleChangeSessionName}/>,
        <TabAbout onCloseTab={() => handleChangeComponent(1)}/>,
        <TabDisclaimers onCloseTab={() => handleChangeComponent(1)}/>,
        <TabHelp onCloseTab={() => handleChangeComponent(1)}/>,
        <TabSettings onCloseTab={() => handleChangeComponent(1)}/>,
        <TabWallet onCloseTab={() => handleChangeComponent(1)}/>
    ];

    const handleChangeComponent = (index) => {
        if (index !== 1){
            setPrevSelectedSession(selectedSession);
            setSelectedSession(null);
            setCurRightComponent(index);
        }
        else if (index === 1 && !selectedSession){
            setSelectedSession(prevSelectedSession);
            setCurRightComponent(index);
        }
        if (index === 1 && !prevSelectedSession){
            setCurRightComponent(0);
        }
    };

    return (
        <div className="background"
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
                background: '#fafafa',
                position: 'relative',
            }}>
                <div
                    style={{
                        width: '80%',
                        height: '90%',
                        background: '#fff',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid #ccc',
                        boxShadow: '30px 30px 60px 10px rgba(0, 0, 0, 0.08)',
                    }}>
                    <Layout className="center-box" style={{ width: '100%', height: '100%', display: 'flex'}}>
                        <Sider className='Sider' width={300}>
                            <LeftSidebar 
                                selectedSession={selectedSession} 
                                onSelectSession={handleSelectSession}
                                onLogoutClick={handleLogout}
                                onChangeComponent={handleChangeComponent}
                                />
                        </Sider>
                        <Layout>
                            <Content>
                                {/* {selectedSession && 
                                <ChatBox selectedSession={selectedSession} style={{ visibility: curRightComponent === 0 ? 'visible' : 'hidden' }}/>}  */}
                                {componentList[curRightComponent]}
                                {/* {curRightComponent !== 0 && componentList[curRightComponent]} */}
                            </Content>
                        </Layout>
                    </Layout>
            </div>
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
  };

export default MainLayout;