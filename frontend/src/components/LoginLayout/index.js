import React, { useState } from 'react';
import { Layout, Typography, Tag, Button, Select, Row, Col, Form, Input} from 'antd';
import { useTranslation } from 'react-i18next';

import background from '../../assets/main-gradient.png';
import background_dark from '../../assets/main-gradient-dark.png';
import background_webm from '../../assets/new-main-gradient.webm'
import img_example from '../../assets/main-example-1.png'
import img_example_dark from '../../assets/main-example-1.png'
import { GlobalOutlined } from '@ant-design/icons';
import { LockOutlined, UserOutlined } from "@ant-design/icons";

import './index.scss'

const { Footer } = Layout;
const { Title, Paragraph } = Typography;

function LoginLayout({ handleLogin, handleRegister, changeLanguage }) {
    const [formType, setFormType] = useState("login");

    const LoadLanguage = () => {
        const { i18n } = useTranslation();
        let defaultLanguage = 'zh-CN';
        if (navigator.language.startsWith('en')) {
            defaultLanguage = 'en-US';
        }
        if (i18n.language === 'zh') {
            return 'zh-CN';
        }
        else if (i18n.language === 'en') {
            return 'en-US';
        }
        return defaultLanguage;
    }


    let { t } = useTranslation('LoginLayout');

    const getRegisterForm = () =>
    <Form
      name="normal_login"
      className="login-form"
      initialValues={{
        remember: true,
      }}
      onFinish={handleRegister}
      size="large"
      style={{flex: 1}}
    >
      <Form.Item>
        <h2 style={{fontSize: '40px', fontWeight: "lighter"}}>注册账号</h2>
      </Form.Item>
      <Form.Item
        name="username"
        rules={[
          {
            required: true,
            message: '请输入用户名',
          },
        ]}
      >
        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="用户名" />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[
          {
            required: true,
            message: '请输入密码',
          },
        ]}
      >
        <Input
          prefix={<LockOutlined className="site-form-item-icon" />}
          type="password"
          placeholder="密码"
        />
      </Form.Item>
      <Form.Item
        name="confirm"
        dependencies={['password']}
        hasFeedback
        rules={[
            {
              required: true,
              message: '请再次输入密码！',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('密码不匹配！'));
              },
            }),
          ]}
        >
        <Input.Password  
          prefix={<LockOutlined className="site-form-item-icon" />} 
          placeholder="确认密码"/>
      </Form.Item>
      <Form.Item>
        <p style={{fontSize: '16px', textAlign: 'center'}}>
          <span>已有账号？</span>
          <a className="login-form-login" onClick={()=>{setFormType("login")}}>
            登录
          </a>
        </p>
      </Form.Item>
      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          className="login-form-button"
          style={{width: "100%"}}>
          注册
        </Button>
      </Form.Item>
    </Form>

    const getLoginForm = () =>
    <Form
    name="normal_login"
    className="login-form"
    initialValues={{
        remember: true,
    }}
    onFinish={handleLogin}
    size="large"
    style={{flex: 1}}
    >
    <Form.Item>
        <h2 style={{fontSize: '40px', fontWeight: "lighter"}}>登录 Chat SJTU</h2>
    </Form.Item>
    <Form.Item
        name="username"
        rules={[
        {
            required: true,
            message: '请输入用户名',
        },
        ]}
    >
        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="用户名" />
    </Form.Item>
    <Form.Item
        name="password"
        rules={[
        {
            required: true,
            message: '请输入密码',
        },
        ]}
    >
        <Input
        prefix={<LockOutlined className="site-form-item-icon" />}
        type="password"
        placeholder="密码"
        />
    </Form.Item>
    <Form.Item>
        <p style={{fontSize: "16px", textAlign: 'center'}}>
        <span>第一次使用，请先</span>
        <a className="login-form-register" onClick={()=>{setFormType("register")}}>
            注册账号
        </a>
        </p>
    </Form.Item>
    <Form.Item>
        <Button 
        type="primary" 
        htmlType="submit" 
        className="login-form-button"
        style={{width: "100%"}}>
        登录
        </Button>
    </Form.Item>
    </Form>

    return (
        <Layout className="rootLayout" style={{ height: '100vh', position: 'relative' }}>
            <div
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    zIndex: '5',
                }}
            >
                <div>
                    <GlobalOutlined className="i18n-icon"/>
                    <Select
                        defaultValue={LoadLanguage()}
                        style={{
                            width: 90,
                        }}
                        bordered={false}
                        onChange={changeLanguage}
                        options={[
                            {
                                value: 'zh-CN', 
                                label: <>中文</>,
                            },
                            {
                                value: 'en-US',
                                label: <>English</>,
                            },
                        ]}
                    />
                </div>
            </div>
            <Row style={{width: "100%", height: "100%"}}>
                <Col span={16}>
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            marginTop: '6vh',
                            zIndex: '2', overflow: 'hidden',
                            position: 'relative'
                        }}>
                            <video className='video' style={{
                                clipPath: 'inset(2px 2px)',
                                objectFit: 'contain',
                                overflowClipMargin: 'content-box',
                                overflow: 'clip',
                                opacity: '50%',
                            }} autoPlay="autoPlay" muted="muted" loop="loop" poster={background} data-fullscreen-container="true">
                                <source src={background_webm} type="video/webm" />
                            </video>
                            <img style={{
                                    clipPath: 'inset(2px 2px)',
                                    objectFit: 'contain',
                                    overflowClipMargin: 'content-box',
                                    overflow: 'clip',
                                    opacity: '50%', 
                                    position: 'absolute'
                                }} className='backImage' src={background_dark}>
                            </img>
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
                            
                            <div style={{display: 'flex', width: "100%", justifyContent: 'center'}}>
                                <img className='example' style={{ width: '80%', marginTop: 25, textAlign: 'center' }} src={img_example} ></img>
                                <img className='exampleDark' style={{ width: '80%', marginTop: 25, position: 'absolute', textAlign: 'center' }} src={img_example_dark} ></img>
                            </div>
                        </div>
                    </div>
                </Col>
                <Col span={8}>
                    <div className='login-frame' style={{width: "100%", height: "100%"}}>
                    <div style={{ 
                        height: "100%",
                        width: "100%",
                        display: "flex", 
                        justifyContent: "center", 
                        alignItems: "center" }}>
                        <div style={{ 
                            flex: 1,
                            margin: "40px"
                        }}> 
                        {formType === "login" ? getLoginForm() :
                            formType === "register" ? getRegisterForm() : null}
                        </div>
                    </div>
                    
                    {/* <Space wrap>
                                <Button style={{ marginTop: 20, minWidth: "170px" }} type="primary" size="large" onClick={handleLogin}>{
                                    t('LoginLayout_ButtonText_LoginViaJAccount')
                                }</Button>

                            </Space> */}
                    </div>
                </Col>
            </Row>
            <Footer style={{
                padding: '0',
                // position: 'absolute', 
                marginTop: 'auto',
                bottom: 0,
                width: '100%',
                textAlign: 'center',
            }}>
                <div>
                    <p style={{ fontSize: '12px', color: '#aaaaaa', letterSpacing: '0.3px' }}>{t('LoginLayout_Footer_TechSupport')} <a href="mailto:gpt@sjtu.edu.cn" title="gpt@sjtu.edu.cn">{t('LoginLayout_Footer_ContactLinkText')}</a>
                    </p>
                </div>
            </Footer>
        </Layout>
    )
}

export default LoginLayout;