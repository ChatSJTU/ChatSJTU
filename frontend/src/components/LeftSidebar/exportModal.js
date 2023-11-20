import React, { useContext, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Typography, Button, Space, Segmented, message, QRCode } from 'antd';
import { PictureOutlined, FileMarkdownOutlined, SettingOutlined, LinkOutlined, CheckOutlined, CopyOutlined, QrcodeOutlined, ReloadOutlined } from '@ant-design/icons';
import copy from 'copy-to-clipboard';
import { toPng } from 'html-to-image';
import download from 'downloadjs';

import { request } from "../../services/request";
import { UserContext } from '../../contexts/UserContext';
import { SessionContext } from '../../contexts/SessionContext';
import './index.scss'

const { Title, Text } = Typography;

function ExportModalContent ( {closeModal} ) {
 
    const { messages, selectedSession } = useContext(SessionContext);
    const { userProfile } = useContext(UserContext);
    const [ isLinkGenerated, setIsLinkGenerated ] = useState(false);
    const [ shareLink, setShareLink ] = useState(null);
    const [ shareDeadline, setShareDeadline ] = useState(7);
    const [ isLoading, setIsLoading ] = useState(false);
    const [ isQrcodeShown, setIsQrcodeShown ] = useState(false);
    
    const timeOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };
    let roleDesc = ['ChatSJTU', userProfile.username, ''];
    let { t } = useTranslation('exportModal')

    //导出会话为图片
    const ChatToPic = () => {
        const container = document.createElement('div');    //创建容器并放入list
        container.style.width = '720px';
        const listClone = document.getElementById('chat-history-list').cloneNode(true);
        listClone.style.overflow = 'visible';

        const codeBlocks = listClone.querySelectorAll('#codeblock-content');
        console.log(codeBlocks)
        codeBlocks.forEach((codeBlock) => {
            codeBlock.style.whiteSpace = 'pre-wrap'; // 设置pre元素自动换行（代码块）
        });

        container.appendChild(listClone);
        document.body.appendChild(container);

        const now = new Date().toLocaleString('default', timeOptions);
        const fileName = `ChatHistory_${now}.png`;
        toPng(container)
            .then(function (dataUrl) {
                document.body.removeChild(container); //销毁
                download(dataUrl, fileName);
            });
        closeModal();
    };

    const ChatToMdFile = () => {
        const now = new Date().toLocaleString('default', timeOptions);
        let inputStr = `> ${t('exportModal_Msg_Head')} ${now} ${t('exportModal_Msg_Body')} ChatSJTU\n\n`
        inputStr += messages.map(message => {
            return message.sender === 2 ?
                `**${message.time}**\n\n${message.content}` : //系统提示消息，time字段即为“系统提示”
                `**${roleDesc[message.sender]}**  ${message.time}\n\n${message.image_urls.map(item => `![](${item})`).join('\n')}\n${message.content}`;

        }).join('\n\n---\n\n');
        
        const fileName = `ChatHistory_${now}.md`;
        download(inputStr, fileName, "text/plain");
        closeModal();
    }

    const handleCopy = (content) => {
        copy(content);
        message.success(t('exportModal_copyLinkSuccess'), 2);
    };

    const GenerateShareLink = async () => {
        setTimeout(() => {setIsLoading(true);}, 0);
        try {
            // setShareLink('https://chat.sjtu.edu.cn/?placeholder_for_share_link&autologin=True');
            const deadlineTime = new Date();
            deadlineTime.setDate(deadlineTime.getDate() + shareDeadline);
            const params ={
                deadline: deadlineTime.toISOString(),
            };
            console.log(params);
            const response = await request.post(`/api/sessions/share/${selectedSession.id}/`, params);
            setShareLink(document.baseURI + response.data.url);
            setIsLinkGenerated(true);
        } catch (error) {
            console.error('Failed to generate share link:', error);
            message.error(t('exportModal_generateShareLinkError'), 2);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Typography>
                <Space style={{marginTop:'5px'}}>
                    <Button 
                        icon={<PictureOutlined />} 
                        onClick={ChatToPic}
                        >
                        {t('exportModal_ExportOpt1')}
                    </Button>
                    <Button 
                        icon={<FileMarkdownOutlined />} 
                        onClick={ChatToMdFile}
                        >
                        {t('exportModal_ExportOpt2')}
                    </Button>
                </Space>
            <Title level={5}>{t('exportModal_Title2')}</Title>
                <Space direction="vertical" style={{marginTop:'5px'}}>
                    <Text>{t('exportModal_Share_Subtitle')}</Text>
                    <Space size="middle" style={{flexWrap: 'wrap'}}>
                        <Text>{t('exportModal_Share_ValidDateText')}</Text>
                        <Segmented 
                            style={{marginLeft: t('exportModal_Share_ValidDateSegment_marginLeft')}} 
                            options={[{value:1, label:t('exportModal_Share_ValidDateLabel_1')}, {value:7, label:t('exportModal_Share_ValidDateLabel_2')}, {value:30, label:t('exportModal_Share_ValidDateLabel_3')}]} 
                            value={shareDeadline}
                            onChange={value => setShareDeadline(value)}
                            disabled={isLinkGenerated || isLoading}/>
                        {isLinkGenerated 
                            ? <Space style={{color:'#389e0d'}}>
                                <CheckOutlined />
                                {t('exportModal_generateShareLinkSuccess')}
                                <Button 
                                icon={<ReloadOutlined />} 
                                onClick={GenerateShareLink}
                                loading={isLoading}
                                >
                                {t('exportModal_Share_Btn_2')}
                                </Button>
                              </Space>
                            : <Button 
                                icon={<LinkOutlined />} 
                                onClick={GenerateShareLink}
                                loading={isLoading}
                                >
                                {t('exportModal_Share_Btn_1')}
                            </Button>
                        }
                    </Space>
                    {isLinkGenerated && 
                        <Space>
                            <blockquote>{shareLink}</blockquote>
                            <Button type="text"
                                icon={<CopyOutlined />}
                                onClick={() => handleCopy(shareLink)}
                            />
                            <Button type="text"
                                icon={<QrcodeOutlined className={`export-modal-qrcode${isQrcodeShown ? '-clicked' : ''}`}/>}
                                onClick={() => setIsQrcodeShown(!isQrcodeShown)}
                            />
                        </Space>
                    }
                    {isLinkGenerated && isQrcodeShown &&
                        <QRCode value={shareLink} />
                    }
                    <div>
                        <Text>{t('exportModal_Share_DescriptionText')}</Text>
                        <Button type="link" style={{marginLeft:'-10px'}} icon={<SettingOutlined />} disabled>{t('exportModal_ManageShare_Btn')}</Button>
                    </div>
                </Space>
        </Typography>
    )
}

export default ExportModalContent;
