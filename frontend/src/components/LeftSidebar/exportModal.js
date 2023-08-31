import React, { useContext } from "react";
import { Typography, Button, Space } from 'antd';
import { PictureOutlined, FileMarkdownOutlined } from '@ant-design/icons';
import { toPng } from 'html-to-image';
import download from 'downloadjs';

import { UserContext } from '../../contexts/UserContext';
import { SessionContext } from '../../contexts/SessionContext';

const { Title, Text } = Typography;

function ExportModalContent ({closeModal} ) {
 
    const { messages } = useContext(SessionContext);
    const { userProfile } = useContext(UserContext);

    const timeOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };
    let roleDesc = ['ChatSJTU', userProfile.username, ''];

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
        let inputStr = `> 以下会话内容于 ${now} 导出自 ChatSJTU\n\n`
        inputStr += messages.map(message => {
            return message.sender === 2 ?
                `**${message.time}**\n\n${message.content}` : //系统提示消息，time字段即为“系统提示”
                `**${roleDesc[message.sender]}**  ${message.time}\n\n${message.content}`;
        }).join('\n\n---\n\n');
        

        const fileName = `ChatHistory_${now}.md`;
        download(inputStr, fileName, "text/plain");
        closeModal();
    }

    return (
        <Typography>
                <Space style={{marginTop:'5px'}}>
                    <Button 
                        icon={<PictureOutlined />} 
                        onClick={ChatToPic}
                        >
                        导出为图片
                    </Button>
                    <Button 
                        icon={<FileMarkdownOutlined />} 
                        onClick={ChatToMdFile}
                        >
                        导出为Markdown
                    </Button>
                </Space>
            <Title level={5}>分享</Title>
                <Text>链接分享暂未上线</Text>
        </Typography>
    )
}

export default ExportModalContent;