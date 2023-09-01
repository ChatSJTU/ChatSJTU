import React, {useRef, useState, useEffect, useContext} from 'react';
import { useTranslation } from 'react-i18next';
import {Layout, Menu, Typography, Divider, Col, Row, Button, Dropdown, message, Space, Modal, Input} from 'antd';
import {PlusCircleOutlined, RocketOutlined, UserOutlined, EllipsisOutlined, QuestionCircleOutlined, DeleteOutlined, EditOutlined, LogoutOutlined, SettingOutlined, CodeOutlined, InfoCircleOutlined, WalletOutlined, AlertOutlined, ExportOutlined} from '@ant-design/icons';

import ExportModalContent from './exportModal';
import { request } from "../../services/request";
import { SessionContext } from '../../contexts/SessionContext';
import { UserContext } from '../../contexts/UserContext';
import './index.css'

const { Content, Footer, Header } = Layout;
const { Title, Paragraph } = Typography;

function LeftSidebar ({ onSelectSession, onLogoutClick, onChangeComponent, onChangeSessionInfo}) {
    
    const {sessions, setSessions, selectedSession} = useContext(SessionContext);
    const {userProfile} = useContext(UserContext);
    const [loaded, setLoaded] = useState(true);
    const [isModalInputOpen, setModalInputOpen] = useState(false);
    const [modalInputValue, setModalInputValue] = useState('');
    const [isModalExportOpen, setModalExportOpen] = useState(false);

    const modalInputRef = useRef(null);

    const timeOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };

    let { t } = useTranslation('LeftSidebar');

    useEffect(() => {
        if (isModalInputOpen && modalInputRef.current) {
            setTimeout(() => {
                modalInputRef.current.focus();
            },0);
        }
    }, [isModalInputOpen]);

    useEffect(() => {
        setLoaded(true);
        fetchSessions();
    }, [])

    //获取会话列表
    const fetchSessions = async () => {
        try {
            const response = await request.get('/api/sessions/');
            response.data.sort(function(a, b) {
                return new Date(b.updated_time) - new Date(a.updated_time);
            });
            setSessions(response.data);
            if (loaded && response.data.length > 0) {
                onSelectSession(response.data[0]);
                setLoaded(false);
            }
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
                    onSelectSession(nextSelectedSession); // 更新选定的会话
                    handleScrollMenu(nextSelectedSession.id);
                } else if (sessionIndex > 0) {
                    // 如果删除的是最后一个会话且列表中还有其他会话，则选择上一个会话
                    nextSelectedSession = sessions[sessionIndex - 1];
                    onSelectSession(nextSelectedSession); // 更新选定的会话
                } else {
                    handleCreateSession(); // 如果会话列表为空，自动创建新会话
                    }
                }

        } catch (error) {
            console.error('Failed to delete session:', error);
            if (error.response.data) {
                message.error((t('LeftSidebar_DeleteSessionError') + ':' + `${error.response.data.error}`), 2);
            } else {
                message.error(t('LeftSidebar_DeleteSessionError'), 2);
            }
        }
    };

    //新建会话
    const handleCreateSession = async () => {
        try {
            const response = await request.post('/api/sessions/');
            const newSession = response.data;
            fetchSessions();  
            onSelectSession(newSession); // 进入新创建的会话
            handleScrollMenu(newSession.id,500);
        } catch (error) {
            console.error('Failed to create session:', error);
        }
    };

    //修改会话名称
    const handleRenameSession = async (event, sessionId, newSessionName) => {
        try {
            await request.post(`/api/sessions/rename/${sessionId}/`, {new_name: newSessionName});
            onChangeSessionInfo(sessionId, {name: newSessionName});
            message.success(t('LeftSidebar_RenameSessionSuccess'))
            setModalInputOpen(false);
        } catch (error) {
            if (error.response.data && error.response.status === 404){
                message.error(t('LeftSidebar_RenameSessionError') + ':' + `${error.response.data.error}`, 2);
                setModalInputOpen(false);
            } else if (error.response.data) {
                message.error(t('LeftSidebar_RenameSessionError') + ':' + `${error.response.data.error}`, 2);
            } else {
                message.error(t('LeftSidebar_RenameSessionError'))
            }
        } finally {
            setModalInputValue('');
        }
    }

    const openExportModal = (rounds) => {
        if (rounds === 0) {
            message.warning(t('LeftSidebar_exportModalError'));
        } else {
            setModalExportOpen(true);
        }
    }

    //选中会话
    // const handleSelectSession = (session) => {
    //     // 同步改名selectSession到sessions中
    //     if (selectedSession) {
    //         const updatedSessions = sessions.map(session =>
    //             session.id === selectedSession.id
    //                 ? { ...session, 
    //                     name: selectedSession.name,
    //                     rounds: selectedSession.rounds,
    //                     updated_time: selectedSession.updated_time}
    //                 : session
    //         );
    //         setSessions(updatedSessions);
    //     }
    //     onSelectSession(session);
    // };

    //选中帮助、关于、设置等
    const handleChangeComponent = (index) => {
        return () => onChangeComponent(index);
    };

    // useEffect(() => {
    //     if (sessions.length === 0) {
    //         handleCreateSession(); // 如果会话列表为空，自动创建新会话
    //     }
    // }, [sessions]);

    const handleScrollMenu = (index,timeout = 100) => {
        setTimeout(
            () => {
            let curSession = document.getElementById(`active_session_${index}`);
            if(curSession) curSession.scrollIntoView({behavior: 'smooth', block: "center"});
        },timeout)
    };
        

    return (
        <Layout style={{ height: '100%'}}>
            <Header className='Sider-content'>
                <Typography style={{margin:'0px 25px'}}>
                    <Title className='chat-sjtu-title' level={2}>Chat SJTU</Title>
                    <Paragraph style={{ fontSize:'16px', marginBottom: 10}}>{t('LeftSidebar_Subtitle')}</Paragraph>
                </Typography>
                <Row style={{margin:'0px 17.5px'}}>
                    <Col span={12} className='button-col'>
                        <Button block size="large" type="text" icon={<RocketOutlined />} disabled>
                            {t('LeftSidebar_VoiceControl_Btn')}
                        </Button>
                    </Col>
                    <Col span={12} className='button-col'>
                        <Button block size="large" type="text" icon={<PlusCircleOutlined/>}
                            onClick={handleCreateSession}>
                            {t('LeftSidebar_NewSession_Btn')}
                        </Button>
                    </Col>
                </Row>
            </Header>
            <Content className='Sider-content' style={{ overflow: 'auto' }}>
                <Menu style={{margin:'0px 17px 0px 25px'}}>
                    {sessions.map((session) => (
                        <Menu.Item className={`ant-menu-item${selectedSession?.id === session.id ? '-selected' : '-unselected'}`}
                            id={`active_session_${session.id}`}
                            key={session.id}
                            style={{margin:'15px 0px', height:'auto'}}
                            onClick={() => {
                                    handleScrollMenu(session.id);
                                    onSelectSession(session);
                                }
                            }>
                        <div style={{width:'100%', display: 'flex', flexDirection: 'column'}}>
                            <div
                                style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                cursor: 'pointer',
                                marginBottom: '-15px'
                                }}
                            >
                                <span className='session-name' title={session.name} key={session.name}
                                    style={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                }}>{session.name}</span>
                                {selectedSession && selectedSession.id === session.id && (
                                    <Space size={0}>
                                        <Button
                                            className='small-button'
                                            style={{ backgroundColor: 'transparent', marginRight: '-10px' }}
                                            type="text" icon={<EditOutlined />}
                                            onClick= {() => setModalInputOpen(true)}
                                        />
                                        <Modal
                                            title={t('LeftSidebar_Modal_Title')}
                                            open={isModalInputOpen}
                                            okText={t('LeftSidebar_ModalOK')}
                                            cancelText={t('LeftSidebar_ModalCancel')}
                                            onOk={(event) => {
                                                handleRenameSession(event,session.id,modalInputValue);
                                            }}
                                            onCancel={() => {
                                                setModalInputValue('');
                                                setModalInputOpen(false);
                                            }}
                                            >
                                            <div>
                                                <Input placeholder={session.name} showCount maxLength={30} ref={modalInputRef} value={modalInputValue} onChange={(event) => {setModalInputValue(event.target.value);}} style={{ marginTop: '7px' }} />
                                            </div>
                                        </Modal>
                                        <Button
                                            className='small-button'
                                            style={{backgroundColor:'transparent', marginRight: '-10px'}}
                                            type="text" icon={<ExportOutlined />}
                                            onClick={() => openExportModal(session.rounds)}
                                        />
                                        <Modal title={t('LeftSidebar_exportModalTitle')} open={isModalExportOpen} footer={null} 
                                            onCancel={() => setModalExportOpen(false)}
                                            >
                                            <ExportModalContent closeModal={() => setModalExportOpen(false)}/>
                                        </Modal>
                                        <Button
                                            className='small-button'
                                            style={{backgroundColor:'transparent', marginRight: '-10px'}}
                                            type="text" icon={<DeleteOutlined />}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleDeleteSession(event, session.id);
                                            }}
                                        />
                                    </Space>
                                )}
                            </div>      
                            <div
                                style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                cursor: 'pointer',
                                color: '#aaaaaa',
                                fontSize: '12px'
                                }}
                            >
                                <span>{session.rounds} {t('LeftSidebar_CountSession')}</span>
                                <span>{new Date(session.updated_time).toLocaleString('default', timeOptions)}</span>
                            </div>
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
                                    <Menu.Item icon={<UserOutlined />} key="0">{userProfile?.username}</Menu.Item>
                                    <Menu.Item icon={<WalletOutlined />} key="1"
                                        onClick={handleChangeComponent(7)}>{t('LeftSidebar_Account_Btn_Layer2')}</Menu.Item>
                                    <Menu.Item icon={<SettingOutlined />} key="2"
                                        onClick={handleChangeComponent(6)}>{t('LeftSidebar_Account_Btn_Layer3')}</Menu.Item>
                                    <Menu.Divider key="3"></Menu.Divider>
                                    <Menu.Item style={{color: 'red'}} icon={<LogoutOutlined />} key="4"
                                        onClick={onLogoutClick}>{t('LeftSidebar_Account_Btn_Layer4')}</Menu.Item>
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
                    <Col span={5} className='button-col' style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
                        <Dropdown placement="topRight"
                            overlay={
                                    <Menu>
                                        <Menu.Item icon={<CodeOutlined />} key="1" disabled>{t('LeftSidebar_Utils_Btn_Layer1')}</Menu.Item>
                                        <Menu.Item icon={<AlertOutlined />} key="2"
                                            onClick={handleChangeComponent(3)}>{t('LeftSidebar_Utils_Btn_Layer2')}</Menu.Item>
                                        <Menu.Item icon={<InfoCircleOutlined />} key="3"
                                            onClick={handleChangeComponent(2)}>{t('LeftSidebar_Utils_Btn_Layer3')}</Menu.Item>
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