import React, { useState, useEffect } from "react";
import { Layout, Button, Card, Popconfirm, Divider, Col, Row, Typography, message, InputNumber} from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import './style.css'
import { request } from "../../services/request";
import { getSettings, updateSettings } from "../../services/user";

const { Header, Content } = Layout;
const { Title } = Typography;

function TabSettings ({ onCloseTab }) {

    const [loaded, setLoaded] = useState(true);
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        setLoaded(true);
        fetchSettings();
    }, []);

    //获取设置项
    const fetchSettings = async () => {
        try{
            const data = await getSettings();
            setSettings(data);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            message.error('请求失败',2);
        }
    };

    //更改设置项
    const handleChangeSettings = async (updatedSettings) => {
        try {
            setSettings((prevSettings) => ({
                ...prevSettings,
                ...updatedSettings
            }));
            await updateSettings(updatedSettings);
        } catch (error) {
            console.error('Failed to update settings:', error);
            message.error('更新设置项失败', 2);
        }
    };

    const handleDeleteAllSessions = async () => {
        try {
            await request.delete('/api/sessions/delete_all/');
            const newUrl = `${window.location.href}?autologin=true`;
            window.location.href = newUrl;
        } catch (error) {
            console.error('Failed to delete sessions:', error);
            message.error('请求失败',2);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await request.delete('/oauth/delete-account/');
            window.location.reload();
        } catch (error) {
            console.error('Failed to delete account:', error);
            message.error('请求失败',2);
        }
    };

    return(
        <Layout style={{ height: '100%'}}>
            <Header className='Header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>偏好设置</h2>
                <Button icon={<CloseOutlined />} onClick={onCloseTab}/>
            </Header>
            <Content className={loaded ? 'tab-content float-up' : 'tab-content'} style={{ overflow: 'auto'}}>
                <Typography>
                    <Title level={4} style={{marginTop:'25px'}}>模型参数</Title>
                    <Card style={{marginTop: '25px'}} >
                        <Row>
                            <Col span={12} className="setting-title">
                                <div><span>随机性（temperature）</span></div>
                                <div>值越大，回复越随机</div>
                            </Col>
                            <Col span={12} className="setting-item">
                            <InputNumber min={0} max={1} precision={1} step={0.1}
                                value={settings?.temperature}
                                onChange={(value) => {handleChangeSettings({ temperature: value });}}
                            />
                            </Col>
                        </Row>
                        <Divider className="setting-divider"/>
                        <Row>
                            <Col span={12} className="setting-title">
                                <div><span>单次回复限制（max_tokens）</span></div>
                                <div>单次交互所用的最大 Token 数</div>
                            </Col>
                            <Col span={12} className="setting-item">
                            <InputNumber min={0} max={1000} step={100}
                                value={settings?.max_tokens}
                                onChange={(value) => {handleChangeSettings({ max_tokens: value });}}
                            />
                            </Col>
                        </Row>
                        <Divider className="setting-divider"/>
                        <Row>
                            <Col span={12} className="setting-title">
                                <div><span>附带历史消息数</span></div>
                                <div>每次请求携带的历史消息数</div>
                            </Col>
                            <Col span={12} className="setting-item">
                            <InputNumber min={0} max={8}
                                value={settings?.attached_message_count}
                                onChange={(value) => {handleChangeSettings({ attached_message_count: value });}}
                            />
                            </Col>
                        </Row>
                    </Card>
                    <Title level={4} style={{marginTop:'25px'}}>高风险</Title>
                    <Card style={{marginTop: '25px'}} >
                        <Row>
                            <Col span={12} className="setting-title">
                                <div><span>清除会话</span></div>
                                <div>清除所有会话、消息数据</div>
                            </Col>
                            <Col span={12} className="setting-item">
                                <Popconfirm
                                    title="确认"
                                    description="确认清除所有会话、消息数据？"
                                    onConfirm={handleDeleteAllSessions}
                                    okText="确定" okButtonProps={{size: 'middle'}}
                                    cancelText="取消" cancelButtonProps={{size: 'middle'}}
                                >
                                    <Button danger>立即清除</Button>
                                </Popconfirm>
                            </Col>
                        </Row>
                        <Divider className="setting-divider"/>
                        <Row>
                            <Col span={12} className="setting-title">
                                <div><span>重置账户</span></div>
                                <div>重置账户的所有数据，所有会话与设置将被清除。</div>
                            </Col>
                            <Col span={12} className="setting-item">
                                <Popconfirm
                                    title="确认"
                                    description="确认重置账户的所有数据？"
                                    onConfirm={handleDeleteAccount}
                                    okText="确定" okButtonProps={{size: 'middle'}}
                                    cancelText="取消" cancelButtonProps={{size: 'middle'}}
                                >
                                    <Button danger>立即重置</Button>
                                </Popconfirm>
                            </Col>
                        </Row>
                        {/* <Divider className="setting-divider"/>
                        <Row gutter={16}>
                            <Col span={12} className="setting-title">
                                <span>Option 2:</span>
                            </Col>
                            <Col span={12} className="setting-item">
                                <Input defaultValue="Input Value"/>
                            </Col>
                        </Row> */}
                    </Card>
                </Typography>
            </Content>
        </Layout>
    )
};
  
export default TabSettings;