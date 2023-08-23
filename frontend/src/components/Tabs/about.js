import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Layout, Typography, Divider, Button, Card, Avatar } from 'antd';
import { CloseOutlined, GithubOutlined } from '@ant-design/icons';
import './style.css'

const { Header, Content } = Layout;
const { Title, Paragraph, Text, Link } = Typography;
const { Meta } = Card;

function TabAbout ({ onCloseTab }) {

    const [loaded, setLoaded] = useState(true);

    useEffect(() => {
        setLoaded(true);
    }, []);

    let { t } = useTranslation('Tabs_about');

    return(
        <Layout style={{ height: '100%'}}>
            <Header className='Header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>{t('Tabs_about_Header')}</h2>
                <Button icon={<CloseOutlined />} onClick={onCloseTab}/>
            </Header>
            <Content className={loaded ? 'tab-content float-up' : 'tab-content'} style={{ overflow: 'auto'}}>
                <Typography>
                    <Title level={4} style={{marginTop:'25px'}}>{t('Tabs_about_Title_1')}</Title>
                    <Paragraph>
                        {t('Tabs_about_Intro_Head')}<Link href="https://net.sjtu.edu.cn/" target="_blank">{t('Tabs_about_Intro_Body')}</Link>{t('Tabs_about_Intro_End')}
                    </Paragraph>
                    <Divider/>
                    <Title level={4}>{t('Tabs_about_Title_2')}</Title>
                        <div className="developer-card-container">
                            <Card hoverable className="developer-card" size="small"
                                actions={[
                                    <a target="_blank" rel="noopener noreferrer" href="https://github.com/UNIkeEN"><GithubOutlined/></a>,
                                    <span />
                                ]}>
                                <Meta
                                    avatar={<Avatar size={40} src="https://avatars.githubusercontent.com/UNIkeEN" />}
                                    title="UNIkeEN"
                                    description={t('Tabs_about_Dev1_Desc')}
                                />
                            </Card>
                            <Card hoverable className="developer-card" size="small"
                                actions={[
                                    <a target="_blank" rel="noopener noreferrer" href="https://github.com/1357310795"><GithubOutlined/></a>,
                                    <span />
                                ]}>
                                <Meta
                                    avatar={<Avatar size={40} src="https://avatars.githubusercontent.com/1357310795" />}
                                    title="Teruteru"
                                    description={t('Tabs_about_Dev2_Desc')}
                                />
                            </Card>
                            <Card hoverable className="developer-card" size="small"
                                actions={[
                                    <a target="_blank" rel="noopener noreferrer" href="https://github.com/ToolmanP"><GithubOutlined/></a>,
                                    <span />
                                ]}>
                                <Meta
                                    avatar={<Avatar size={40} src="https://avatars.githubusercontent.com/ToolmanP" />}
                                    title="ToolmanP"
                                    description={t('Tabs_about_Dev3_Desc')}
                                />
                            </Card>
                            <Card hoverable className="developer-card" size="small"
                                actions={[
                                    <a target="_blank" rel="noopener noreferrer" href="https://github.com/Ichigo2315"><GithubOutlined/></a>,
                                    <span />
                                ]}>
                                <Meta
                                    avatar={<Avatar size={40} src="https://avatars.githubusercontent.com/Ichigo2315" />}
                                    title="Ichigo2315"
                                    description={t('Tabs_about_Dev4_Desc')}
                                />
                            </Card>
                            <Card hoverable className="developer-card" size="small"
                                actions={[
                                    <a target="_blank" rel="noopener noreferrer" href="https://github.com/xjxyys"><GithubOutlined/></a>,
                                    <span />
                                ]}>
                                <Meta
                                    avatar={<Avatar size={40} src="https://avatars.githubusercontent.com/xjxyys" />}
                                    title="xjxyys"
                                    description={t('Tabs_about_Dev5_Desc')}
                                />
                            </Card>
                            <Card hoverable className="developer-card" size="small"
                                actions={[
                                    <a target="_blank" rel="noopener noreferrer" href="https://github.com/peterzheng98"><GithubOutlined/></a>,
                                    <span />
                                ]}>
                                <Meta
                                    avatar={<Avatar size={40} src="https://avatars.githubusercontent.com/peterzheng98" />}
                                    title="peterzheng98"
                                    description={t('Tabs_about_Dev6_Desc')}
                                />
                            </Card>
                            <Card hoverable className="developer-card" size="small"
                                actions={[
                                    <a target="_blank" rel="noopener noreferrer" href="https://github.com/VegetablesKimi"><GithubOutlined/></a>,
                                    <span />
                                ]}>
                                <Meta
                                    avatar={<Avatar size={40} src="https://avatars.githubusercontent.com/VegetablesKimi" />}
                                    title="VegetablesKimi"
                                    description={t('Tabs_about_Dev7_Desc')}
                                />
                            </Card>
                            <Card hoverable className="developer-card" size="small"
                                actions={[
                                    <a target="_blank" rel="noopener noreferrer" href="https://github.com/ff98sha"><GithubOutlined/></a>,
                                    <span />
                                ]}>
                                <Meta
                                    avatar={<Avatar size={40} src="https://avatars.githubusercontent.com/ff98sha" />}
                                    title="ff98sha"
                                    description={t('Tabs_about_Dev8_Desc')}
                                />
                            </Card>
                            <Card hoverable className="developer-card" size="small"
                                actions={[
                                    <a target="_blank" rel="noopener noreferrer" href="https://github.com/Musicminion"><GithubOutlined/></a>,
                                    <span />
                                ]}>
                                <Meta
                                    avatar={<Avatar size={40} src="https://avatars.githubusercontent.com/Musicminion" />}
                                    title="Musicminion"
                                    description={t('Tabs_about_Dev9_Desc')}
                                />
                            </Card>
                        </div>
                    <Title level={4}>{t('Tabs_about_Title_3')}</Title>
                    <Paragraph>
                        {t('Tabs_about_Ackn_Head')}<Text code>@topologica1</Text>、<Text code>@boar</Text>{t('Tabs_about_Ackn_End')}
                    </Paragraph>
                    <Divider/>
                    <Title level={4}>{t('Tabs_about_Title_4')}</Title>
                    <Paragraph>
                        {t('Tabs_about_Contact_Head')}<Link href="mailto:gpt@sjtu.edu.cn">gpt@sjtu.edu.cn</Link>{t('Tabs_about_Contact_End')}
                    </Paragraph>
                </Typography>
            </Content>
        </Layout>
    )
};
  
export default TabAbout;