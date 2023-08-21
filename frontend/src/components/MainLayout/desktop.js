import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout, message } from 'antd';

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

const { Content, Sider } = Layout;

const MainLayout = ({handleLogout, changeLanguage}) => {

    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [userProfile, setUserProfile] = useState(null); 
    const [settings, setSettings] = useState(null);
    const [qcmdsList, setQcmdsList] = useState(null);
    const [pluginList, setPluginList] = useState(null);
    const [selectedPlugins, setSelectedPlugins] = useState([]);

    // const [prevSelectedSession, setPrevSelectedSession] = useState(null);
    const [curRightComponent, setCurRightComponent] = useState(0);  //切换右侧部件

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
            setQcmdsList(data.qcmd);
            setPluginList(data.fc);
        } catch (error) {
            console.error('Failed to fetch plugins:', error);
            message.error('获取插件列表错误', 2);
        }
    }

    //选中会话（在LeftSider中）
    const handleSelectSession = (session) => {
        setCurRightComponent(1);    //切换为聊天框
        setSelectedSession(session);
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

    //选择或取消选择插件
    const handleSelectPlugin = (pluginId) => {
        if (selectedPlugins.includes(pluginId)) {
            setSelectedPlugins(selectedPlugins.filter(id => id !== pluginId));
        } else {
            setSelectedPlugins([...selectedPlugins, pluginId]);
        }
    };
    
    //右侧可显示的组件列表
    const componentList = [
        <div/>,
        <div/>, //<ChatBox onChangeSessionInfo={handleChangeSessionInfo} curRightComponent={curRightComponent}/>,
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
                    pluginList,
                    selectedPlugins,
                    handleSelectPlugin,
                }}>
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
                                                <ChatBox 
                                                    onChangeSessionInfo={handleChangeSessionInfo} 
                                                    onChangeComponent={handleChangeComponent}
                                                    curRightComponent={curRightComponent}/>
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
            </UserContext.Provider>
        </SessionContext.Provider>
    );
  };

export default MainLayout;