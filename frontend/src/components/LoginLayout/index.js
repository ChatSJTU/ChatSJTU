import React from 'react';
import {Layout, Typography, Tag, Button} from 'antd';

import background from '../../assets/main-gradient.png';
import background_webm from '../../assets/new-main-gradient.webm'
import img_example from '../../assets/main-example.png'

const { Footer } = Layout;
const { Title, Paragraph } = Typography;

function LoginLayout ({ handleLogin }) {

    return (
        <Layout style={{ height: '100vh', background: '#FFF', position : 'relative'}}>
            <div style={{background: '#FFF', position : 'relative'}}>
                <div style={{ display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center', 
                            marginTop : '4vh',
                            zIndex : '2', overflow:'hidden',
                            position: 'relative'}}>
                    <video style={{ clipPath: 'inset(2px 2px)',
                                objectFit: 'contain',
                                overflowClipMargin: 'content-box',
                                overflow: 'clip',
                                opacity: '50%'
                             }} 
                       data-v-9a6be86a="" autoPlay="autoPlay" muted="muted" loop="loop" poster={background} data-fullscreen-container="true">
                        <source data-v-9a6be86a="" src={background_webm} type="video/webm" />
                    </video>
                </div>
                <div style={{ display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center', 
                            marginTop : '14vh',
                            zIndex : '3',
                            position : 'absolute',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            top: 0, left: 0}}>
                    <Typography style={{margin:'0px 25px', display: 'flex', 
                            flexDirection: 'column',
                            justifyContent: 'center', 
                            alignItems: 'center'}}>
                        <Title style={{ fontSize:'48px', 
                                        marginTop: 10, 
                                        marginBottom : 0, 
                                        color : '#4287e1', 
                                        display : 'flex', textAlign: 'center',
                                       alignItems: 'start'}} className='chat-sjtu-title'>
                            Chat SJTU
                            <Tag style={{ fontWeight:'normal',marginLeft: '6px'}} color="#4287e1">
                                内测版
                            </Tag>
                        </Title>
                        <Paragraph style={{ fontSize:'28px', marginTop: 0, marginBottom : 0 }}>交大人的 AI 助手</Paragraph>
                        <Paragraph style={{ fontSize:'20px', marginTop: 14, textAlign : 'center'}}>由生成式人工智能技术驱动，为交大师生科研学习赋能</Paragraph>
                    </Typography>
                    <Button style={{ marginTop: 20}} type="primary" size="large" onClick={handleLogin}>使用 jAccount 登录</Button>
                    <div
                        style={{
                        position: 'absolute',
                        bottom: 0,
                        width: '100%',
                        textAlign: 'center',
                    }}>
                    </div>
                </div>
                <div style={{ display: 'flex', 
                            flexDirection: 'row',
                            justifyContent: 'center',
                            marginTop: '-85px',
                            alignItems: 'center', 
                            zIndex : '4',
                            position: 'relative'}}>
                    <img style={{ width:'80vw' }} src={img_example} ></img>
                </div>
            </div>
            <Footer style={{background: '#FFF', padding : '0'}}>
                <div
                    style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    textAlign: 'center',
                    }}>
                    <p style={{fontSize: '12px', color: '#aaaaaa', letterSpacing: '0.3px'}}>版权所有 © 2023 上海交通大学网络信息中心 沪交ICP备20230139<br/>技术支持：ChatSJTU 学生开发团队 <a href="mailto:gpt@sjtu.edu.cn" title="gpt@sjtu.edu.cn">联系我们</a></p>
                </div>
            </Footer>
        </Layout>
    )
}

export default LoginLayout;