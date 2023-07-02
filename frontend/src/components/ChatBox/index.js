//主要组件，聊天列表和发送文本框

import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, List, Avatar, message, Space} from 'antd';
import { UserOutlined, RobotOutlined, SendOutlined, ArrowDownOutlined, CopyOutlined, InfoCircleOutlined } from '@ant-design/icons';
import ReactStringReplace from 'react-string-replace';
import copy from 'copy-to-clipboard';
import MarkdownRenderer from '../MarkdownRenderer';
import { request } from '../../services/request';

import './index.css'

const { TextArea } = Input;

function ChatBox({ selectedSession }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isWaiting, setIsWaiting] = useState(false);
    const messagesEndRef = useRef(null);

    const timeOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };

    //发送消息自动滚动到底部
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    useEffect(() => {
        if (selectedSession) {
          // 请求选中会话的消息记录数据
          request.get(`/api/sessions/${selectedSession.id}/messages/`)
            .then(response => {
                setMessages(response.data);
            })
            .catch(error => {
                console.error('Error fetching messages:', error);
                if (error.response.data) {
                    message.error(`请求消息记录失败：${error.response.data.error}`, 2);
                } else {
                    message.error('请求消息记录失败', 2);
                }
            });
        }
      }, [selectedSession]);

    //回到List底部
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // 用户发送消息
    const sendUserMessage = async () => {
        setIsWaiting(true);
        try {
            const messageData = { message: input };  // 存储请求数据到变量
            const userMessage = input;
            setInput('');
            // 先显示用户发送消息，时间为sending
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    sender: 1,
                    content: userMessage,
                    time: '发送中...',
                },
            ]);

            // 发送消息到后端处理
            const response = await request.post(`/api/send-message/${selectedSession.id}/`, messageData);
            // 在前端显示用户发送的消息和服务端返回的消息
            const aiMessage = response.data.message;
            const sendTime = new Date(response.data.send_timestamp);
            const responseTime = new Date(response.data.response_timestamp);
            // 避免可能的时间先后错误，统一接收后端时间并显示
            setMessages((prevMessages) => [
                ...prevMessages.filter((message) => message.time !== '发送中...'),
                {
                    sender: 1,
                    content: userMessage,
                    time: sendTime.toLocaleString('default', timeOptions),
                },
                {
                    sender: 0,
                    content: aiMessage,
                    time: responseTime.toLocaleString('default', timeOptions),
                },
            ]);
            
        } catch (error) {
            console.error('Failed to send message:', error);
            if (error.response.data) {
                message.error(`发送消息失败：${error.response.data.error}`, 2);
            } else {
                message.error('发送消息失败', 2);
            }
        } finally {
            setIsWaiting(false);
        }
    };
    
    //显示特殊信息（预留）
    const showNotice = () => {
        const time_now = new Date();
        setMessages((prevMessages) => [
            ...prevMessages,
            {
                sender: 2,
                content: '预留信息',
                time: time_now.toLocaleTimeString(),
            },
        ]);
    }

    //保持input变量始终与文本框内容同步
    const handleUserInput = e => {
        setInput(e.target.value);
    };

    //检查发送消息是否为空，不为空则发送
    const handleSend = () => {
        if (input.trim() !== '') {
            sendUserMessage();
        } else {
            message.error('发送消息不能为空', 2);
        }
      };

    //复制
    const handleCopy = (content) => {
        copy(content);
        message.success('已复制到剪贴板', 2);
      };

    //头像图标
    const aiIcon = <Avatar 
        icon={<RobotOutlined/>}
        style={{
                backgroundColor: '#aff392',
                color: '#62a645',
            }}
        />
    const userIcon = <Avatar 
        icon={<UserOutlined/>}
        style={{
                backgroundColor: '#fde3cf',
                color: '#f56a00',
            }}
        />
    const NoticeIcon = <Avatar
        icon={<InfoCircleOutlined />}
        style={{
                backgroundColor: '#debfff',
                color: '#7945af',
            }}
        />

    const AvatarList = [aiIcon, userIcon, NoticeIcon]
    
    // sender标识：AI-0，用户-1，预留提示信息-2（仅留在前端）

    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' ,minHeight: '100%',maxHeight: '100%'}}>
        <List
            style={{ flex: 1, overflow: 'auto'}}
            dataSource={messages}
            renderItem={item => (
            <List.Item 
                className={item.sender === 1 ? 'user-message' : 'bot-message'}  
                style={{padding: '20px 46px 20px 50px', wordBreak: 'break-all'}}>
                <div style={{ width: '100%'}}>
                    <List.Item.Meta
                        // avatar={item.sender ? userIcon : aiIcon}
                        avatar = {AvatarList[item.sender]}
                        description={
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ flex: '1' }}>{item.time}</div>
                                <Button type="text"
                                    icon={<CopyOutlined />}
                                    onClick={() => handleCopy(item.content)}
                                />
                            </div>
                        }
                        
                    />
                    <div style={{ width: '100%', marginTop: 10}}>
                    {item.sender === 1 ? (
                        <div style={{ whiteSpace: 'pre-wrap' }}>
                            {ReactStringReplace(item.content, /(\s+)/g, (match, i) => (
                            <span key={i}>
                                {match.replace(/ /g, '\u00a0').replace(/\t/g, '\u00a0\u00a0\u00a0\u00a0')}
                            </span>
                            ))}
                        </div>
                        ) : (
                        <MarkdownRenderer content={item.content}/>
                        // <ReactMarkdown
                        //     className='markdown-body'
                        //     children={item.content}
                        //     remarkPlugins={[remarkGfm, remarkMath, remarkHtml]}
                        //     rehypePlugins={[rehypeKatex]}
                        //     components={renderers}
                        //     style={{ wordWrap: 'break-word', overflowWrap: 'break-word'}}
                        // />
                    )}
                    </div>
                </div>
                <div ref={messagesEndRef} />
            </List.Item>
          )}
        />
        
        <div className='sendbox-area' style={{ padding: '20px 50px', position: 'relative'}}>
                <Button 
                    icon={<ArrowDownOutlined />} 
                    style={{ position: 'absolute', top: -40, right: 10, zIndex: 10 }}
                    onClick={scrollToBottom}
                />
            <TextArea
                rows={4}
                value={input}
                onChange={handleUserInput}
                //ctrl+enter发送
                onKeyDown={e => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                placeholder="在此输入您要发送的信息"
                style={{resize: 'none', fontSize:'16px'}}
            />
            <Space style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <Button size="large" onClick={() => setInput('')}>
                    清空
                </Button>
                <Button type="primary" size="large" onClick={handleSend} icon={<SendOutlined />}
                    loading={isWaiting}>
                    发送
                </Button>
            </Space>
        </div>
    </div>
    );
}

export default ChatBox;