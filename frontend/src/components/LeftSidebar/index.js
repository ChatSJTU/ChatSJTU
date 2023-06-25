import React, {useRef,useState} from 'react';
import {Layout, Space, Typography, Divider, Col, Row, Button} from 'antd';
import {PlusCircleOutlined, RocketOutlined, UserOutlined, EllipsisOutlined, QuestionCircleOutlined} from '@ant-design/icons';

import './index.css'

const { Content, Footer, Header } = Layout;
const { Title, Paragraph } = Typography;

const LeftSidebar = () => {
    return (
        <Layout style={{ height: '100%'}}>
            <Header className='Sider-content'>
                <Typography style={{margin:'0px 25px'}}>
                    <Title level={2} style={{ fontWeight: 'bold', marginBottom: 5}}>Chat SJTU</Title>
                    <Paragraph style={{ fontSize:'16px', marginBottom: 10}}>交大人的AI助手</Paragraph>
                </Typography>
                <Row style={{margin:'0px 17.5px'}}>
                    <Col span={12} className='button-col'>
                        <Button block size="large" type="text" icon={<RocketOutlined />}>
                            伴我学
                        </Button>
                    </Col>
                    <Col span={12} className='button-col'>
                        <Button block size="large" type="text" icon={<PlusCircleOutlined/>}>
                            新的会话
                        </Button>
                    </Col>
                </Row>
            </Header>
            <Content className='Sider-content'>
                
            </Content>
            <Footer className='Sider-content'>
                <Divider></Divider>
                <Row style={{margin:'0px 17.5px 20px 17.5px'}}>
                    <Col span={5} className='button-col'>
                        <Button block size="large" type="text" icon={<UserOutlined />}/>
                    </Col>
                    <Col span={5} className='button-col'>
                        <Button block size="large" type="text" icon={<QuestionCircleOutlined />}/>
                    </Col>
                    <Col span={9} className='button-col'/>
                    <Col span={5} className='button-col'>
                        <Button block size="large" type="text" icon={<EllipsisOutlined />}/>
                    </Col>
                </Row>
            </Footer>
        </Layout>
    )
}

export default LeftSidebar;