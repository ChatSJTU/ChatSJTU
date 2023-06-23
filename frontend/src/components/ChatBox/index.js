//主要组件，聊天列表和发送文本框

import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, List, Typography, Avatar } from 'antd';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { InlineMath, BlockMath } from 'react-katex';

import 'katex/dist/katex.min.css';
import 'github-markdown-css/github-markdown.css';
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

    //用户发送消息
    const sendUserMessage = () => {
        setMessages([...messages, { sender: 'User', content: input }]);
        setInput('');
    };

    //服务端发送消息
    const sendAIMessage = async userMessage => {
        // Replace this with your AI API call
        const aiMessage = `${userMessage}`;
        setMessages(prevMessages => [...prevMessages, { sender: 'AI', content: aiMessage }]);
    };
    
    //保持input变量始终与文本框内容同步
    const handleUserInput = e => {
        setInput(e.target.value);
    };

    //检查发送消息是否为空，不为空则发送
    const handleSend = () => {
        if (input.trim() !== ''){
            sendUserMessage();
            sendAIMessage(input);
        }
    };

    //Enter按钮自动发送
    const handleEnterPress = e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    //聊天框中markdown公式渲染
    const renderers = {
        inlineMath: ({value}) => <InlineMath>{value}</InlineMath>,
        math: ({value}) => <BlockMath>{value}</BlockMath>
    }

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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' ,maxHeight: '100%'}}>
        <List
            style={{ flex: 1, overflow: 'auto'}}
            dataSource={messages}
            renderItem={item => (
            <List.Item 
                className={item.sender === 'User' ? 'user-message' : 'bot-message'}
                style={{padding: '20px 100px'}}>
                <div>
                    <List.Item.Meta
                        avatar={item.sender === 'User' ? userIcon : aiIcon}
                        // style={{ alignSelf: 'flex-start' }}
                    />
                    <div style={{ width: '100%' }}>
                    <ReactMarkdown 
                        children={item.content}
                        remarkPlugins={[remarkGfm, remarkMath]}
                        components={renderers}
                        style={{ color: 'black !important' }}
                        />
                    </div>
                </div>
                <div ref={messagesEndRef} />
            </List.Item>
          )}
        />
        
        <div className='sendbox-area' style={{ padding: '20px 100px'}}>
            <TextArea
                rows={4}
                value={input}
                onChange={handleUserInput}
                onPressEnter={handleEnterPress}
                placeholder="在此输入您要发送的信息"
                style={{resize: 'none'}}
            />
            <Button type="primary" onClick={handleSend} style={{ marginTop: '10px' }}>
                发送
            </Button>
        </div>
      </div>
    );
  }
  
  export default ChatBox;