import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from 'react-i18next';
import { Layout, Typography, Button, Card, Tag, Space, Progress, Row, Col, Statistic, Tooltip, Table } from 'antd';
import { CloseOutlined, CheckOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Column } from '@ant-design/plots'
import { UserContext } from '../../contexts/UserContext';

import './style.scss'

const { Header, Content } = Layout;
const { Title } = Typography;

function TabWallet ({ onCloseTab }) {

    const [loaded, setLoaded] = useState(true);
    const { userProfile, fetchUserInfo } = useContext(UserContext)

    useEffect(() => {
        setLoaded(true);
        fetchUserInfo();
    }, []);

    let { t } = useTranslation('Tabs_wallet');

    const tagStyle = {
        faculty: { text: t('Tabs_wallet_User_Label1'), color: 'blue' },
        fs: { text: t('Tabs_wallet_User_Label2'), color: 'magenta'},
        postphd: { text: t('Tabs_wallet_User_Label3'), color: 'cyan' },
        student: { text: t('Tabs_wallet_User_Label4'), color: 'green' },
        team:    { text: t('Tabs_wallet_User_Label5'), color: 'volcano'},
        vip:     { text: t('Tabs_wallet_User_Label6'), color: 'gold'},
        yxy:     { text: t('Tabs_wallet_User_Label7'), color: 'purple'},
    };
    const tag = tagStyle[userProfile?.usertype] || { text: t('Tabs_wallet_User_Label0'), color: 'default' };

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

    // const UsageDisplay=(
    //     <Typography>
    //         <Title level={4} style={{marginTop:'25px'}}>{t('Tabs_wallet_Subtitle_2')}</Title>
    //         <Card style={{marginTop: '25px'}}>
    //             {t('Tabs_wallet_Usage_Title')} 
    //                 <Progress percent={(100 * userProfile?.usagecount / userProfile?.usagelimit) || 0} 
    //                     format={() => t('Tabs_wallet_Usage_Head') + `${userProfile?.usagecount} / ${userProfile?.usagelimit}` + t('Tabs_wallet_Usage_End')}
    //                     style={{paddingRight: '55px', flexGrow: 1}}
    //                     status="active" strokeColor={{from: '#87d068',to: '#108ee9'}}/>
    //         </Card>
    //     </Typography>
    // )
    
    const TestUsageData = [
        {name:'prompt_tokens', date:'2024/03/01', value:225},
        {name:'prompt_tokens', date:'2024/03/02', value:288},
        {name:'prompt_tokens', date:'2024/03/03', value:323},
        {name:'prompt_tokens', date:'2024/03/04', value:304},
        {name:'prompt_tokens', date:'2024/03/05', value:489},
        {name:'prompt_tokens', date:'2024/03/06', value:577},
        {name:'prompt_tokens', date:'2024/03/07', value:311},
        {name:'prompt_tokens', date:'2024/03/08', value:125},
        {name:'completion_tokens', date:'2024/03/01', value:1125},
        {name:'completion_tokens', date:'2024/03/02', value:3025},
        {name:'completion_tokens', date:'2024/03/03', value:2825},
        {name:'completion_tokens', date:'2024/03/04', value:1325},
        {name:'completion_tokens', date:'2024/03/05', value:5625},
        {name:'completion_tokens', date:'2024/03/06', value:4725},
        {name:'completion_tokens', date:'2024/03/07', value:1999},
        {name:'completion_tokens', date:'2024/03/08', value:2048}
    ]

    const TestDetailsData = [
        {datetime: '2024/03/01 11:00:11', model: 'GPT-4', price: -19.97, details: '提示 Token 114，回复 Token 514，换算 Token 1919'},
        {datetime: '2024/03/01 10:00:00', price: 1000, details: '账户充值'},
    ]

    const UsageChartsConfig = {
        data: TestUsageData.map(item => ({
            ...item,
            name: t(`Tabs_wallet_Usage_Column_${item.name}`),
        })),
        xField: 'date',
        yField: 'value',
        colorField: 'name',
        group: true,
        height: 400,
        slider: {
            x: {values: [0, 1],}
        },
        legend: null,
    }

    const UsageDatailsColumn = [
        {
            title: '时间',
            dataIndex: 'datetime',
        },
        {
            title: '模型',
            dataIndex: 'model',
            width: 100,
        },
        {
            title: '金额',
            dataIndex: 'price',
            width: 80,
        },
        {
            title: '详细信息',
            dataIndex: 'details',
        },
    ]

    return(
        <Layout style={{ height: '100%'}}>
            <Header className='Header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>{t('Tabs_wallet_Title')}</h2>
                <Button icon={<CloseOutlined />} onClick={onCloseTab}/>
            </Header>
            <Content className={loaded ? 'tab-content float-up' : 'tab-content'} style={{ overflow: 'auto'}}>
                <Typography>
                    {/* <Title level={4} style={{marginTop:'25px'}}>{t('Tabs_wallet_Subtitle_1')}</Title>
                    <Card style={{marginTop: '25px'}}
                        title={
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span>{t('Tabs_wallet_Perm_Title')} {`${userProfile?.username}`}</span>
                                    <Tag
                                        color={tag.color}
                                        style={{marginLeft: '10px' }}
                                    >{tag.text}</Tag>
                            </div>
                            }
                        >
                        {PermissionDisplay[userProfile?.usertype] || null}
                    </Card> */}
                    <Title level={4} style={{marginTop:'25px'}}>{t('Tabs_wallet_Subtitle_3')}</Title>
                    <Card style={{marginTop: '25px'}}
                        title={
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span>{t('Tabs_wallet_Perm_Title')} {`${userProfile?.username}`}</span>
                                        <Tag
                                            color={tag.color}
                                            style={{marginLeft: '10px' }}
                                        >{tag.text}</Tag>
                                </div>
                                }
                        >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Statistic title={t('Tabs_wallet_Balance_Statistic1')} value={999} precision={2}/>
                            </Col>
                            <Col span={12}>
                                <Space direction="vertical">
                                    <Statistic title={
                                        <Space>
                                            <span>{t('Tabs_wallet_Balance_Statistic2')}</span>
                                            <Tooltip title={t('Tabs_wallet_Balance_Tooltip')}>
                                                <QuestionCircleOutlined />
                                            </Tooltip>
                                        </Space>
                                        } 
                                        value={112893} precision={2} />
                                    <Button>{t('Tabs_wallet_Balance_Button')}</Button>
                                </Space>
                            </Col>
                        </Row>
                    </Card>
                    <Title level={4} style={{marginTop:'25px'}}>{t('Tabs_wallet_Subtitle_2')}</Title>
                    <Card style={{marginTop: '25px'}}>
                        <Column
                            {...UsageChartsConfig}
                            />
                    </Card>
                    <Title level={4} style={{marginTop:'25px'}}>{t('Tabs_wallet_Subtitle_4')}</Title>
                    <Card style={{marginTop: '25px'}}>
                        <Table 
                            columns={UsageDatailsColumn}
                            dataSource={TestDetailsData}
                            pagination={{ pageSize: 20 }}
                            scroll={{ y: 240 }}/>
                    </Card>
                </Typography>
                {/* {userProfile?.usertype === 'student'? UsageDisplay:null} */}
            </Content>
        </Layout>
    )
};
  
export default TabWallet;
