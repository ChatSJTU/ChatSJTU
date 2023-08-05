import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
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

    let { t } = useTranslation('Tabs_wallet');

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
        faculty: { text: t('Tabs_wallet_User_Label1'), color: 'blue' },
        fs: { text: t('Tabs_wallet_User_Label2'), color: 'magenta'},
        postphd: { text: t('Tabs_wallet_User_Label3'), color: 'cyan' },
        student: { text: t('Tabs_wallet_User_Label4'), color: 'green' },
        team:    { text: t('Tabs_wallet_User_Label5'), color: 'volcano'},
        vip:     { text: t('Tabs_wallet_User_Label6'), color: 'gold'},
        yxy:     { text: t('Tabs_wallet_User_Label7'), color: 'purple'},
    };
    const tag = tagStyle[user?.usertype] || { text: t('Tabs_wallet_User_Label0'), color: 'default' };

    const FacultyPermission = <div className="permission-display-container">
        <Space><CheckOutlined style={{color:"#52c41a"}}/>{t('Tabs_wallet_Perm_Faculty_1')}</Space>
        <Space><CheckOutlined style={{color:"#52c41a"}}/>{t('Tabs_wallet_Perm_Faculty_2')}</Space>
    </div>

    const PermissionDisplay = {
        faculty: FacultyPermission,
        fs:      FacultyPermission,
        postphd: FacultyPermission,
        student:
            <div className="permission-display-container">
                <Space><CheckOutlined style={{color:"#52c41a"}}/>{t('Tabs_wallet_Perm_Student_1')}</Space>
                <Space><CheckOutlined style={{color:"#52c41a"}}/>{t('Tabs_wallet_Perm_Student_2')}</Space>
            </div>,
        team:    FacultyPermission,
        vip:     FacultyPermission,
        yxy:     FacultyPermission
    }

    const UsageDisplay=(
        <Typography>
            <Title level={4} style={{marginTop:'25px'}}>{t('Tabs_wallet_Subtitle_2')}</Title>
            <Card style={{marginTop: '25px'}}>
                {t('Tabs_wallet_Usage_Title')} 
                    <Progress percent={(100 * user?.usagecount / user?.usagelimit) || 0} 
                        format={() => t('Tabs_wallet_Usage_Head') + `${user?.usagecount} / ${user?.usagelimit}` + t('Tabs_wallet_Usage_End')}
                        style={{paddingRight: '55px', flexGrow: 1}}
                        status="active" strokeColor={{from: '#87d068',to: '#108ee9'}}/>
            </Card>
        </Typography>
    )
    

    return(
        <Layout style={{ height: '100%'}}>
            <Header className='Header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>{t('Tabs_wallet_Title')}</h2>
                <Button icon={<CloseOutlined />} onClick={onCloseTab}/>
            </Header>
            <Content className={loaded ? 'tab-content float-up' : 'tab-content'} style={{ overflow: 'auto'}}>
                <Typography>
                    <Title level={4} style={{marginTop:'25px'}}>{t('Tabs_wallet_Subtitle_1')}</Title>
                    <Card style={{marginTop: '25px'}}
                        title={
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span>{t('Tabs_wallet_Perm_Title')} {`${user?.username}`}</span>
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
