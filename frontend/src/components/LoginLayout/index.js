import React, {useState, useEffect} from 'react';
import {Layout, Menu, Typography, Divider, Col, Tag, Row, Button, Dropdown, message} from 'antd';
import {PlusCircleOutlined, RocketOutlined, UserOutlined, EllipsisOutlined, QuestionCircleOutlined, DeleteOutlined, LogoutOutlined, SettingOutlined, CodeOutlined, InfoCircleOutlined, WalletOutlined, AlertOutlined} from '@ant-design/icons';

import './index.css'

const { Content, Footer, Header } = Layout;
const { Title, Paragraph } = Typography;

//import { jAccountLogin} from "./services/user";

function LoginLayout ({ selectedSession, onSelectSession, onLogoutClick, onChangeComponent}) {
    
    // const [sessions, setSessions] = useState([]);
    // const [user, setUser] = useState(null);

    // useEffect(() => {
    //     fetchSessions();
    //     fetchUserName();
    // }, []);

    // useEffect(() => {
    //     if (sessions.length === 0) {
    //         handleCreateSession(); // 如果会话列表为空，自动创建新会话
    //     }
    // }, [sessions]);

    return (
        <Layout style={{ height: '100vh', background: '#FFF', position : 'relative'}}>
            <div style={{background: '#FFF', position : 'relative'}}>
                <div style={{ display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center', 
                            marginTop : '4vh',
                            zIndex : '2',
                            position: 'relative'}}>
                    <video style={{ clipPath: 'inset(2px 2px)',
                                objectFit: 'contain',
                                overflowClipMargin: 'content-box',
                                overflow: 'clip',
                                opacity: '50%'
                             }} 
                       data-v-9a6be86a="" autoPlay="autoPlay" muted="muted" loop="loop" poster="https://maxst.icons8.com/vue-static/landings/page-index/main-gradient.png" data-fullscreen-container="true">
                        <source data-v-9a6be86a="" src="https://maxst.icons8.com/vue-static/landings/page-index/new-main-gradient.webm" type="video/webm" />
                    </video>
                </div>
                <div style={{ display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center', 
                            marginTop : '14vh',
                            zIndex : '3',
                            position : 'absolute',
                            top: 0, left: 0}}>
                    {/* <Button type="primary" onClick={handleLogin_DeviceId} size="large">使用 device_id 登录</Button> */}
                    <Typography style={{margin:'0px 25px', display: 'flex', 
                            flexDirection: 'column',
                            justifyContent: 'center', 
                            alignItems: 'center'}}>
                        <Title style={{ fontSize:'48px', 
                                        marginTop: 10, 
                                        marginBottom : 0, 
                                        color : '#4287e1', 
                                        display : 'flex',
                                       alignItems: 'start'}} className='chat-sjtu-title' level={1}>
                            Chat SJTU
                            <Tag style={{ alignItems : 'start', marginLeft: '4px'}} color="#4287e1">
                                内测版
                            </Tag>
                        </Title>
                        <Paragraph style={{ fontSize:'30px', marginTop: 0, marginBottom : 0 }}>交大人的 AI 助手</Paragraph>
                        <Paragraph style={{ fontSize:'14px', marginTop: 14, maxWidth : '50%', textAlign : 'center'}}>我们计划创建一个个性化的AI学习平台——ChatSJTU，旨在提供一个自主和灵活的学习环境，帮助非计算机专业的研究生掌握他们所需的AI知识和技能。学习过程将由GPT-4作为“博物馆导览员”进行引导，学生可以自主选择学习的内容和路径。</Paragraph>
                    </Typography>
                    <Button style={{ marginTop: 20}} type="primary" size="large" onClick={() => jAccountLogin('/')}>使用 jAccount 登录</Button>
                    <div
                        style={{
                        position: 'absolute',
                        bottom: 0,
                        width: '100%',
                        textAlign: 'center',
                    }}>
                    </div>
                </div>
                <div style={{ display: 'flex', 
                            flexDirection: 'row',
                            justifyContent: 'center',
                            marginTop: '-80px',
                            alignItems: 'center', 
                            zIndex : '4',
                            position: 'relative'}}>
                    <img style={{ width:'80vw' }} src="https://s2.loli.net/2023/07/09/wSF8OsL2eRkfgIN.png" ></img>
                </div>
            </div>
            <Footer style={{background: '#FFF', padding : '0'}}>
                <div
                    style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    textAlign: 'center',
                    }}>
                    <p style={{fontSize: '12px', color: '#aaaaaa'}}>版权所有 © 2023 上海交通大学网络信息中心 沪交ICP备20230139，技术支持：ChatSJTU 学生开发团队</p>
                </div>
            </Footer>
        </Layout>
    )
}

export default LoginLayout;