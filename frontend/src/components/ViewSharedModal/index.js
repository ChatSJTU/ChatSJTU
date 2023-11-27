import React, { useContext } from "react";
import { useTranslation } from 'react-i18next';
import ReactStringReplace from 'react-string-replace';
import { Typography, List, Avatar, Button, Space, message, Card } from 'antd';
import MarkdownRenderer from '../MarkdownRenderer';
import { UserOutlined, RobotOutlined, InfoCircleOutlined, DeliveredProcedureOutlined, EyeOutlined } from '@ant-design/icons';

import { SessionContext } from '../../contexts/SessionContext';
import { request } from "../../services/request";
import './index.scss'

function ViewSharedModalContent ( {closeModal} ) {

    const { sharedSession, sessions, setSessions, setSelectedSession } = useContext(SessionContext);

    let { t } = useTranslation('ViewSharedModal')

    const forkShared = async () => {
        try {
            const response = await request.post('/api/save_shared', {share_id: sharedSession.shareId});
            setSessions([response.data, ...sessions]);
            setSelectedSession(response.data);
        } catch (error) {
            console.error('Failed to fork shared session:', error);
            message.error(error.response.data.error, 2);
        } finally {
            closeModal();
        }
    }

    //头像图标
    const aiIcon = <Avatar size={24}
        className='ai-icon'
        icon={<RobotOutlined/>} />
    const userIcon = <Avatar size={24}
        className='user-icon'
        icon={<UserOutlined/>} />
    const NoticeIcon = <Avatar size={24}
        className='notice-icon'
        icon={<InfoCircleOutlined />} />

    const AvatarList = [aiIcon, userIcon, NoticeIcon]
    
    return (
        <Typography>
            <Space direction="vertical" style={{marginTop:'10px', width: '100%'}} size="middle">
            <List className="shared-modal"
            dataSource={ sharedSession.messages }
            renderItem={(item, index) => (
            <div>
                <List.Item 
                    className={item.sender === 1 ? 'shared-user-message' : 'shared-bot-message'}  
                    style={{ wordBreak: 'break-all'}}>
                    <div style={{ width: '100%' }}>
                        <List.Item.Meta
                            avatar = {AvatarList[item.sender]}
                            description = {item.time}
                        />
                        <div style={{ width: '100%', marginTop: 6}}>
                            {item.sender === 0 && 
                                <MarkdownRenderer content={item.content}/>
                            }
                            {item.sender === 1 &&
                                <div className='user-text' style={{ whiteSpace: 'pre-wrap' }}>
                                    {item.image_urls && item.image_urls.length!==0 && 
                                        <List
                                            grid={{ gutter: 12 }}
                                            dataSource={item.image_urls}
                                            renderItem={img => (
                                            <List.Item>
                                                <Card className='card-preview'
                                                    hoverable
                                                    style={{width: 100, height:100 }}
                                                    bodyStyle={{ padding: 0 }}
                                                    onClick={() => window.open(img, '_blank')}
                                                >
                                                    <div className="card-preview-img-wrapper-sharedmodal">
                                                        <img alt="" src={img}/>
                                                    </div>
                                                    <div className="card-preview-icon-wrapper">
                                                        <EyeOutlined style={{ color: 'white', fontSize: '16px' }} />
                                                    </div>
                                                </Card>
                                            </List.Item>
                                            )}
                                        />
                                    }
                                    {
                                        ReactStringReplace(item.content, /(\s+)/g, (match, i) => (
                                            <span key={i}>
                                                {match.replace(/ /g, '\u00a0').replace(/\t/g, '\u00a0\u00a0\u00a0\u00a0')}
                                            </span>
                                        ))
                                    }
                                </div>
                            }
                        </div>
                    </div>
                </List.Item>
            </div>)} 
        />
        <Button icon={<DeliveredProcedureOutlined />}
            onClick={forkShared}>
            {t('ViewSharedModal_Btn')}
        </Button>
        </Space>
        </Typography>
    )
    
}

export default ViewSharedModalContent;