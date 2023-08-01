import React, { useState, useEffect } from "react";
import { Layout, Typography, Button, Card, message, Tag, Space, Progress } from 'antd';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';
import { fetchUserProfile } from '../../services/user';

import './style.css'

const { Header, Content } = Layout;
const { Title } = Typography;

function TabWallet ({ onCloseTab }) {

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

    const tagStyle = {
        faculty: { text: '教职工', color: 'blue' },
        fs:      { text: '附属单位教职工', color: 'magenta'},
        postphd: { text: '博士后', color: 'cyan' },
        student: { text: '学生', color: 'green' },
        team:    { text: '集体账号', color: 'volcano'},
        vip:     { text: '贵宾', color: 'gold'},
        yxy:     { text: '医学院教职工', color: 'purple'},
    };
    const tag = tagStyle[user?.usertype] || { text: '未知', color: 'default' };

    const FacultyPermission = <div className="permission-display-container">
        <Space><CheckOutlined style={{color:"#52c41a"}}/>无限制使用模型对话</Space>
        <Space><CheckOutlined style={{color:"#52c41a"}}/>使用校园服务快捷命令</Space>
    </div>

    const PermissionDisplay = {
        faculty: FacultyPermission,
        fs:      FacultyPermission,
        postphd: FacultyPermission,
        student:
            <div className="permission-display-container">
                <Space><CheckOutlined style={{color:"#52c41a"}}/>每日限用20条模型对话</Space>
                <Space><CheckOutlined style={{color:"#52c41a"}}/>使用校园服务快捷命令</Space>
            </div>,
        team:    FacultyPermission,
        vip:     FacultyPermission,
        yxy:     FacultyPermission
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
            <Content className={loaded ? 'tab-content float-up' : 'tab-content'} style={{ overflow: 'auto'}}>
                <Typography>
                    <Title level={4} style={{marginTop:'25px'}}>权限</Title>
                    <Card style={{marginTop: '25px'}}
                        title={
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span>{`用户名：${user?.username}`}</span>
                                    <Tag
                                        color={tag.color}
                                        style={{marginLeft: '10px' }}
                                    >{tag.text}</Tag>
                            </div>
                            }
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