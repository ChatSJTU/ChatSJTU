import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {Layout} from 'antd';

import ChatBox from '../ChatBox';
import LeftSidebar from '../LeftSidebar';
import TabAbout from '../Tabs/about';
import TabDisclaimers from '../Tabs/disclaimers';
import TabHelp from '../Tabs/help';
import TabSettings from '../Tabs/settings';
import TabWallet from '../Tabs/wallet';

import './index.css'

const { Content, Sider, Footer } = Layout;

const MainLayout = ({handleLogout, changeLanguage}) => {

    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    // const [prevSelectedSession, setPrevSelectedSession] = useState(null);
    const [curRightComponent, setCurRightComponent] = useState(0);  //切换右侧部件

    const { t } = useTranslation('MainLayout');

    //选中会话（在LeftSider中）
    const handleSelectSession = (session) => {
        setCurRightComponent(1);    //切换为聊天框
        setSelectedSession(session);
    };    

    //修改会话信息
    const handleChangeSessionInfo = (targetId, newData) => {
        console.log(newData)
        const updatedSessions = sessions.map(session =>
            session.id === targetId ? { ...session, ...newData} : session
        );
        setSessions(updatedSessions);
        if (targetId === selectedSession.id) {
            setSelectedSession((prevSession) => ({
                ...prevSession,
                ...newData,
                }));
        }
    };
    
    //右侧可显示的组件列表
    const componentList = [
        <div/>,
        <ChatBox selectedSession={selectedSession} onChangeSessionInfo={handleChangeSessionInfo}/>,
        <TabAbout onCloseTab={() => handleChangeComponent(1)}/>,
        <TabDisclaimers onCloseTab={() => handleChangeComponent(1)}/>,
        <TabHelp onCloseTab={() => handleChangeComponent(1)}/>,
        <TabSettings onCloseTab={() => handleChangeComponent(1)} changeLanguage={changeLanguage}/>,
        <TabWallet onCloseTab={() => handleChangeComponent(1)}/>
    ];

    const handleChangeComponent = (index) => {
        // if (index !== 1){
        //     if (!prevSelectedSession) {setPrevSelectedSession(selectedSession);}
        //     setSelectedSession(null);
        //     setCurRightComponent(index);
        // }
        // else if (index === 1 && !selectedSession){
        //     setSelectedSession(prevSelectedSession);
        //     setPrevSelectedSession(null);
        //     setCurRightComponent(index);
        // }
        // if (index === 1 && !prevSelectedSession){
        //     setCurRightComponent(0);
        // }
        setCurRightComponent(index);
    };

    return (
        <Layout className="background fade-in"
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
                        height: '88%',
                        background: '#fff',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid #ccc',
                        boxShadow: '30px 30px 60px 10px rgba(0, 0, 0, 0.1)',
                        marginTop: '-14px',
                        // WebkitMaskImage: '-webkit-radial-gradient(white, black)',
                    }}>
                    <Layout className="center-box" style={{ width: '100%', height: '100%', display: 'flex'}}>
                        <Sider className='Sider' width={300}>
                            <LeftSidebar 
                                sessions={sessions}
                                setSessions={setSessions}
                                selectedSession={selectedSession} 
                                onSelectSession={handleSelectSession}
                                onLogoutClick={handleLogout}
                                onChangeComponent={handleChangeComponent}
                                onChangeSessionInfo={handleChangeSessionInfo}
                                />
                        </Sider>
                        <Layout>
                            <Layout>
                                <Content style={{ minHeight: '0', flex: '1' }}>
                                {selectedSession  && 
                                    <div style={{ height: '100%',display: curRightComponent === 1 ? '' : 'none'}}>
                                        <ChatBox selectedSession={selectedSession} onChangeSessionInfo={handleChangeSessionInfo} curRightComponent={curRightComponent}/>
                                    </div>}
                                {curRightComponent !== 1 && componentList[curRightComponent]}
                                </Content>
                            </Layout>   
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
                <p style={{fontSize: '12px', color: '#aaaaaa', letterSpacing: '0.3px'}}>{t('MainLayout_Footer_Copyright')}<br/>{t('MainLayout_Footer_TechSupport')} <a href="mailto:gpt@sjtu.edu.cn" title="gpt@sjtu.edu.cn">{t('MainLayout_Footer_ContactLinkText')}</a></p>
            </div>
        </Layout>
    );
  };

export default MainLayout;