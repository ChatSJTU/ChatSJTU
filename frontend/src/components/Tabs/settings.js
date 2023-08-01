import React, { useState, useEffect } from "react";
import { Layout, Button, Card, Popconfirm, Divider, Col, Row, Typography, message, InputNumber, Select, Switch, Modal} from 'antd';
import { CloseOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import './style.css'
import { request } from "../../services/request";
import { getSettings, updateSettings } from "../../services/user";
import { GlobalOutlined } from '@ant-design/icons';
import i18n from '../../components/I18n/i18n'

const { Header, Content } = Layout;
const { Title } = Typography;
const { confirm } = Modal;

function TabSettings({ onCloseTab }) {

    const [loaded, setLoaded] = useState(true);
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        setLoaded(true);
        fetchSettings();
    }, []);

    //获取设置项
    const fetchSettings = async () => {
        try {
            const data = await getSettings();
            setSettings(data);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            message.error('请求失败', 2);
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
            message.error('请求失败', 2);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await request.delete('/oauth/delete-account/');
            window.location.reload();
        } catch (error) {
            console.error('Failed to delete account:', error);
            message.error('请求失败', 2);
        }
    };

    const LoadLanguage = () => {
        if (i18n.language === 'zh') {
            return 'zh-CN';
        } else if (i18n.language === 'en') {
            return 'en-US';
        }
        return 'zh-CN';
    }

    const handleLanguageChange = (value) => {
        if (value === 'zh-CN') {
            i18n.changeLanguage('zh');
        }
        else if (value === 'en-US') {
            i18n.changeLanguage('en');
        }
    }
    // 通用Modal 生成函数
    const showConfirmModal = ({ title, content, onOk }) => {
        confirm({
            title,
            content,
            icon: <ExclamationCircleFilled />,
            okText: '确定',
            okType: 'danger',
            okButtonProps: {
                size: "middle",
            },
            cancelText: '取消',
            onOk,
        });
      };

    // 清除所有会话警告
    const showDeleteAllSessionsConfirm = () => {
        showConfirmModal({
        title: '确认清除会话？',
        content: '您的所有会话、消息数据将被清除，此操作不可逆。',
        onOk: handleDeleteAllSessions,
        });
    };
  
    // 清除账户警告
    const showDeleteAccountConfirm = () => {
        showConfirmModal({
        title: '确认重置账户？',
        content: '您的所有数据将被重置，所有会话与设置将被清除，此操作不可逆。',
        onOk: handleDeleteAccount,
        });
    };

    return (
        <Layout style={{ height: '100%' }}>
            <Header className='Header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>偏好设置</h2>
                <Button icon={<CloseOutlined />} onClick={onCloseTab} />
            </Header>
            <Content className={loaded ? 'tab-content float-up' : 'tab-content'} style={{ overflow: 'auto' }}>
                <Typography>
                    <Title level={4} style={{ marginTop: '25px' }}>基本设置</Title>
                    <Card style={{ marginTop: '25px' }} >
                        <Row>
                            <Col span={18} className="setting-title">
                                <div><span>语言（language）</span></div>
                                {/* <div>选择您的界面语言</div> */}
                            </Col>
                            <Col span={6} className="setting-item">
                                <Select
                                    defaultValue={LoadLanguage()}
                                    style={{
                                        width: 90,
                                    }}
                                    onChange={handleLanguageChange}
                                    options={[
                                        {
                                            value: 'zh-CN',
                                            label: <>中文</>,
                                        },
                                        {
                                            value: 'en-US',
                                            label: <>English</>,
                                        },
                                    ]}
                                />
                            </Col>
                        </Row>
                    </Card>

                    <Title level={4} style={{ marginTop: '25px' }}>模型</Title>
                    <Card style={{ marginTop: '25px' }} >
                        <Row>
                            <Col span={18} className="setting-title">
                                <div><span>随机性（temperature）</span></div>
                                <div>值越大，回复越随机</div>
                            </Col>
                            <Col span={6} className="setting-item">
                                <InputNumber min={0} max={1} precision={1} step={0.1}
                                    value={settings?.temperature}
                                    onChange={(value) => { handleChangeSettings({ temperature: value }); }}
                                />
                            </Col>
                        </Row>
                        <Divider className="setting-divider" />
                        <Row>
                            <Col span={18} className="setting-title">
                                <div><span>单次回复限制</span></div>
                                <div>单次交互回复所用的最大 Token 数</div>
                            </Col>
                            <Col span={6} className="setting-item">
                                <InputNumber min={100} max={2000} step={100}
                                    value={settings?.max_tokens}
                                    onChange={(value) => { handleChangeSettings({ max_tokens: value }); }}
                                />
                            </Col>
                        </Row>
                        <Divider className="setting-divider" />
                        <Row>
                            <Col span={18} className="setting-title">
                                <div><span>附带历史消息数</span></div>
                                <div>每次请求携带的历史消息数</div>
                            </Col>
                            <Col span={6} className="setting-item">
                                <InputNumber min={0} max={8}
                                    value={settings?.attached_message_count}
                                    onChange={(value) => { handleChangeSettings({ attached_message_count: value }); }}
                                />
                            </Col>
                        </Row>
                        <Divider className="setting-divider" />
                        <Row>
                            <Col span={18} className="setting-title">
                                <div><span>附带快捷命令消息</span></div>
                                <div>请求携带的历史消息是否包含校园服务快捷命令</div>
                            </Col>
                            <Col span={6} className="setting-item">
                                <Switch checked={settings?.attach_with_qcmd}
                                onChange={(checked) => { handleChangeSettings({ attach_with_qcmd: checked }); }}/>
                            </Col>
                        </Row>
                        <Divider className="setting-divider" />
                        <Row>
                            <Col span={18} className="setting-title">
                                <div><span>附带多次生成结果</span></div>
                                <div>请求携带的历史消息是否包含对同一请求的多次生成结果，关闭则仅携带同一请求的最后一次生成结果</div>
                            </Col>
                            <Col span={6} className="setting-item">
                                <Switch checked={settings?.attach_with_regenerated}
                                onChange={(checked) => { handleChangeSettings({ attach_with_regenerated: checked }); }}/>
                            </Col>
                        </Row>
                    </Card>
                    <Title level={4} style={{ marginTop: '25px' }}>高风险</Title>
                    <Card style={{ marginTop: '25px' }} >
                        <Row>
                            <Col span={18} className="setting-title">
                                <div><span>清除会话</span></div>
                                <div>清除所有会话、消息数据</div>
                            </Col>
                            <Col span={6} className="setting-item">
                                <Button danger onClick={showDeleteAllSessionsConfirm}>立即清除</Button>
                            </Col>
                        </Row>
                        <Divider className="setting-divider" />
                        <Row>
                            <Col span={18} className="setting-title">
                                <div><span>重置账户</span></div>
                                <div>重置账户的所有数据，所有会话与设置将被清除。</div>
                            </Col>
                            <Col span={6} className="setting-item">
                                <Button danger onClick={showDeleteAccountConfirm}>立即重置</Button>
                            </Col>
                        </Row>
                        {/* <Divider className="setting-divider"/>
                        <Row gutter={16}>
                            <Col span={18} className="setting-title">
                                <span>Option 2:</span>
                            </Col>
                            <Col span={6} className="setting-item">
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