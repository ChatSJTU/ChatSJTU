import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, List, Typography } from 'antd';

const { TextArea } = Input;
const { Text } = Typography;

function ChatBox() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
  
    const scrollToBottom = () => {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    };
  
    useEffect(scrollToBottom, [messages]);
  
    const sendUserMessage = () => {
      if (input) {
        setMessages([...messages, { sender: 'User', content: input }]);
        setInput('');
      }
    };
  
    const sendAIMessage = async userMessage => {
      // Replace this with your AI API call
      const aiMessage = `AI response to: ${userMessage}`;
      setMessages(prevMessages => [...prevMessages, { sender: 'AI', content: aiMessage }]);
    };
  
    const handleUserInput = e => {
      setInput(e.target.value);
    };
  
    const handleSend = () => {
      sendUserMessage();
      sendAIMessage(input);
    };
  
    const handleEnterPress = e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };
  
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <List
          style={{ flex: 1, overflow: 'auto', padding: '0 50px', marginTop: 64 }}
          dataSource={messages}
          renderItem={item => (
            <List.Item>
              <Text strong>{item.sender}</Text>: {item.content}
            </List.Item>
          )}
        />
        <div ref={messagesEndRef} />
        <div style={{ padding: '10px 50px', background: '#fff' }}>
          <TextArea
            rows={4}
            value={input}
            onChange={handleUserInput}
            onPressEnter={handleEnterPress}
            placeholder="Type your message here"
          />
          <Button type="primary" onClick={handleSend} style={{ marginTop: '10px' }}>
            Send
          </Button>
        </div>
      </div>
    );
  }
  
  export default ChatBox;