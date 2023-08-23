import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from 'react-i18next';
import { Layout, Typography, Button, Card, Checkbox, Avatar, Tag, Space } from 'antd';
import { CloseOutlined, ExperimentTwoTone } from '@ant-design/icons';
import { UserContext } from "../../contexts/UserContext";

import './style.css'

const { Header, Content } = Layout;
const { Title } = Typography;

function TabPlugins ({ onCloseTab }) {

    const [loaded, setLoaded] = useState(true);
    const { pluginList, selectedPlugins, handleSelectPlugin } = useContext(UserContext);

    useEffect(() => {
        setLoaded(true);
    }, []);

    let {t} = useTranslation('Tabs_plugins')

    return(
        <Layout style={{ height: '100%'}}>
            <Header className='Header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space><h2>{t('Tabs_plugins_Header')}</h2><ExperimentTwoTone style={{fontSize:'18px'}}/></Space>
                <Button icon={<CloseOutlined />} onClick={onCloseTab}/>
            </Header>
            <Content className={loaded ? 'tab-content float-up' : 'tab-content'} style={{ overflow: 'auto'}}>
                <Typography>
                    <div className="plugin-card-container" style={{marginTop:'25px'}}>
                    {pluginList.map(item => (
                        <Card hoverable className="plugin-card"
                            key={item.id}
                            style={{border: selectedPlugins.includes(item.id) ? '2px solid #1677FF' : ''}}
                        >
                        <Checkbox 
                            style={{ float: 'right', marginTop:'-2px' }} 
                            onChange={() => handleSelectPlugin(item.id)}
                            checked={selectedPlugins.includes(item.id)}/>
                        <Card.Meta 
                            title={item.name} 
                            description={item.description}
                            avatar={<Avatar shape="square" size={40} src={item.icon}/>}
                        />
                        </Card>
                    ))}
                    </div>
                </Typography>
            </Content>
        </Layout>
    )
};
  
export default TabPlugins;