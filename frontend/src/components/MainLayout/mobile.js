import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout, Button, message } from 'antd';
import { MenuOutlined } from '@ant-design/icons';

import ChatBox from '../ChatBox';
import LeftSidebar from '../LeftSidebar';
import TabAbout from '../Tabs/about';
import TabDisclaimers from '../Tabs/disclaimers';
import TabHelp from '../Tabs/help';
import TabPlugins from '../Tabs/plugins';
import TabSettings from '../Tabs/settings';
import TabWallet from '../Tabs/wallet';
import { SessionContext } from '../../contexts/SessionContext';
import { UserContext } from '../../contexts/UserContext';
import { fetchUserProfile, getSettings } from '../../services/user';
import { fetchPluginList } from '../../services/plugins';

import './index.css'

const { Content, Sider, Footer, Header } = Layout;

const MainLayoutMobile = ({handleLogout, changeLanguage}) => {

    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [userProfile, setUserProfile] = useState(null); 
    const [settings, setSettings] = useState(null);
    const [qcmdsList, setQcmdsList] = useState(null);

    // const [prevSelectedSession, setPrevSelectedSession] = useState(null);
    const [curRightComponent, setCurRightComponent] = useState(0);  //切换右侧部件
    const [isSiderCollapsed, setIsSiderCollapsed] = useState(true);

    const { t } = useTranslation('MainLayout');

    useEffect(() => {
        fetchUserInfo();
        fetchSettings();
        fetchPluginAndQcmds();
    }, []);

    // 获取登录用户信息
    const fetchUserInfo = async () => {
        try {
            const userData = await fetchUserProfile();
            setUserProfile(userData);
        } catch (error) {
            if (error.response.status === 404){
                message.error(t('MainLayout_FetchUserError'),2);
            }
        }
    };

    //获取用户设置项
    const fetchSettings = async () => {
        try {
            const data = await getSettings();
            setSettings(data);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            message.error(t('MainLayout_FetchSettingsError'), 2);
        }
    };

    //获取插件列表、快捷指令列表
    const fetchPluginAndQcmds = async () => {
        try {
            const data = await fetchPluginList();
            setQcmdsList(data);
        } catch (error) {
            console.error('Failed to fetch plugins:', error);
            message.error('获取插件列表错误', 2);
        }
    }

    const toggleSider = () => {
        setIsSiderCollapsed(prevState => !prevState);
    };

    //修改选中会话
    const handleSelectSession = (session) => {
        setSelectedSession(session);
        setCurRightComponent(1);    //切换为聊天框
        setIsSiderCollapsed(true);  //sider折叠
    };    

    //修改会话信息
    const handleChangeSessionInfo = (targetId, newData) => {
        setSessions((prevSessions) => {
            const updatedSessions = prevSessions.map(session =>
                session.id === targetId ? { ...session, ...newData} : session
            );
            return updatedSessions;
        });
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
        <div/>, 
        <TabAbout onCloseTab={() => handleChangeComponent(1)}/>,
        <TabDisclaimers onCloseTab={() => handleChangeComponent(1)}/>,
        <TabHelp onCloseTab={() => handleChangeComponent(1)}/>,
        <TabPlugins onCloseTab={() => handleChangeComponent(1)}/>,
        <TabSettings onCloseTab={() => handleChangeComponent(1)} changeLanguage={changeLanguage}/>,
        <TabWallet onCloseTab={() => handleChangeComponent(1)}/>,
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
        setIsSiderCollapsed(true);
    };

    return (
        <SessionContext.Provider 
            value={{
                sessions,
                setSessions,
                selectedSession,
                setSelectedSession,
            }}>
            <UserContext.Provider
                value={{
                    userProfile,
                    settings,
                    setSettings,
                    fetchSettings,
                    qcmdsList,
                }}>
                <Layout className="background fade-in" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
                    <Header style={{
                        backgroundColor: '#FFF',
                        width: '100%',
                        zIndex: 2,
                        borderBottom: '1px solid #bbbbbb',
                    }}>
                        <Button onClick={toggleSider}>
                            <MenuOutlined />
                        </Button>
                    </Header>
                    <Layout className="center-box" style={{ flex: 1, overflow: 'hidden', position: 'relative'}}>
                        <Sider className='Sider' collapsed={isSiderCollapsed} onCollapse={toggleSider} width="100%" collapsedWidth="0" style={{
                            height: '100%', position: 'absolute', zIndex: isSiderCollapsed ? 1 : 2 }}>
                            <LeftSidebar 
                                onSelectSession={handleSelectSession}
                                onLogoutClick={handleLogout}
                                onChangeComponent={handleChangeComponent}
                                onChangeSessionInfo={handleChangeSessionInfo} 
                                />
                        </Sider>
                        <Content style={{ height: '100%', overflowY: 'auto', position: 'absolute', marginLeft: isSiderCollapsed ? '0' : '100%', width: '100%', transition: 'all 0.2s' }}>
                            {selectedSession  && 
                                <div style={{ height: '100%',display: curRightComponent === 1 ? '' : 'none'}}>
                                    <ChatBox 
                                        onChangeSessionInfo={handleChangeSessionInfo} 
                                        onChangeComponent={handleChangeComponent}
                                        curRightComponent={curRightComponent}/>
                                </div>}
                            {curRightComponent !== 1 && componentList[curRightComponent]}
                        </Content>
                    </Layout>
                    <Footer style={{
                        textAlign: 'center', 
                        height: 'fit-content', 
                        padding:'0px',
                        borderTop: '1px solid #bbbbbb',
                        }}>
                            <p style={{fontSize: '12px', color: '#aaaaaa', letterSpacing: '0.3px'}}>{t('MainLayout_Footer_Copyright')}<br/>{t('MainLayout_Footer_TechSupport')} <a href="mailto:gpt@sjtu.edu.cn" title="gpt@sjtu.edu.cn">{t('MainLayout_Footer_ContactLinkText')}</a></p>
                    </Footer>
                </Layout>
            </UserContext.Provider>
        </SessionContext.Provider>
    );
};

export default MainLayoutMobile;