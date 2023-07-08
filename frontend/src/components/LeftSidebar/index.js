import React, {useState, useEffect} from 'react';
import {Layout, Menu, Typography, Divider, Col, Row, Button, Dropdown, message} from 'antd';
import {PlusCircleOutlined, RocketOutlined, UserOutlined, EllipsisOutlined, QuestionCircleOutlined, DeleteOutlined, LogoutOutlined, SettingOutlined, CodeOutlined, InfoCircleOutlined, WalletOutlined, AlertOutlined} from '@ant-design/icons';

import { request } from "../../services/request";
import { fetchUserProfile } from '../../services/user';
import './index.css'

const { Content, Footer, Header } = Layout;
const { Title, Paragraph } = Typography;

function LeftSidebar ({ selectedSession, onSelectSession, onLogoutClick, onChangeComponent}) {
    
    const [sessions, setSessions] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchSessions();
        fetchUserName();
    }, []);

    //获取登录用户名称
    const fetchUserName = async () => {
        try {
            const userData = await fetchUserProfile();
            setUser(userData);
        } catch (error) {
            if (error.response.status === 404){
                message.error('用户不存在',2);
            }
        }
    };

    //获取会话列表
    const fetchSessions = async () => {
        try {
            const response = await request.get('/api/sessions/');
            setSessions(response.data);
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        }
    };

    //删除会话
    const handleDeleteSession = async (event, sessionId) => {
        event.stopPropagation(); 
        try {
            await request.delete(`/api/sessions/${sessionId}/`);
            // 更新会话列表
            setSessions((prevSessions) => prevSessions.filter((session) => session.id !== sessionId));

            // 确定下一个或上一个会话
            let nextSelectedSession = null;
            const sessionIndex = sessions.findIndex(session => session.id === sessionId);
            if (sessionIndex !== -1) {
                if (sessionIndex < sessions.length - 1) {
                    // 如果删除的不是最后一个会话，则选择下一个会话
                    nextSelectedSession = sessions[sessionIndex + 1];
                } else if (sessionIndex > 0) {
                    // 如果删除的是最后一个会话且列表中还有其他会话，则选择上一个会话
                    nextSelectedSession = sessions[sessionIndex - 1];
                } else {
                    handleCreateSession(); // 如果会话列表为空，自动创建新会话
                    nextSelectedSession = 0;
                    }
                }
            onSelectSession(nextSelectedSession); // 更新选定的会话
        } catch (error) {
            console.error('Failed to delete session:', error);
            if (error.response.data) {
                message.error(`删除会话失败：${error.response.data.error}`, 2);
            } else {
                message.error('删除会话失败', 2);
            }
        }
    };

    //新建会话
    const handleCreateSession = async () => {
        try {
            const response = await request.post('/api/sessions/');
            const newSession = response.data;
            // setSessions([...sessions, newSession]);
            fetchSessions();
            onSelectSession(newSession); // 进入新创建的会话
        } catch (error) {
            console.error('Failed to create session:', error);
        }
    };

    //选中会话
    const handleSelectSession = (session) => {
        // 同步改名selectSession到sessions中
        if (selectedSession) {
            const updatedSessions = sessions.map(session =>
                session.id === selectedSession.id
                    ? { ...session, name: selectedSession.name }: session
            );
            setSessions(updatedSessions);
        }
        onSelectSession(session);
    };

    //选中帮助、关于、设置等
    const handleChangeComponent = (index) => {
        return () => onChangeComponent(index);
    };

    // useEffect(() => {
    //     if (sessions.length === 0) {
    //         handleCreateSession(); // 如果会话列表为空，自动创建新会话
    //     }
    // }, [sessions]);

    return (
        <Layout style={{ height: '100%'}}>
            <Header className='Sider-content'>
                <Typography style={{margin:'0px 25px'}}>
                    <Title className='chat-sjtu-title' level={2}>Chat SJTU</Title>
                    <Paragraph style={{ fontSize:'16px', marginBottom: 10}}>交大人的 AI 助手</Paragraph>
                </Typography>
                <Row style={{margin:'0px 17.5px'}}>
                    <Col span={12} className='button-col'>
                        <Button block size="large" type="text" icon={<RocketOutlined />}>
                            伴我学
                        </Button>
                    </Col>
                    <Col span={12} className='button-col'>
                        <Button block size="large" type="text" icon={<PlusCircleOutlined/>}
                            onClick={handleCreateSession}>
                            新的会话
                        </Button>
                    </Col>
                </Row>
            </Header>
            <Content className='Sider-content' style={{ overflow: 'auto' }}>
                <Menu style={{margin:'0px 17px 0px 25px'}}>
                    {sessions.map((session) => (
                        <Menu.Item className={`ant-menu-item${selectedSession?.id === session.id ? '-selected' : '-unselected'}`}
                            key={session.id} style={{margin:'15px 0px'}}>
                        <div
                            style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                            cursor: 'pointer',
                            }}
                            onClick={() => handleSelectSession(session)}
                        >
                            {/* <div>
                                <MessageOutlined />
                                <span>{session.name}</span>
                            </div> */}
                            <span className='session-name' key={selectedSession?.id === session.id ? selectedSession.name : session.name}
                                style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    flex: '1',
                            }}>{selectedSession?.id === session.id ? selectedSession.name : session.name}</span>

                            {selectedSession && selectedSession.id === session.id && (
                                <Button
                                    className='delete-button'
                                    style={{backgroundColor:'transparent', marginRight: '-10px'}}
                                    type="text" icon={<DeleteOutlined />}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleDeleteSession(event, session.id);
                                    }}
                                />
                                )}
                        </div>
                        </Menu.Item>
                    ))}
                    </Menu>
            </Content>
            <Footer className='Sider-content'>
                <Divider className="gradient-divider"></Divider>
                <Row style={{margin:'0px 17.5px 20px 17.5px'}}>
                    {/* 用户按钮 */}
                    <Col span={5} className='button-col'>
                        <Dropdown placement="topLeft"
                            overlay={
                                <Menu>
                                    <Menu.Item icon={<UserOutlined />} key="0">{user?.username}</Menu.Item>
                                    <Menu.Item icon={<WalletOutlined />} key="1"
                                        onClick={handleChangeComponent(6)}>账户信息</Menu.Item>
                                    <Menu.Item icon={<SettingOutlined />} key="2"
                                        onClick={handleChangeComponent(5)}>偏好设置</Menu.Item>
                                    <Menu.Divider key="3"></Menu.Divider>
                                    <Menu.Item style={{color: 'red'}} icon={<LogoutOutlined />} key="4"
                                        onClick={onLogoutClick}>退出登录</Menu.Item>
                                </Menu>
                            }
                        >
                            <Button block size="large" type="text" icon={<UserOutlined />}/>
                        </Dropdown>
                    </Col>
                    {/* 帮助按钮 */}
                    <Col span={5} className='button-col'>
                        <Button block size="large" type="text" icon={<QuestionCircleOutlined />}
                            onClick={handleChangeComponent(4)}/>
                    </Col>
                    <Col span={9} className='button-col'/>
                    {/* 更多按钮 */}
                    <Col span={5} className='button-col'>
                        <Dropdown placement="topRight"
                            overlay={
                                    <Menu>
                                        <Menu.Item icon={<CodeOutlined />} key="1" disabled>扩展开发</Menu.Item>
                                        <Menu.Item icon={<AlertOutlined />} key="2"
                                            onClick={handleChangeComponent(3)}>免责声明</Menu.Item>
                                        <Menu.Item icon={<InfoCircleOutlined />} key="3"
                                            onClick={handleChangeComponent(2)}>关于我们</Menu.Item>
                                    </Menu>
                                }
                        >
                            <Button block size="large" type="text" icon={<EllipsisOutlined />}/>
                        </Dropdown>
                    </Col>
                </Row>
            </Footer>
        </Layout>
    )
}

export default LeftSidebar;