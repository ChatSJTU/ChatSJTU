import React from 'react';
import { Layout, Typography, Tag, Button, Dropdown, Space, Select} from 'antd';
import { useTranslation } from 'react-i18next';

import background from '../../assets/main-gradient.png';
import background_webm from '../../assets/new-main-gradient.webm'
import img_example from '../../assets/main-example.png'
import { GlobalOutlined } from '@ant-design/icons';

const { Footer } = Layout;
const { Title, Paragraph } = Typography;

// const items = [
//     {
//         key: 'zh-CN',
//         label: (
//             <center>中文/zh-CN</center>
//         ),
//     },
//     {
//         key: 'en-US',
//         label: (
//             <center>
//                 English/en-US
//             </center>
//         ),
//     },
// ];


function LoginLayout({ handleLogin, changeLanguage }) {
    const LoadLanguage = () => {
        const { i18n } = useTranslation();
        if (i18n.language === 'zh') {
            return 'zh-CN';
        }
        else if (i18n.language === 'en') {
            return 'en-US';
        }
    }


    let { t } = useTranslation();

    return (
        <Layout style={{ height: '100vh', background: '#FFF', position: 'relative' }}>
            <div
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    zIndex: '5',
                }}
            >
                {/* <Dropdown
                    menu={{
                        items: items,
                        onClick: ({ key }) => changeLanguage(key),
                    }}
                    // placement="bottomLeft"
                    style={{
                        position: 'absolute',
                    }}
                >
                    <Button size="large"
                        type='text'
                    >
                        <GlobalOutlined />
                        {t('LoginLayout_ButtonText_ChangeLanguage')}
                    </Button>
                </Dropdown> */}
                <Select
                    defaultValue={LoadLanguage()}
                    style={{
                        width: 120,
                    }}
                    bordered={false}
                    onChange={changeLanguage}
                    options={[
                        {
                            value: 'zh-CN', 
                            label: <><GlobalOutlined /> &nbsp;&nbsp;中文</>,
                        },
                        {
                            value: 'en-US',
                            label: <><GlobalOutlined /> &nbsp;&nbsp;English</>,
                        },
                    ]}
                />
            </div>

            <div style={{ background: '#FFF', position: 'relative' }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: '4vh',
                    zIndex: '2', overflow: 'hidden',
                    position: 'relative'
                }}>
                    <video style={{
                        clipPath: 'inset(2px 2px)',
                        objectFit: 'contain',
                        overflowClipMargin: 'content-box',
                        overflow: 'clip',
                        opacity: '50%'
                    }}
                        data-v-9a6be86a="" autoPlay="autoPlay" muted="muted" loop="loop" poster={background} data-fullscreen-container="true">
                        <source data-v-9a6be86a="" src={background_webm} type="video/webm" />
                    </video>
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: '14vh',
                    zIndex: '3',
                    position: 'absolute',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    top: 0, left: 0
                }}>
                    <Typography style={{
                        margin: '0px 25px', display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Title style={{
                            fontSize: '48px',
                            marginTop: 10,
                            marginBottom: 0,
                            color: '#4287e1',
                            display: 'flex', textAlign: 'center',
                            alignItems: 'start'
                        }} className='chat-sjtu-title'>
                            {t('LoginLayout_Title')}
                            <Tag style={{ fontWeight: 'normal', marginLeft: '6px' }} color="#4287e1">
                                {t('LoginLayout_TitleBetaTag')}
                            </Tag>
                        </Title>
                        <Paragraph style={{ fontSize: '28px', marginTop: 0, marginBottom: 0 }}>{
                            t('LoginLayout_Subtitle')
                        }</Paragraph>
                        <Paragraph style={{ fontSize: '20px', marginTop: 14, textAlign: 'center' }}>
                            {t('LoginLayout_SubtitleDescription')}
                        </Paragraph>
                    </Typography>

                    <Space wrap>
                        <Button style={{ marginTop: 20, minWidth: "170px" }} type="primary" size="large" onClick={handleLogin}>{
                            t('LoginLayout_ButtonText_LoginViaJAccount')
                        }</Button>

                    </Space>




                    <div>
                        <img style={{ width: '80vw', marginTop: 65 }} src={img_example} ></img>
                    </div>
                </div>


                {/* <div style={{ display: 'flex', 
                            flexDirection: 'row',
                            justifyContent: 'center',
                            marginTop: '-95px',
                            alignItems: 'center', 
                            zIndex : '4',
                            position: 'relative'}}>
                    <img style={{ width:'80vw' }} src={img_example} ></img>
                </div> */}
            </div>
            <Footer style={{
                background: '#FFF',
                padding: '0',
                // position: 'absolute', 
                marginTop: 'auto',
                bottom: 0,
                width: '100%',
                textAlign: 'center',
            }}>
                <div>
                    <p style={{ fontSize: '12px', color: '#aaaaaa', letterSpacing: '0.3px' }}>{t('LoginLayout_Footer_Copyright')}<br />{t('LoginLayout_Footer_TechSupport')} <a href="mailto:gpt@sjtu.edu.cn" title="gpt@sjtu.edu.cn">{t('LoginLayout_Footer_ContactLinkText')}</a>
                    </p>
                </div>
            </Footer>
        </Layout>
    )
}

export default LoginLayout;