//主要组件，聊天列表和发送文本框

import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, List, Avatar, message, Space, Tag, Dropdown, Menu, Typography, Segmented, Alert} from 'antd';
import { UserOutlined, RobotOutlined, SendOutlined, ArrowDownOutlined, CopyOutlined, InfoCircleOutlined, ReloadOutlined, LoadingOutlined, ThunderboltOutlined, StarOutlined, DoubleRightOutlined } from '@ant-design/icons';
import ReactStringReplace from 'react-string-replace';
import copy from 'copy-to-clipboard';
import { useMediaQuery } from 'react-responsive'

import MarkdownRenderer from '../MarkdownRenderer';
import { request } from '../../services/request';
import { qcmdsList, qcmdPromptsList } from '../../services/qcmd'

import './index.css'

const { TextArea } = Input;
const { Text, Paragraph } = Typography;

function ChatBox({ selectedSession, onChangeSessionInfo, curRightComponent}) {
    const [messages, setMessages] = useState([]);           //消息列表中的消息
    const [input, setInput] = useState('');
    const [rows, setRows] = useState(3);        //textarea行数
    const [textareaWidth, setTextareaWidth] = useState(0);
    const [selectedModel, setSelectedModel] = useState('Azure GPT3.5');  //选中模型
    const [isWaiting, setIsWaiting] = useState(false);      //是否正在加载
    const [retryMessage, setRetryMessage] = useState(null);
    const [qcmdOptions, setQcmdOptions] = useState([]);     //按输入筛选快捷命令
    const [showQcmdTips, setShowQcmdTips] = useState(false);//是否显示快捷命令提示
    
    const isFold = useMediaQuery({ minWidth: 768.1, maxWidth: 960 })
    const isFoldMobile = useMediaQuery({ maxWidth: 432 })
    
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

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
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end', });
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

    useEffect(() => {
        function handleResize() {
          if (textareaRef.current) {
            setTextareaWidth(textareaRef.current.resizableTextArea.textArea.offsetWidth);
            console.log(textareaRef.current.resizableTextArea.textArea.offsetWidth);
          }
        }
        
        // Initial resize
        handleResize();
        // Handle resize when window size changes
        window.addEventListener('resize', handleResize);
    
        // Clean up event listener on unmount
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    //回到List底部
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end', });
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
            const messageData = { 
                message: userMessage,
                model: selectedModel
            };  // 存储请求数据到变量
            setInput('');
            handleCalcRows('');
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
            console.log(response);
            // 在前端显示用户发送的消息和服务端返回的消息
            const sendTime = new Date(response.data.send_timestamp);
            const responseTime = new Date(response.data.response_timestamp);
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
                    content: response.data.message,
                    flag_qcmd: response.data.flag_qcmd,
                    use_model: response.data.use_model,
                    time: responseTime.toLocaleString('default', timeOptions),
                },
            ]);
            if (retryMessage) {setRetryMessage(null);}
            
            //可能的会话名更改
            if (response.data.session_rename !== ''){
                onChangeSessionInfo({'name':response.data.session_rename});
            }
            onChangeSessionInfo({
                'rounds': selectedSession.rounds + 1,
                'updated_time': responseTime.toLocaleString('default', timeOptions),
            });

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
        
        if (e.target.value.startsWith('/') || e.target.value.startsWith('+')) {
            setShowQcmdTips(true);
            handleFilterQcmds(e.target.value);
        } else {
            setShowQcmdTips(false);
        }

        handleCalcRows(e.target.value);
    };

    const handleCalcRows = (content) => {
        const lineCount = content.split("\n").length;
        if (lineCount <= 3) {
            setRows(3);
        } else if (lineCount > 10) {
            setRows(10);
        } else {
            setRows(lineCount);
        }
    }

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

    //快捷指令、快捷补全提示菜单
    const handleFilterQcmds = (value) => {
        if (value[0] === '/') {
            let filterList = qcmdsList.filter(({ command }) => command.startsWith(value))
                    .map(({ command, description }) => ({
                        value: command,
                        label_render: (
                            <Typography >
                                <Text keyboard style={{fontWeight:'bold'}}>{command}</Text> - {description}
                            </Typography>
                        ),
                        label: command
                    }))
            setQcmdOptions(filterList);
            if (filterList.length === 0) {
                setShowQcmdTips(false);
            }
        } else if (value[0] === '+') {
            let filterList = qcmdPromptsList.filter(({ role }) => role.includes(value.substring(1)))
                    .map(({ role, prompt }) => {
                        // 使用正则表达式将字符串分割为数组
                        let promptArray = prompt.split(/(%userinput%)/g);
                        return {
                            value: role,
                            label_render: (
                                <Typography>
                                    <Text strong>{role}</Text><br/>
                                        {promptArray.map((item, index) => {
                                            if (item === '%userinput%') {
                                                return <Tag color="geekblue" style={{margin:'2px'}}>USER INPUT</Tag>;
                                            }
                                            return item;
                                        })}
                                </Typography>
                            ),
                            label: prompt
                        };
                    })
            setQcmdOptions(filterList);
            if (filterList.length === 0) {
                setShowQcmdTips(false);
            }
        } else {
            setQcmdOptions([]);
            setShowQcmdTips(false);
        } 
    };
    // 用户选择命令时
    const handleSelectQcmds = (value, label) => {
        // setInput(value);
        if (value[0] === '/') { //快捷命令，发送并关闭菜单
            sendUserMessage(value);
            setShowQcmdTips(false);
        }
        else {
            let position = label.indexOf("%userinput%");
            setInput(label.replace("%userinput%",""));
            setShowQcmdTips(false);
            setTimeout(() => { // 使用setTimeout确保DOM已经更新
                if (textareaRef.current) {
                    //文本框获得焦点并移动光标到原%userinput%位置
                    textareaRef.current.resizableTextArea.textArea.focus();
                    textareaRef.current.resizableTextArea.textArea.setSelectionRange(position, position);
                }
            }, 0);
        }
    };

    //头像图标
    const aiIcon = <Avatar 
        icon={<RobotOutlined/>}
        style={{
                backgroundColor: '#c7ffaf',
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
                backgroundColor: '#e8d3ff',
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
            renderItem={(item, index) => (
            <div ref={messagesEndRef}>
                <List.Item 
                    className={item.sender === 1 ? 'user-message' : 'bot-message'}  
                    style={{padding: '20px 46px 20px 50px', wordBreak: 'break-all'}}>
                    <div style={{ width: '100%'}}>
                        <List.Item.Meta
                            // avatar={item.sender ? userIcon : aiIcon}
                            avatar = {AvatarList[item.sender]}
                            description={
                                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap'}}>
                                    {item.time === WaitingText && <LoadingOutlined style={{marginRight : '15px'}}/> }
                                    <div>{item.time}</div>
                                    {(item.sender === 0 && item.flag_qcmd) &&
                                        <Tag bordered={false} color="blue" style={{marginLeft:'15px'}}>🎓校园服务快捷命令</Tag>
                                        }
                                    {(item.sender === 0 && !item.flag_qcmd) &&
                                        <Tag bordered={false} style={{marginLeft:'15px'}}>{item.use_model}</Tag>
                                        }
                                    <div style={{ flex: '1' }}></div>
                                    <Button type="text"
                                        icon={<CopyOutlined />}
                                        onClick={() => handleCopy(item.content)}
                                    />
                                </div>
                            }
                            
                        />
                        <div style={{ width: '100%', marginTop: 10}}>
                            {item.sender === 0 && 
                                <>
                                    <MarkdownRenderer content={item.content}/>
                                    {item.sender === 0 && index === messages.length - 1 && !item.flag_qcmd &&
                                        <Space style={{marginTop: 10}} size="middle">
                                            {item.interrupted &&
                                                <Button icon={<DoubleRightOutlined />}
                                                    onClick={() => sendUserMessage('continue')}>继续生成</Button>
                                            }
                                            <Button icon={<ReloadOutlined />}
                                                onClick={() => sendUserMessage('%regenerate%')}>再次生成</Button>
                                        </Space>
                                    }
                                </>
                            }
                            {item.sender === 1 &&
                                <div style={{ whiteSpace: 'pre-wrap' }}>
                                    {ReactStringReplace(item.content, /(\s+)/g, (match, i) => (
                                    <span key={i}>
                                        {match.replace(/ /g, '\u00a0').replace(/\t/g, '\u00a0\u00a0\u00a0\u00a0')}
                                    </span>
                                    ))}
                                </div>
                            }
                            {item.sender === 2 && 
                            <Alert type="error" style={{fontSize:'16px'}} message={
                                <Space>
                                    {item.content}
                                    <Button icon={<ReloadOutlined />} onClick={handleRetry}
                                        >重试</Button>
                                </Space>}/>
                            }
                        </div>
                    </div>
                    <div/>
                </List.Item>
            </div>)}
        />
        
        <div className='sendbox-area' style={{ padding: '20px 50px', position: 'relative'}}>
                {/* <Button 
                    icon={<ArrowDownOutlined />} 
                    style={{ position: 'absolute', top: -40, right: 10, zIndex: 10 }}
                    onClick={scrollToBottom}
                /> */}
            <Dropdown placement="topLeft" overlay={
                    <div style={{display: curRightComponent === 1 ? '' : 'none', width: `${textareaWidth}px`}}>
                        <Menu style={{maxHeight: '320px', overflowY: 'auto' }}>
                            {qcmdOptions.map(option => (
                                <Menu.Item key={option.value} onClick={() => handleSelectQcmds(option.value, option.label)}>
                                        {option.label_render}
                                </Menu.Item>
                            ))}
                        </Menu>
                    </div>}
                open={showQcmdTips}
            >
                <div style={{ position: 'relative', width: '100%' }}>
                <TextArea ref={textareaRef}
                    rows={rows}
                    value={input}
                    onChange={handleUserInput}
                    //ctrl+enter发送
                    onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey){
                            e.preventDefault();
                            if (!isWaiting)
                                {handleSend();}
                        }
                    }}
                    placeholder="Shift+Enter 换行，Enter 发送，+ 触发自动补全，/ 触发校园服务快捷命令"
                    style={{resize: 'none', fontSize:'16px', width: '100%'}}
                /></div>
            </Dropdown>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <Segmented size="large" style={{border: '1px solid #d9d9d9'}} value={selectedModel}
                    onChange={value => setSelectedModel(value)}
                    options={[
                        {label:`${isFold||isFoldMobile ? '3.5':'GPT3.5'}`, value:'Azure GPT3.5', icon:<ThunderboltOutlined style={{color:'#73c9ca'}} />},
                        {label:`${isFold||isFoldMobile ? '4':'GPT4'}`, value:'OpenAI GPT4', icon:<StarOutlined style={{color:'#6d3eb8'}}/>}
                ]}/>
                <Space>
                    <Button size="large" onClick={() => {setInput(''); handleCalcRows('');}}>
                        清空
                    </Button>
                    <Button type="primary" size="large" onClick={handleSend} icon={<SendOutlined />}
                        loading={isWaiting}>
                        {isFold || isFoldMobile ? '':'发送'}
                    </Button>
                </Space>
            </div>
        </div>
    </div>
    );
}

export default ChatBox;