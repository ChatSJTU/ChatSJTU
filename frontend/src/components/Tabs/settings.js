import React, { useState, useEffect } from "react";
import { Layout, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import './style.css'

const { Header, Content } = Layout;

function TabSettings ({ onCloseTab }) {

    const [loaded, setLoaded] = useState(true);

    useEffect(() => {
        setLoaded(true);
    }, []);

    return(
        <Layout style={{ height: '100%'}}>
            <Header className='Header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>偏好设置</h2>
                <Button icon={<CloseOutlined />} onClick={onCloseTab}/>
            </Header>
            <Content className={loaded ? 'tab-content float-up' : 'tab-content'} style={{ padding: '0 50px', overflow: 'auto'}}>
            </Content>
        </Layout>
    )
};
  
export default TabSettings;