//github风格markdown渲染组件封装
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex'
import remarkHtml from 'remark-html';
import rehypeRaw from 'rehype-raw'
import copy from 'copy-to-clipboard';
import { Button, message, Popconfirm, Space } from 'antd';
import { CopyOutlined, CodeOutlined } from '@ant-design/icons';
import DOMPurify from 'dompurify'

import 'katex/dist/katex.min.css';
import 'github-markdown-css/github-markdown-light.css';

//复制
const handleCopy = (content) => {
    copy(content);
    message.success('代码已复制到剪贴板', 2);
};

//运行HTML
const handleRun = (code) => {
    const sanitizedCode = DOMPurify.sanitize(code, {ALLOWED_TAGS: []}); 
    
    let blob = new Blob([`"use strict";\n${sanitizedCode}`], {type: 'text/javascript'});
    let url = URL.createObjectURL(blob);

    const newWindow = window.open();
    newWindow.document.write('<scr' + 'ipt src="' + url + '"><\/scr' + 'ipt>');
}
      
const CodeBlock = {

    code({node, inline, className, children, ...props}) {
    const match = /language-(\w+)/.exec(className || '')
        return !inline && match
        ? <div style={{position: 'relative'}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {<div style={{ fontSize: '14px', color: '#ccc', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {match[1]}
                </div>}
                <Space>
                    { match[1] === 'html' &&
                        <Popconfirm
                            title="确认"
                            description="此操作会唤起新页面运行，请自行确保HTML代码的安全性"
                            onConfirm={() => handleRun(children[0])}
                            okText="确定" okButtonProps={{ size: 'middle' }}
                            cancelText="取消" cancelButtonProps={{ size: 'middle' }}
                        >
                            <Button style={{ color: '#aaa' }} size='small' type='text' icon={<CodeOutlined />}>
                                运行
                            </Button>
                        </Popconfirm>
                    }
                    <Button
                        style={{ color: '#aaa' }} size='small' type='text' icon={<CopyOutlined/>}
                        onClick={() => handleCopy(children[0])}>
                        复制
                    </Button>
                </Space>
            </div>
            <pre className={className} style={{fontSize:'14px', margin:'0px', padding:'5px 0px'}}>
                {children[0]}
            </pre>
        </div>
        : <code className={className} {...props}>
            {children}
        </code>
    }
};

const MarkdownRenderer = ({content}) =>{

    const renderers = {
        ...CodeBlock,
    };

    return(
        <ReactMarkdown
            className='markdown-body'
            children={content}
            remarkPlugins={[remarkGfm, remarkMath, remarkHtml]}
            rehypePlugins={[rehypeKatex, rehypeRaw]}
            components={renderers}
            style={{ wordWrap: 'break-word', overflowWrap: 'break-word'}}
            skipHtml={false}
        />
    )
}

export default MarkdownRenderer;