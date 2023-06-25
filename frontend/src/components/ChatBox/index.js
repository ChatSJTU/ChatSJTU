//主要组件，聊天列表和发送文本框

import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, List, Typography, Avatar, message, Space} from 'antd';
import { UserOutlined, RobotOutlined, SendOutlined, ArrowDownOutlined, CopyOutlined } from '@ant-design/icons';
import ReactStringReplace from 'react-string-replace';
import copy from 'copy-to-clipboard';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex'
import remarkHtml from 'remark-html';

import 'katex/dist/katex.min.css';
import 'github-markdown-css/github-markdown-light.css';
import './index.css'


const { TextArea } = Input;
const { Text } = Typography;

function ChatBox() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    //发送消息自动滚动到底部
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    //回到List底部
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    //用户发送消息
    const sendUserMessage = () => {
        setMessages(
            [...messages, 
                { 
                    sender: 1, 
                    content: input,
                    time: new Date().toLocaleTimeString()
                }
            ]);
        setInput('');
    };

    //服务端发送消息
    const sendAIMessage = async userMessage => {
        // Replace this with your AI API call
        const aiMessage = `${userMessage}`;
        setMessages(prevMessages => 
            [...prevMessages, 
                {
                    sender: 0, 
                    content: aiMessage,
                    time: new Date().toLocaleTimeString() 
                }
            ]);
    };
    
    //保持input变量始终与文本框内容同步
    const handleUserInput = e => {
        setInput(e.target.value);
    };

    //检查发送消息是否为空，不为空则发送
    const handleSend = () => {
        if (input.trim() !== '') {
          sendUserMessage();
          sendAIMessage(input);
        } else {
          message.error('发送消息不能为空', 2);
        }
      };

    //聊天框中html渲染
    const renderers = {
        // inlineMath: ({value}) => <InlineMath>{value}</InlineMath>,
        // math: ({value}) => <BlockMath>{value}</BlockMath>,
        html: ({value}) => <div dangerouslySetInnerHTML={{ __html: value }} />
    }

    //复制
    const handleCopy = (content) => {
        copy(content);
        message.success('已复制到剪贴板', 2);
      };

    //图标
    const userIcon = <Avatar 
        icon={<UserOutlined/>}
        style={{
                backgroundColor: '#fde3cf',
                color: '#f56a00',
            }}
        />

    const aiIcon = <Avatar 
        icon={<RobotOutlined/>}
        style={{
                backgroundColor: '#aff392',
                color: '#62a645',
            }}
        />

    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' ,minHeight: '100%',maxHeight: '100%'}}>
        <List
            style={{ flex: 1, overflow: 'auto'}}
            dataSource={messages}
            renderItem={item => (
            <List.Item 
                className={item.sender ? 'user-message' : 'bot-message'}
                style={{padding: '20px 46px 20px 50px', wordBreak: 'break-all'}}>
                <div style={{ width: '100%'}}>
                    <List.Item.Meta
                        avatar={item.sender ? userIcon : aiIcon}
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
                    {item.sender ? (
                        <div style={{ whiteSpace: 'pre-wrap' }}>
                            {ReactStringReplace(item.content, /(\s+)/g, (match, i) => (
                            <span key={i}>
                                {match.replace(/ /g, '\u00a0').replace(/\t/g, '\u00a0\u00a0\u00a0\u00a0')}
                            </span>
                            ))}
                        </div>
                        ) : (
                        <ReactMarkdown
                            className='markdown-body'
                            children={item.content}
                            remarkPlugins={[remarkGfm, remarkMath, remarkHtml]}
                            rehypePlugins={[rehypeKatex]}
                            components={renderers}
                            style={{ wordWrap: 'break-word', overflowWrap: 'break-word'}}
                        />
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
                <Button type="primary" size="large" onClick={handleSend} icon={<SendOutlined />}>
                    发送
                </Button>
            </Space>
        </div>
    </div>
    );
}

export default ChatBox;