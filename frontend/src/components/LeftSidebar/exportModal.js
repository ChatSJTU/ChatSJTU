import React from "react";
import { Typography, Button, Space } from 'antd';
import { PictureOutlined } from '@ant-design/icons';
import { toPng } from 'html-to-image';
import download from 'downloadjs';

function ExportModalContent ({closeModal} ) {

    const { Title, Text } = Typography;

    const timeOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };

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

        const now = new Date();
        const fileName = `ChatHistory_${now.toLocaleString('default', timeOptions)}.png`;
    
        toPng(container)
            .then(function (dataUrl) {
                document.body.removeChild(container); //销毁
                download(dataUrl, fileName);
            });

        closeModal();
    };

    return (
        <Typography>
                <Space style={{marginTop:'5px'}}>
                    <Button 
                        icon={<PictureOutlined />} 
                        onClick={ChatToPic}
                        >
                        导出为图片
                    </Button>
                </Space>
            <Title level={5}>分享</Title>
                <Text>链接分享暂未上线</Text>
        </Typography>
    )
}

export default ExportModalContent;