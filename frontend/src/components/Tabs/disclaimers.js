import React, { useState, useEffect } from "react";
import { Layout, Typography, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

import './style.css'

const { Header, Content } = Layout;
const { Title, Paragraph, Text } = Typography;

function TabDisclaimers ({ onCloseTab }) {

    const [loaded, setLoaded] = useState(true);

    useEffect(() => {
        setLoaded(true);
    }, []);

    return(
        <Layout style={{ height: '100%'}}>
            <Header className='Header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>免责声明与使用须知</h2>
                <Button icon={<CloseOutlined />} onClick={onCloseTab}/>
            </Header>
            <Content className={loaded ? 'tab-content float-up' : 'tab-content'} style={{ padding: '0px 50px', overflow: 'auto'}}>
                <Typography>
                    <Paragraph style={{marginTop:'25px'}}>
                        欢迎使用 Chat SJTU ！在使用我们的服务之前，我们希望您能仔细阅读并理解以下内容。
                    </Paragraph>
                    <Title level={4} >用途</Title>
                    <Paragraph>
                        Chat SJTU 仅限上海交通大学校内师生使用，旨在为学术和教育目的提供语言生成支持。请注意，Chat SJTU 提供的信息仅供参考，不应被用作做出任何决策的基础，包括但不限于医疗、法律、金融决策。在这些情况下，请您寻求专业的建议。
                    </Paragraph>
                    <Title level={4} >准确性</Title>
                    <Paragraph>
                        Chat SJTU 基于人工智能驱动的自然语言生成技术，尽可能向您提供准确和有用的信息，但它并不总是完全准确。用户应自行判断平台提供的信息的可靠性并自担风险。<br/>
                        如您认为 Chat SJTU 在涉及我校的话题（如校园信息、通知公告、软件文档等）中提供的信息存在事实错误，欢迎联系我们。
                    </Paragraph>
                    <Title level={4} >法律</Title>
                    <Paragraph>
                        在使用 Chat SJTU 时，请遵守适用的法律法规和学校规定，并对您的行为和言论负责。如果您认为 Chat SJTU 提供的信息存在此类风险，请您立即联系我们。
                    </Paragraph>
                    <Title level={4} >隐私与其他</Title>
                    <Paragraph>
                        我们尊重并保护您的信息安全，但无法完全防止信息泄露或不当使用。我们强烈建议您不要向 Chat SJTU 发送任何敏感信息。<br/>
                        由于技术原因或其他因素，服务可能中断、故障或延迟，对此我们不承担责任。
                    </Paragraph>
                    <Text strong>感谢您的理解与合作，祝您使用愉快！</Text>
                </Typography>
            </Content>
        </Layout>
    )
};
  
export default TabDisclaimers;