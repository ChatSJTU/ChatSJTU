//主要组件，聊天列表和发送文本框

import React, { useState, useEffect, useRef, useContext } from 'react';
import { Input, Button, List, Avatar, message, Space, Tag, Dropdown, Menu, Typography, Segmented, Alert, Popover, Divider, Upload, Card, Spin } from 'antd';
import { UserOutlined, RobotOutlined, SendOutlined, CopyOutlined, InfoCircleOutlined, ReloadOutlined, LoadingOutlined, DoubleRightOutlined, EllipsisOutlined, AppstoreOutlined, PictureOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import ReactStringReplace from 'react-string-replace';
import copy from 'copy-to-clipboard';
import { useMediaQuery } from 'react-responsive'
import { useTranslation } from 'react-i18next';

import MarkdownRenderer from '../MarkdownRenderer';
import { request } from '../../services/request';
import { qcmdPromptsList } from '../../services/plugins';
import { uploadFile } from '../../services/upload';
import { SessionContext } from '../../contexts/SessionContext';
import { UserContext } from '../../contexts/UserContext';
import { Base64 } from 'js-base64';

import './index.scss'

const { TextArea } = Input;
const { Text } = Typography;

function ChatBox({ onChangeSessionInfo, onChangeComponent, curRightComponent}) {

    const {selectedSession, messages, setMessages} = useContext(SessionContext);
    const {modelInfo, pluginList, qcmdsList, selectedPlugins, settings} = useContext(UserContext);
    const [input, setInput] = useState('');
    const [rows, setRows] = useState(3);        //textarea行数
    const [textareaWidth, setTextareaWidth] = useState(0);
    const [selectedModel, setSelectedModel] = useState("GPT 3.5");  //选中模型
    const [isWaiting, setIsWaiting] = useState(false);      //是否正在加载
    const [retryMessage, setRetryMessage] = useState(null);
    const [qcmdOptions, setQcmdOptions] = useState([]);     //按输入筛选快捷命令
    const [showQcmdTips, setShowQcmdTips] = useState(false);//是否显示快捷命令提示
    const [isPopoverOpen, setIsPopoverOpen] = useState([false, false]);  //控制弹出菜单是否显示(0-模型与插件; 1-图片上传)
    const [uploadImgList, setUploadImgList] = useState([]);
    
    const isFold = useMediaQuery({ minWidth: 768.1, maxWidth: 960 })
    const isFoldMobile = useMediaQuery({ maxWidth: 432 })
    
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    const { t } = useTranslation('ChatBox');

    const timeOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };

    useEffect(() => {
        //发送消息自动滚动到底部
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end', });
        }
    }, [messages]);

    //增加字段说明结果编号（面向连续重新生成）
    // const calcRegenIndex = (data) => {
    //     console.log(data);
    //     let regenIndex = 0;
    //     for(let i=1; i<data.length; i++){
    //         if (data[i].sender !== 0) data[i].regenInfo = '';
    //         else if (data[i].regenerated || data[i-1].regenerated) {
    //             if (!data[i-1].regenerated) regenIndex = 0;
    //             regenIndex++;
    //             data[i].regenInfo = `回答 ${regenIndex}`;
    //         }
    //         else data[i].regenInfo = '';
    //         console.log(`${i}  ${data[i].regenInfo}`)
    //     }
    //     return data;
    // }

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
                    message.error(t('ChatBox_FetchMessageError') + `: ${error.response.data.error}`, 2);
                } else {
                    message.error(t('ChatBox_FetchMessageError'), 2);
                }
            });
        }
      }, [selectedSession]);

    useEffect(() => {   
        function handleResize() {
          if (textareaRef.current) {
            setTextareaWidth(textareaRef.current.resizableTextArea.textArea.offsetWidth);
          }
        }
        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const checkModelInfoLoaded = () => {
        if (modelInfo && modelInfo[selectedModel]) {
          return (
            modelInfo[selectedModel].hasOwnProperty('label') &&
            modelInfo[selectedModel].hasOwnProperty('icon') &&
            modelInfo[selectedModel].hasOwnProperty('plugin_support') &&
            modelInfo[selectedModel].hasOwnProperty('image_support')
          );
        }
        return false;
      };

    //回到List底部
    // const scrollToBottom = () => {
    //     if (messagesEndRef.current) {
    //         messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end', });
    //     }
    // };

    const WaitingText = '回复生成中（若结果较长或遇用量高峰期，请耐心等待~）';
    const ErrorText = '回复生成失败'
    const ContinuePrompt = 'continue'
    const RegeneratePrompt = '%regenerate%'

    // 用户发送消息(可选参数content，若有则发送之，若无则发送全局state input)
    // content可能是重试或快捷指令，要求格式 {text, image_urls(可选)}
    const sendUserMessage = async (content) => {
        setIsWaiting(true);
        setShowQcmdTips(false);
        const userMessage = content?.text || input;
        let imageUrls = [];
        try {
            const messageData = { 
                message: Base64.encode(userMessage),
                model: selectedModel,
                plugins: selectedPlugins,
            };  // 存储请求数据到变量
            setInput('');
            handleCalcRows('');

            // 若模型支持，append图片url列表  
            if (modelInfo[selectedModel].image_support) {
                if (content) {      
                    if (content?.image_urls && content?.image_urls.length !== 0)
                    imageUrls = content.image_urls;
                } else {
                    let notQcmd = qcmdsList.every(item => item.command !== userMessage) // 检查是否使用快捷指令
                    if (notQcmd && uploadImgList.length!==0) {
                        imageUrls = uploadImgList.filter(item => item && item.url)
                                                .map(item => item.url);
                        setUploadImgList([]);
                    }
                }
            }
            messageData.image_urls = imageUrls;

            // 先显示用户发送消息，时间为sending
            setMessages((prevMessages) => [
                ...prevMessages.filter((message) => message.time !== ErrorText && message.sender !== 2),
                {
                    sender: 1,
                    content: userMessage,
                    time: WaitingText,
                    image_urls: imageUrls
                },
            ]);

            //记录以防止请求时切换的同步性问题
            const reqSession = selectedSession
            // 发送消息到后端处理
            const response = await request.post(`/api/send-message/${selectedSession.id}/`, messageData);
            // 在前端显示用户发送的消息和服务端返回的消息
            const sendTime = new Date(response.data.send_timestamp);
            const responseTime = new Date(response.data.response_timestamp);
            // 避免可能的时间先后错误，统一接收后端时间并显示
            if (reqSession.id === selectedSession.id) {
                setMessages((prevMessages) => [
                    ...prevMessages.filter((message) => message.time !== WaitingText),
                    {
                        sender: 1,
                        content: userMessage,
                        time: sendTime.toLocaleString('default', timeOptions),
                        image_urls: imageUrls
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
            }

            //可能的会话名更改
            // if (response.data.session_rename !== ''){
            //     onChangeSessionInfo( reqSession.id, {
            //         'name': response.data.session_rename
            //     });
            // }
            const rename = response.data.session_rename
            onChangeSessionInfo( reqSession.id, {
                'name': rename !== '' ? rename : reqSession.name,
                'rounds': reqSession.rounds + 1,
                'updated_time': responseTime.toLocaleString('default', timeOptions),
            });

        } catch (error) {
            console.error('Failed to send message:', error);
            if (error.response.data && error.response.status === 404) {
                message.error(t('ChatBox_ReplyError') + `: ${error.response.data.error}`, 2);
            } else if (error.response.data.error) {
                showWarning(error.response.data.error);
                setRetryMessage({text: userMessage, image_urls: imageUrls});
            } else {
                message.error(t('ChatBox_ReplyError'), 2);
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
            message.error(t('ChatBox_RetryError'), 2);
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
                time: t('ChatBox_PreservedMessage')
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
            message.error(t('ChatBox_SendError'), 2);
        }
      };

    //复制
    const handleCopy = (content) => {
        copy(content);
        message.success(t('ChatBox_CopySuccess'), 2);
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
            sendUserMessage({text: value});
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

    // 控制popover显示
    const setPopoverOpen = (index, value) => {
        setIsPopoverOpen(prevState => {
            const newState = [...prevState];
            newState[index] = value;
            return newState;
        });
    };

    //头像图标
    const aiIcon = <Avatar 
        className='ai-icon'
        icon={<RobotOutlined/>} />
    const userIcon = <Avatar 
        className='user-icon'
        icon={<UserOutlined/>} />
    const NoticeIcon = <Avatar
        className='notice-icon'
        icon={<InfoCircleOutlined />} />

    const AvatarList = [aiIcon, userIcon, NoticeIcon]

    // const modelInfo = {
    //     "Azure GPT3.5": {
    //         label: 'GPT 3.5', 
    //         icon: <ThunderboltOutlined style={{color:'#73c9ca'}} />,
    //         plugin_support: true,
    //         image_support: false
    //     },
    //     "OpenAI GPT4": {
    //         label: 'GPT 4', 
    //         icon: <StarOutlined style={{color:'#9b5ffc'}}/>,
    //         plugin_support: true,
    //         image_support: true
    //     },
    //     "LLAMA 2": {
    //         label: '教我算', 
    //         icon: <FireOutlined style={{color:'#f5c004'}}/>,
    //         plugin_support: false,
    //         image_support: false
    //     }
    // }
    
    // sender标识：AI-0，用户-1，错误提示信息-2（仅留在前端）

    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' ,minHeight: '100%',maxHeight: '100%'}}>
        <List
            id='chat-history-list'
            style={{ flex: 1, overflow: 'auto'}}
            dataSource={messages}
            renderItem={(item, index) => (
            <div ref={messagesEndRef}>
                { !(item.sender === 1 && (item.regenerated || item.interrupted)) &&
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
                                    {item.time === WaitingText ?
                                        <div>{t('ChatBox_WaitingText')}</div> :
                                            item.time === ErrorText ? <div>{t('ChatBox_ErrorText')}</div> : <div>{item.time}</div>
                                    }
                                    {(item.sender === 0 && item.flag_qcmd) &&
                                        <Tag bordered={false} color="blue" style={{marginLeft:'15px'}}>{t('ChatBox_Tag_CampusCommand')}</Tag>
                                        }
                                    {(item.sender === 0 && !item.flag_qcmd) &&
                                        <Tag bordered={false} style={{marginLeft:'15px'}}>{item.use_model}</Tag>
                                        }
                                    {(item.sender === 0 && !item.flag_qcmd && item.plugin_group!=='') &&
                                        <Popover placement="topLeft" arrow={false} 
                                            content={
                                                <Space direction='vertical'>
                                                    {t('ChatBox_Popover_Title')}
                                                    {pluginList.map(plugin => (
                                                        item.plugin_group === plugin.id && 
                                                        <Space>
                                                            <Avatar shape="square" size={24} src={plugin.icon}/>
                                                            {plugin.name}
                                                        </Space>
                                                    ))}
                                                </Space>
                                            }>
                                            {pluginList.map(plugin => item.plugin_group === plugin.id && 
                                                <Avatar shape="square" size={20} src={plugin.icon} style={{marginTop: '-2px'}}/>
                                            )}
                                        </Popover>
                                        }
                                    {(item.sender === 0 && !item.flag_qcmd && item.generation !== 0) &&
                                        <div style={{marginLeft:'7px'}}>{t('ChatBox_Tag_Reply')} {`${item.generation}`}</div> }
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
                                    {settings?.render_markdown 
                                        ? <MarkdownRenderer content={item.content}/>
                                        : ReactStringReplace(item.content, /(\s+)/g, (match, i) => (
                                            <span key={i} style={{ whiteSpace: 'pre-wrap' }}>
                                                {match.replace(/ /g, '\u00a0').replace(/\t/g, '\u00a0\u00a0\u00a0\u00a0')}
                                            </span>
                                        ))
                                    }
                                    {item.sender === 0 && index === messages.length - 1 && !item.flag_qcmd &&
                                        <Space size="middle" style={{marginTop:'10px'}}>
                                            {item.interrupted &&
                                                <Button icon={<DoubleRightOutlined />}
                                                    onClick={() => sendUserMessage({text:ContinuePrompt})}>{t('ChatBox_Continue_Btn')}</Button>
                                            }
                                            <Button icon={<ReloadOutlined />}
                                                onClick={() => sendUserMessage({text:RegeneratePrompt})}>{t('ChatBox_Regenerate_Btn')}</Button>
                                        </Space>
                                    }
                                </>
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
                                                    <div className="card-preview-img-wrapper">
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
                                    {item.content === ContinuePrompt && 
                                        <span style={{color:'#0086D1'}}>
                                            <DoubleRightOutlined style={{marginRight:'10px'}}/>
                                            {t('ChatBox_Continue_Prompt')}
                                        </span>
                                    }
                                    {item.content === RegeneratePrompt && 
                                        <span style={{color:'#0086D1'}}>
                                            <ReloadOutlined style={{marginRight:'10px'}}/>
                                            {t('ChatBox_Regenerate_Prompt')}
                                        </span>
                                    }
                                    {item.content !== RegeneratePrompt && item.content !== ContinuePrompt &&
                                        ReactStringReplace(item.content, /(\s+)/g, (match, i) => (
                                            <span key={i}>
                                                {match.replace(/ /g, '\u00a0').replace(/\t/g, '\u00a0\u00a0\u00a0\u00a0')}
                                            </span>
                                        ))
                                    }
                                </div>
                            }
                            {item.sender === 2 && 
                            <Alert type="error" style={{fontSize:'16px'}} message={
                                <Space>
                                    {item.content}
                                    <Button icon={<ReloadOutlined />} onClick={handleRetry}
                                        >{t('ChatBox_Retry_Btn')}</Button>
                                </Space>}/>
                            }
                        </div>
                    </div>
                </List.Item>
                }
            </div>)}
        />
        
        <div className='sendbox-area' style={{ padding: '20px 50px', position: 'relative'}}>
                {/* <Button 
                    icon={<ArrowDownOutlined />} 
                    style={{ position: 'absolute', top: -40, right: 10, zIndex: 10 }}
                    onClick={scrollToBottom}
                /> */}
            <Dropdown placement="topLeft" overlay={
                    <div style={{display: curRightComponent === 1 && isPopoverOpen.every(value => value === false) ? '' : 'none', width: `${textareaWidth}px`}}>
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
                <TextArea className='text-area' ref={textareaRef}
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
                    placeholder={t('ChatBox_Placeholder')}
                    style={{resize: 'none', fontSize:'16px', width: '100%'}}
                /></div>
            </Dropdown>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <Space>
                    {checkModelInfoLoaded() 
                    ? <>
                        <Popover className='popup' trigger="click" placement="topLeft" arrow={false} open={isPopoverOpen[0]}
                            onOpenChange={(newOpen) => setPopoverOpen(0, newOpen)}
                            content={
                                <> 
                                <Space direction='vertical'>
                                    <div className='card_label'>{t('ChatBox_CardLabel_1')}</div>
                                    <Segmented value={selectedModel}
                                        onChange={value => setSelectedModel(value)}
                                        options={modelInfo && Object.keys(modelInfo).map(key => ({
                                            value: key,
                                            label: modelInfo[key].label,
                                            icon: modelInfo[key].icon,
                                        }))
                                        }/>
                                    <div className='card_label'>{t('ChatBox_CardLabel_2')}</div>
                                    {modelInfo[selectedModel]?.plugin_support
                                        ? <>
                                            {selectedPlugins.length <= 0 
                                                ? t('ChatBox_PluginList_NoActivated')
                                                : <Space direction='vertical'>
                                                    {t('ChatBox_PluginList_Title')}
                                                    {pluginList.map(item => (
                                                        selectedPlugins.includes(item.id) && 
                                                        <Space>
                                                            <Avatar shape="square" size={24} src={item.icon}/>
                                                            {item.name}
                                                        </Space>
                                                    ))}
                                                </Space>
                                            }
                                            <Button block type="link" size="small" style={{ textAlign:'left', paddingLeft:'0px'}} icon={<AppstoreOutlined size={24}/>} 
                                                onClick={() => {onChangeComponent(5); setPopoverOpen(0, false)}}>
                                                {t('ChatBox_PluginStore_Btn')}
                                            </Button>
                                        </>
                                        : t('ChatBox_Plugin_NotSupported')
                                    }
                                </Space>
                                </>
                            }>
                            <Button size="large" style={{ display: 'flex', alignItems: 'center' }}>
                                {modelInfo[selectedModel].icon}
                                {modelInfo[selectedModel].label}
                                {modelInfo[selectedModel].plugin_support && selectedPlugins.length > 0 && 
                                    <>
                                        <Divider type='vertical'/>
                                        {pluginList.map(item => (
                                            selectedPlugins.includes(item.id) && 
                                            <Avatar shape="square" size={20} src={item.icon} style={{marginRight: '3px', marginTop: '-2px'}}/>
                                        ))}
                                    </>
                                }
                                <EllipsisOutlined style={{marginLeft: '7px'}}/>
                            </Button>
                        </Popover>
                        <Popover className="popup" trigger="click" placement="topLeft" arrow={false} open={isPopoverOpen[1]} 
                            onOpenChange={(newOpen) => setPopoverOpen(1, newOpen)}
                            content={
                                <Space direction="vertical">
                                    <Upload
                                        className="img-upload-list"
                                        customRequest={uploadFile}
                                        listType="picture-card"
                                        fileList={uploadImgList}
                                        onChange={({fileList: newFileList}) => {setUploadImgList(newFileList)}}
                                    >
                                        {uploadImgList.length >= 3 ? null
                                            : <Space><PlusOutlined />{t('ChatBox_UploadPicture')}</Space>} 
                                    </Upload>
                                </Space>
                            }>
                            <Button 
                                size="large" 
                                icon={<PictureOutlined />}
                                className={`btn-upload-image${uploadImgList.some(item => item && item.url) && !uploadImgList.some(item => item.status === "error") ? '-uploaded' : ''} left-${modelInfo[selectedModel].image_support ? 'fadeIn' : 'fadeOut'}`}
                                style={{
                                    opacity: modelInfo[selectedModel].image_support ? 1 : 0,
                                    visibility: modelInfo[selectedModel].image_support ? 'visible' : 'hidden'
                                }}
                                danger={uploadImgList.some(item => item.status === "error")}
                            >
                                {uploadImgList.filter(item => item && item.url).length !== 0 ? `${uploadImgList.filter(item => item && item.url).length}` : ''}
                            </Button>
                        </Popover></> 
                    : <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                    }
                </Space>
                <Space>
                    <Button className="btn-clear" size="large" onClick={() => {setInput(''); handleCalcRows('');}}>
                        {t('ChatBox_ClearInput_Btn')}
                    </Button>
                    <Button type="primary" size="large" onClick={handleSend} icon={<SendOutlined />}
                        loading={isWaiting}>
                        {isFold || isFoldMobile ? '':t('ChatBox_SendInput_Btn')}
                    </Button>
                </Space>
            </div>
        </div>
    </div>
    );
}

export default ChatBox;
