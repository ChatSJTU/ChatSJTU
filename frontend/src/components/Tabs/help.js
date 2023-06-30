import React, { useState, useEffect } from "react";
import { Layout, Typography, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

import './style.css'

const { Header, Content } = Layout;
const { Title } = Typography;

function TabHelp ({ onCloseTab }) {

    const [loaded, setLoaded] = useState(true);

    useEffect(() => {
        setLoaded(true);
    }, []);

    return(
        <Layout style={{ height: '100%'}}>
            <Header className='Header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>帮助</h2>
                <Button icon={<CloseOutlined />} onClick={onCloseTab}/>
            </Header>
            <Content className={loaded ? 'tab-content float-up' : 'tab-content'} style={{ padding: '0 50px', overflow: 'auto'}}>
                <Typography>
                    <Title level={2} style={{fontFamily: "Trebuchet MS, Arial, sans-serif"}}>
                        欢迎使用 <span style={{ color: '#a72139' }}>Chat SJTU</span> !
                        </Title>
                </Typography>
            </Content>
        </Layout>
    )
};
  
export default TabHelp;