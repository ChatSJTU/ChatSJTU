//主要组件，聊天列表和发送文本框

import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, List, Avatar, message, Space, Badge, Dropdown, Menu, Typography} from 'antd';
import { UserOutlined, RobotOutlined, SendOutlined, ArrowDownOutlined, CopyOutlined, InfoCircleOutlined, ReloadOutlined, LoadingOutlined } from '@ant-design/icons';
import ReactStringReplace from 'react-string-replace';
import copy from 'copy-to-clipboard';
import MarkdownRenderer from '../MarkdownRenderer';
import { request } from '../../services/request';
import { qcmdsList } from '../../services/qcmd'

import './index.css'

const { TextArea } = Input;
const { Text } = Typography;

function ChatBox({ selectedSession, onChangeSessionName }) {
    const [messages, setMessages] = useState([]);           //消息列表中的消息
    const [input, setInput] = useState('');
    const [isWaiting, setIsWaiting] = useState(false);      //是否正在加载
    const [retryMessage, setRetryMessage] = useState(null);
    const [qcmdOptions, setQcmdOptions] = useState([]);     //按输入筛选快捷命令
    const [showQcmdTips, setShowQcmdTips] = useState(false);//是否显示快捷命令提示
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

    const WaitingText = '回复生成中（若结果较长或遇用量高峰期，请耐心等待~）';
    const ErrorText = '回复生成失败'

    // 用户发送消息(可选参数retryMsg，若有则发送之，若无则发送input)
    const sendUserMessage = async (retryMsg) => {
        setIsWaiting(true);
        setShowQcmdTips(false);
        const userMessage = retryMsg || input;
        try {
            const messageData = { message: userMessage };  // 存储请求数据到变量
            setInput('');
            // 先显示用户发送消息，时间为sending
            setMessages((prevMessages) => [
                ...prevMessages.filter((message) => message.time !== ErrorText && message.sender !== 2),
                {
                    sender: 1,
                    content: userMessage,
                    time: WaitingText,
                },
            ]);

            // 发送消息到后端处理
            const response = await request.post(`/api/send-message/${selectedSession.id}/`, messageData);
            // 在前端显示用户发送的消息和服务端返回的消息
            const aiMessage = response.data.message;
            const sendTime = new Date(response.data.send_timestamp);
            const responseTime = new Date(response.data.response_timestamp);
            const flagQcmd = response.data.is_qcmd;
            // 避免可能的时间先后错误，统一接收后端时间并显示
            setMessages((prevMessages) => [
                ...prevMessages.filter((message) => message.time !== WaitingText),
                {
                    sender: 1,
                    content: userMessage,
                    time: sendTime.toLocaleString('default', timeOptions),
                },
                {
                    sender: 0,
                    content: aiMessage,
                    flag_qcmd: flagQcmd,
                    time: responseTime.toLocaleString('default', timeOptions),
                },
            ]);
            if (retryMessage) {setRetryMessage(null);}
            
            //可能的会话名更改
            if (response.data.session_rename !== ''){
                onChangeSessionName(response.data.session_rename);
            }

        } catch (error) {
            console.error('Failed to send message:', error);
            if (error.response.data && error.response.status === 404) {
                message.error(`回复生成失败：${error.response.data.error}`, 2);
            } else if (error.response.data.error) {
                showWarning(error.response.data.error);
                setRetryMessage(userMessage);
            } else {
                message.error('回复生成失败', 2);
            }

            setMessages((prevMessages) =>
                prevMessages.map((message) => message.time === WaitingText ? { ...message, time: ErrorText } : message)
            );
        } finally {
            setIsWaiting(false);
        }
    };
    
    //重试发送
    const handleRetry = async () => {
        if (retryMessage) {
          await sendUserMessage(retryMessage);
        } else {
          message.error('无可重试的消息', 2);
        }
    };    

    //显示特殊信息（预留）
    const showWarning = (content) => {
        // const time_now = new Date();
        setMessages((prevMessages) => [
            ...prevMessages,
            {
                sender: 2,
                content: content,
                // time: time_now.toLocaleString('default', timeOptions),
                time: '系统提示'
            },
        ]);
    }

    //保持input变量始终与文本框内容同步
    const handleUserInput = e => {
        setInput(e.target.value);
        
        if (e.target.value.startsWith('~')) {
            setShowQcmdTips(true);
            handleFilterQcmds(e.target.value);
        } else {
            setShowQcmdTips(false);
        }
    };

    //检查发送消息是否为空，不为空则发送
    const handleSend = () => {
        if (input.trim() !== '') {
            setRetryMessage(null);
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

    //快捷指令提示
    const handleFilterQcmds = (value) => {
        if (value[0] !== '~') {
            setQcmdOptions([]);
        } else {
            setQcmdOptions(
                qcmdsList.filter(({ command }) => command.startsWith(value))
                    .map(({ command, description }) => ({
                        value: command,
                        label: (
                            <Typography><Text keyboard>{command}</Text> - {description}</Typography>
                        ),
                    }))
            );
        }
    };
    // 当用户选择一个命令时，更新输入值并隐藏下拉框
    const handleSelectQcmds = value => {
        setInput(value);
        setShowQcmdTips(false);
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
    
    // sender标识：AI-0，用户-1，错误提示信息-2（仅留在前端）

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
                            <div style={{ display: 'flex', alignItems: 'center'}}>
                                {item.time === WaitingText && <LoadingOutlined style={{marginRight : '15px'}}/> }
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
                    )}
                    {(item.sender === 0 && item.flag_qcmd) &&
                        <Badge
                            className="normal-badge"
                            status={null}
                            count='本回复来自校园服务快捷命令'
                            style={{ background: '#eeeeee', marginTop:'15px', color: '#555555'}}
                        />
                        }
                    {item.sender === 2 && 
                        <Button icon={<ReloadOutlined />} onClick={handleRetry}
                            style={{marginTop:'15px'}} size='large'>重试</Button>
                        }
                    
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
            <Dropdown placement="topLeft" overlay={
                    <Menu style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {qcmdOptions.map(option => (
                            <Menu.Item key={option.value} onClick={() => handleSelectQcmds(option.value)}>
                                {option.label}
                            </Menu.Item>
                        ))}
                    </Menu>}
                 open={showQcmdTips}
            >
                <TextArea
                    rows={4}
                    value={input}
                    onChange={handleUserInput}
                    //ctrl+enter发送
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            if (e.shiftKey) {
                            setInput(input + '\n');
                            } else {
                                if (!isWaiting)
                                {handleSend();}
                            }
                        }
                        // if (e.key === 'Enter' && e.ctrlKey) {
                        //   e.preventDefault();
                        //   handleSend();
                        // }
                    }}
                    placeholder="在此输入您要发送的信息，Shift+Enter 换行，Enter 发送，~ 触发快捷命令"
                    style={{resize: 'none', fontSize:'16px'}}
                />
            </Dropdown>
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