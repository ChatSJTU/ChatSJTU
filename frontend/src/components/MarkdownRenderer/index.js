//github风格markdown渲染组件封装
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex'
import remarkHtml from 'remark-html';
import rehypeRaw from 'rehype-raw'

import 'katex/dist/katex.min.css';
import 'github-markdown-css/github-markdown-light.css';

const MarkdownRenderer = ({content}) =>{

    const renderers = {
        // inlineMath: ({value}) => <InlineMath>{value}</InlineMath>,
        // math: ({value}) => <BlockMath>{value}</BlockMath>,
        // html: ({value}) => <div dangerouslySetInnerHTML={{ __html: value }} />
    }

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