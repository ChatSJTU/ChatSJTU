import React, { useState, useEffect } from "react";
import { Layout, Typography, Button, Card, message, Badge, Space, Progress } from 'antd';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';
import { fetchUserProfile } from '../../services/user';

import './style.css'

const { Header, Content } = Layout;
const { Title } = Typography;
const { Meta } = Card;

function TabWallet ({ onCloseTab }) {
    console.log('TabWallet rendered');

    const [loaded, setLoaded] = useState(true);
    const [user, setUser] = useState(null);

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

    const badgeStyle = {
        faculty: { text: '教职工', color: '#3182CE' },
        postphd: { text: '博士后', color: '#319795' },
        student: { text: '学生', color: '#38A169' },
    };
    const badge = badgeStyle[user?.usertype] || { text: '未知', color: 'gray' };

    const PermissionDisplay = {
        faculty:
        <div className="permission-display-container">
            <Space><CheckOutlined style={{color:"#52c41a"}}/>无限制使用默认模型对话</Space>
            <Space><CheckOutlined style={{color:"#52c41a"}}/>无限制使用校园服务快捷命令</Space>
        </div>,
        postphd:
        <div className="permission-display-container">
            <Space><CheckOutlined style={{color:"#52c41a"}}/>无限制使用默认模型对话</Space>
            <Space><CheckOutlined style={{color:"#52c41a"}}/>无限制使用校园服务快捷命令</Space>
        </div>,
        student:
        <div className="permission-display-container">
            <Space><CheckOutlined style={{color:"#52c41a"}}/>每日限用20条默认模型对话</Space>
            <Space><CheckOutlined style={{color:"#52c41a"}}/>无限制使用校园服务快捷命令</Space>
        </div>,
    }

    const UsageDisplay=(
        <Typography>
            <Title level={4} style={{marginTop:'25px'}}>用量</Title>
            <Card style={{marginTop: '25px'}}>
                今日默认模型用量：
                    <Progress percent={(100 * user?.usagecount / user?.usagelimit) || 0} 
                        format={() => `已用 ${user?.usagecount} / ${user?.usagelimit} 条`}
                        style={{paddingRight: '55px', flexGrow: 1}}
                        status="active" strokeColor={{from: '#87d068',to: '#108ee9'}}/>
            </Card>
        </Typography>
    )
    

    return(
        <Layout style={{ height: '100%'}}>
            <Header className='Header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>账户信息</h2>
                <Button icon={<CloseOutlined />} onClick={onCloseTab}/>
            </Header>
            <Content className={loaded ? 'tab-content float-up' : 'tab-content'} style={{ padding: '0px 50px', overflow: 'auto'}}>
                <Typography>
                    <Title level={4} style={{marginTop:'25px'}}>权限</Title>
                    <Card style={{marginTop: '25px'}}
                        title={
                            <Space>{`用户名：${user?.username}`}
                            <Badge className="solid-badge"
                                status={null}
                                count={badge.text}
                                style={{background: badge.color}}
                            />
                            </Space>}
                        >
                        {PermissionDisplay[user?.usertype] || null}
                    </Card>
                </Typography>
                {user?.usertype === 'student'? UsageDisplay:null}
            </Content>
        </Layout>
    )
};
  
export default TabWallet;