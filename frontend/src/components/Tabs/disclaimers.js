import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Layout, Typography, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

import './style.scss'

const { Header, Content } = Layout;
const { Title, Paragraph, Text } = Typography;

function TabDisclaimers ({ onCloseTab }) {

    const [loaded, setLoaded] = useState(true);

    useEffect(() => {
        setLoaded(true);
    }, []);

    let { t } = useTranslation('Tabs_disclaimer');

    return(
        <Layout style={{ height: '100%'}}>
            <Header className='Header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>{t('Tabs_disclaimer_Title')}</h2>
                <Button icon={<CloseOutlined />} onClick={onCloseTab}/>
            </Header>
            <Content className={loaded ? 'tab-content float-up' : 'tab-content'} style={{ overflow: 'auto'}}>
                <Typography>
                    <Paragraph style={{marginTop:'25px'}}>
                        {t('Tabs_disclaimer_Header')}
                    </Paragraph>
                    <Title level={4} >{t('Tabs_disclaimer_Subtitle_1')}</Title>
                    <Paragraph>
                        {t('Tabs_disclaimer_Content_1')}
                    </Paragraph>
                    <Title level={4} >{t('Tabs_disclaimer_Subtitle_2')}</Title>
                    <Paragraph>
                        {t('Tabs_disclaimer_Content_2_Line1')}<br/>
                        {t('Tabs_disclaimer_Content_2_Line2')}
                    </Paragraph>
                    <Title level={4} >{t('Tabs_disclaimer_Subtitle_3')}</Title>
                    <Paragraph>
                        {t('Tabs_disclaimer_Content_3')}
                    </Paragraph>
                    <Title level={4} >{t('Tabs_disclaimer_Subtitle_4')}</Title>
                    <Paragraph>
                        {t('Tabs_disclaimer_Content_4_Line1')}<br/>
                        {t('Tabs_disclaimer_Content_4_Line2')}
                    </Paragraph>
                    <Text strong>{t('Tabs_disclaimer_End')}</Text>
                </Typography>
            </Content>
        </Layout>
    )
};
  
export default TabDisclaimers;