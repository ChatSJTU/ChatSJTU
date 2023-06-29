import React, { useState, useEffect } from "react";
import { Layout, Typography, Divider, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import './style.css'

const { Header, Content } = Layout;
const { Title, Paragraph} = Typography;

function TabAbout ({ onCloseTab }) {

    const [loaded, setLoaded] = useState(true);

    useEffect(() => {
        setLoaded(true);
    }, []);

    return(
        <Layout style={{ height: '100%'}}>
            <Header className='Header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>关于我们</h2>
                <Button icon={<CloseOutlined />} onClick={onCloseTab}/>
            </Header>
            <Content className={loaded ? 'tab-content float-up' : 'tab-content'} style={{ padding: '0 50px', overflow: 'auto'}}>
                <Typography>
                    <Title level={4}>简介</Title>
                    <Paragraph>
                        简介内容
                    </Paragraph>
                    <Divider/>
                    <Title level={4}>开发团队</Title>
                    <Paragraph>
                        开发团队内容
                    </Paragraph>
                </Typography>
            </Content>
        </Layout>
    )
};
  
export default TabAbout;