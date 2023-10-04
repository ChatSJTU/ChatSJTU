//github风格markdown渲染组件封装
import React, {useContext} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex'
import remarkHtml from 'remark-html';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import copy from 'copy-to-clipboard';
import { Button, message, Popconfirm, Space } from 'antd';
import { CopyOutlined, CodeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from "../../contexts/ThemeContext";

import Prism from "prismjs";
import "./prism.scss";
import "./prismlang";

import 'katex/dist/katex.min.css';
import './github-markdown-light.css';
import './github-markdown-dark.css';

const MarkdownRenderer = ({content}) =>{

    const userTheme = useContext(ThemeContext);
    const { t } = useTranslation('MarkdownRenderer');

    const CodeBlock = {
        code({node, inline, className, children, ...props}) {
        //复制
        const handleCopy = (content) => {
            copy(content);
            message.success(t('MarkdownRenderer_CopySuccess'), 2);
        };
    
        //运行HTML
        const handleRun = (code) => {
            const newWindow = window.open();
            newWindow.document.write(code);
        }
        
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
                                title={t('MarkdownRenderer_Popconfirm_Title')}
                                description={t('MarkdownRenderer_Popconfirm_Description')}
                                onConfirm={() => handleRun(children[0])}
                                okText={t('MarkdownRenderer_Popconfirm_btnOK')} okButtonProps={{ size: 'middle' }}
                                cancelText={t('MarkdownRenderer_Popconfirm_btnCancel')} cancelButtonProps={{ size: 'middle' }}
                            >
                                <Button style={{ color: '#aaa' }} size='small' type='text' icon={<CodeOutlined />}>
                                    {t('MarkdownRenderer_Run_Btn')}
                                </Button>
                            </Popconfirm>
                        }
                        <Button
                            style={{ color: '#aaa' }} size='small' type='text' icon={<CopyOutlined/>}
                            onClick={() => handleCopy(children[0])}>
                            {t('MarkdownRenderer_Copy_Btn')}
                        </Button>
                    </Space>
                </div>
                <pre className={className} style={{fontSize:'14px', margin:'0px', padding:'5px 0px'}}>
                    {Prism.languages[match[1]] ? <code id='codeblock-content' dangerouslySetInnerHTML={{
                        __html: Prism.highlight(children[0], Prism.languages[match[1]], match[1])
                        }}></code>
                        : <code id='codeblock-content'>{children[0]}</code>}
                </pre>
            </div>
            : <code id='codeblock-content' className={className} {...props}>
                {children}
            </code>
        }
    };

    // Prism.languages.loadLanguage(['python'])

    const renderers = {
        ...CodeBlock,
    };

    return(
        <ReactMarkdown
        className={'markdown-body-' + (userTheme === 'dark' ? 'dark' : 'light')}
            children={content}
            remarkPlugins={[remarkGfm, remarkMath, remarkHtml]}
            rehypePlugins={[rehypeKatex, rehypeRaw, rehypeSanitize]}
            components={renderers}
            style={{ wordWrap: 'break-word', overflowWrap: 'break-word'}}
            skipHtml={false}
            linkTarget="_blank"
        />
    )
}

export default MarkdownRenderer;