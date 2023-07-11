import React, { useState, useEffect } from "react";
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

    return(
        <Layout style={{ height: '100%'}}>
            <Header className='Header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>关于我们</h2>
                <Button icon={<CloseOutlined />} onClick={onCloseTab}/>
            </Header>
            <Content className={loaded ? 'tab-content float-up' : 'tab-content'} style={{ overflow: 'auto'}}>
                <Typography>
                    <Title level={4} style={{marginTop:'25px'}}>简介</Title>
                    <Paragraph>
                        Chat SJTU 是由<Link href="https://net.sjtu.edu.cn/" target="_blank">上海交通大学网络信息中心</Link>指导，学生团队开发的自然语言处理工具。由人工智能技术驱动，旨在为交大人的学习生活提供便利。
                    </Paragraph>
                    <Divider/>
                    <Title level={4}>开发团队</Title>
                        <div className="developer-card-container">
                            <Card hoverable className="developer-card" size="small"
                                actions={[
                                    <a target="_blank" rel="noopener noreferrer" href="https://github.com/UNIkeEN"><GithubOutlined/></a>,
                                    <span />
                                ]}>
                                <Meta
                                    avatar={<Avatar size={40} src="https://avatars.githubusercontent.com/UNIkeEN" />}
                                    title="UNIkeEN"
                                    description="电院，全栈开发"
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
                                    description="电院，全栈开发"
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
                                    description="生科，参与前端开发"
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
                                    description="电院，参与后端开发"
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
                                    description="密院，模型与插件开发"
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
                                    description="安泰，模型与插件开发"
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
                                    description="电院，开发与部署指导"
                                />
                            </Card>
                        </div>
                    <Title level={4}>鸣谢</Title>
                    <Paragraph>
                        特别感谢 <Text code>@topologica1</Text>、<Text code>@boar</Text> 等学长在开发过程中的帮助。
                    </Paragraph>
                    <Divider/>
                    <Title level={4}>联系我们</Title>
                    <Paragraph>
                        您可以通过邮件 <Link href="mailto:gpt@sjtu.edu.cn">gpt@sjtu.edu.cn</Link> 联系我们。
                    </Paragraph>
                </Typography>
            </Content>
        </Layout>
    )
};
  
export default TabAbout;