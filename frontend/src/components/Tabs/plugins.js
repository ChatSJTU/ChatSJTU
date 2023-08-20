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
                    <h2>插件</h2>
                <Button icon={<CloseOutlined />} onClick={onCloseTab}/>
            </Header>
            <Content className={loaded ? 'tab-content float-up' : 'tab-content'} style={{ overflow: 'auto'}}>
                <Typography>
                </Typography>
            </Content>
        </Layout>
    )
};
  
export default TabHelp;