import React, { useState, useEffect } from "react";
import { Layout, Typography, Button, Card, message, Badge, Space } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { fetchUserProfile } from '../../services/user';

import './style.css'

const { Header, Content } = Layout;
const { Title } = Typography;
const { Meta } = Card;

function TabWallet ({ onCloseTab }) {

    const [loaded, setLoaded] = useState(true);
    const [user, setUser] = useState(null);

    const badgeStyle = {
        faculty: { text: '教职工', color: '#3182CE' },
        postphd: { text: '博士后', color: '#319795' },
        student: { text: '学生', color: '#38A169' },
    };

    useEffect(() => {
        setLoaded(true);
        fetchUserInfo();
    }, []);

    //获取登录用户信息
    const fetchUserInfo = async () => {
        try {
            const userData = await fetchUserProfile();
            setUser(userData);
        } catch (error) {
            if (error.response.status === 404){
                message.error('用户不存在',2);
            }
        }
    };

    return(
        <Layout style={{ height: '100%'}}>
            <Header className='Header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>账户信息</h2>
                <Button icon={<CloseOutlined />} onClick={onCloseTab}/>
            </Header>
            <Content className={loaded ? 'tab-content float-up' : 'tab-content'} style={{ padding: '0px 50px', overflow: 'auto'}}>
                <Typography>
                    <Title level={4} style={{marginTop:'25px'}}>权限</Title>
                    <Card style={{marginTop: '25px'}}>
                        <Meta
                            title={<Space>{`用户名：${user?.username}`}
                                <Badge className="solid-badge"
                                    status={null}
                                    count={badgeStyle[user?.usertype].text}
                                    style={{background: badgeStyle[user?.usertype].color}}
                                /></Space>}
                        />
                    </Card>
                </Typography>
            </Content>
        </Layout>
    )
};
  
export default TabWallet;