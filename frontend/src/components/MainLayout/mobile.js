import React, { useState } from 'react';
import { Layout, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';

import ChatBox from '../ChatBox';
import LeftSidebar from '../LeftSidebar';
import TabAbout from '../Tabs/about';
import TabDisclaimers from '../Tabs/disclaimers';
import TabHelp from '../Tabs/help';
import TabSettings from '../Tabs/settings';
import TabWallet from '../Tabs/wallet';

import './index.css'

const { Content, Sider, Footer, Header } = Layout;

const MainLayoutMobile = ({handleLogout}) => {
    const [selectedSession, setSelectedSession] = useState(null);
    const [prevSelectedSession, setPrevSelectedSession] = useState(null);
    const [curRightComponent, setCurRightComponent] = useState(0);  //切换右侧部件
    const [isSiderCollapsed, setIsSiderCollapsed] = useState(false);

    const toggleSider = () => {
        setIsSiderCollapsed(prevState => !prevState);
    };

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
            if (!prevSelectedSession) {setPrevSelectedSession(selectedSession);}
            setSelectedSession(null);
            setCurRightComponent(index);
        }
        else if (index === 1 && !selectedSession){
            setSelectedSession(prevSelectedSession);
            setPrevSelectedSession(null);
            setCurRightComponent(index);
        }
        if (index === 1 && !prevSelectedSession){
            setCurRightComponent(0);
        }
        setIsSiderCollapsed(true);
    };

    return (
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
                        selectedSession={selectedSession} 
                        onSelectSession={handleSelectSession}
                        onLogoutClick={handleLogout}
                        onChangeComponent={handleChangeComponent}
                        />
                </Sider>
                <Content style={{ height: '100%', overflowY: 'auto', position: 'absolute', marginLeft: isSiderCollapsed ? '0' : '100%', width: '100%', transition: 'all 0.2s' }}>
                    {componentList[curRightComponent]}
                </Content>
            </Layout>
            <Footer style={{
                textAlign: 'center', 
                height: 'fit-content', 
                padding:'0px',
                borderTop: '1px solid #bbbbbb',
                }}>
                    <p style={{fontSize: '12px', color: '#aaaaaa', letterSpacing: '0.3px'}}>版权所有 © 2023 上海交通大学网络信息中心 沪交ICP备20230139<br/>技术支持：ChatSJTU 学生开发团队 <a href="mailto:gpt@sjtu.edu.cn" title="gpt@sjtu.edu.cn">联系我们</a></p>
            </Footer>
        </Layout>
    );
};

export default MainLayoutMobile;