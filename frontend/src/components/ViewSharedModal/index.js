import React, { useContext, useState } from "react";
import { useTranslation } from 'react-i18next';
import ReactStringReplace from 'react-string-replace';
import { Typography, List, Avatar, Button, Space } from 'antd';
import MarkdownRenderer from '../MarkdownRenderer';
import { UserOutlined, RobotOutlined, InfoCircleOutlined, DeliveredProcedureOutlined } from '@ant-design/icons';

import { SessionContext } from '../../contexts/SessionContext';
import './index.scss'

const { Title, Text } = Typography;

function ViewSharedModalContent ( {closeModal} ) {

    const { sharedSessionMsgs } = useContext(SessionContext);

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
            <List
            style={{overflow: 'auto', maxHeight: '450px', fontSize: '14px', border: '1px solid #888888', borderRadius: '6px'}}
            dataSource={ sharedSessionMsgs }
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
        <Button icon={<DeliveredProcedureOutlined />}>继续此会话</Button>
        </Space>
        </Typography>
    )
    
}

export default ViewSharedModalContent;