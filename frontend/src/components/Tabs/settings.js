import React, { useState, useEffect, useContext } from "react";
import { Layout, Button, Card, Divider, Col, Row, Typography, message, InputNumber, Select, Switch, Modal} from 'antd';
import { CloseOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import './style.scss'
import { request } from "../../services/request";
import { updateSettings } from "../../services/user";
import { ThemeContext } from "../../contexts/ThemeContext";
import { UserContext } from '../../contexts/UserContext';
import i18n from '../../components/I18n/i18n'

const { Header, Content } = Layout;
const { Title } = Typography;
const { confirm } = Modal;

function TabSettings({ onCloseTab, changeLanguage, changeTheme }) {

    const userTheme = useContext(ThemeContext);
    const [loaded, setLoaded] = useState(true);
    const { settings, setSettings, fetchSettings } = useContext(UserContext);

    useEffect(() => {
        setLoaded(true);
        fetchSettings();    // 获取设置项的函数定义移至MainLayout
    }, []);

    let { t } = useTranslation('Tabs_settings');

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
            message.error(t('Tabs_settings_UpdateError'), 2);
        }
    };

    const handleDeleteAllSessions = async () => {
        try {
            await request.delete('/api/sessions/delete_all/');
            const newUrl = `${window.location.href}?autologin=true`;
            window.location.href = newUrl;
        } catch (error) {
            console.error('Failed to delete sessions:', error);
            message.error(t('Tabs_settings_DeleteAllError'), 2);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await request.delete('/oauth/delete-account/');
            window.location.reload();
        } catch (error) {
            console.error('Failed to delete account:', error);
            message.error(t('Tabs_settings_DeleteAccountError'), 2);
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

    // 通用Modal 生成函数
    const showConfirmModal = ({ title, content, onOk }) => {
        confirm({
            title,
            content,
            icon: <ExclamationCircleFilled />,
            okText: t('Tabs_settings_ModalOK'),
            okType: 'danger',
            okButtonProps: {
                size: "middle",
            },
            cancelText: t('Tabs_settings_ModalCancel'),
            onOk,
        });
      };

    // 清除所有会话警告
    const showDeleteAllSessionsConfirm = () => {
        showConfirmModal({
        title: t('Tabs_settings_DeleteAllSessionsConfirm_Title'),
        content: t('Tabs_settings_DeleteAllSessionsConfirm_Content'),
        onOk: handleDeleteAllSessions,
        });
    };
  
    // 清除账户警告
    const showDeleteAccountConfirm = () => {
        showConfirmModal({
        title: t('Tabs_settings_DeleteAccountConfirm_Title'),
        content: t('Tabs_settings_DeleteAccountConfirm_Content'),
        onOk: handleDeleteAccount,
        });
    };

    return (
        <Layout style={{ height: '100%' }}>
            <Header className='Header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>{t('Tabs_settings_Title')}</h2>
                <Button icon={<CloseOutlined />} onClick={onCloseTab} />
            </Header>
            <Content className={loaded ? 'tab-content float-up' : 'tab-content'} style={{ overflow: 'auto' }}>
                <Typography>
                    <Title level={4} style={{ marginTop: '25px' }}>{t('Tabs_settings_Subtitle_1')}</Title>
                    <Card style={{ marginTop: '25px' }} >
                        <Row>
                            <Col span={18} className="setting-title">
                                <div><span>语言 (Language)</span></div>
                                {/* <div>选择您的界面语言</div> */}
                            </Col>
                            <Col span={6} className="setting-item">
                                <Select
                                    defaultValue={LoadLanguage()}
                                    style={{
                                        width: 90,
                                    }}
                                    onChange={changeLanguage}
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
                        <Divider className="setting-divider" />
                        <Row>
                            <Col span={18} className="setting-title">
                                <div><span>{t('Tabs_settings_Basic_2_Head')}</span></div>
                            </Col>
                            <Col span={6} className="setting-item">
                                <Switch checked={userTheme === 'light' ? false : true}
                                onChange={() => { changeTheme(); }}/>
                            </Col>
                        </Row>
                    </Card>

                    <Title level={4} style={{ marginTop: '25px' }}>{t('Tabs_settings_Subtitle_2')}</Title>
                    <Card style={{ marginTop: '25px' }} >
                        <Row>
                            <Col span={18} className="setting-title">
                                <div><span>{t('Tabs_settings_Model_1_Head')}</span></div>
                                <div>{t('Tabs_settings_Model_1_Desc')}</div>
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
                                <div><span>{t('Tabs_settings_Model_2_Head')}</span></div>
                                <div>{t('Tabs_settings_Model_2_Desc')}</div>
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
                                <div><span>{t('Tabs_settings_Model_3_Head')}</span></div>
                                <div>{t('Tabs_settings_Model_3_Desc')}</div>
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
                                <div><span>{t('Tabs_settings_Model_4_Head')}</span></div>
                                <div>{t('Tabs_settings_Model_4_Desc')}</div>
                            </Col>
                            <Col span={6} className="setting-item">
                                <Switch checked={settings?.attach_with_qcmd}
                                onChange={(checked) => { handleChangeSettings({ attach_with_qcmd: checked }); }}/>
                            </Col>
                        </Row>
                        <Divider className="setting-divider" />
                        <Row>
                            <Col span={18} className="setting-title">
                                <div><span>{t('Tabs_settings_Model_5_Head')}</span></div>
                                <div>{t('Tabs_settings_Model_5_Desc')}</div>
                            </Col>
                            <Col span={6} className="setting-item">
                                <Switch checked={settings?.attach_with_regenerated}
                                onChange={(checked) => { handleChangeSettings({ attach_with_regenerated: checked }); }}/>
                            </Col>
                        </Row>
                    </Card>
                    <Title level={4} style={{ marginTop: '25px' }}>{t('Tabs_settings_Subtitle_3')}</Title>
                    <Card style={{ marginTop: '25px' , borderColor: 'rgba(255, 129, 130, 0.4)'}} >
                        <Row>
                            <Col span={18} className="setting-title">
                                <div><span>{t('Tabs_settings_Risky_1_Head')}</span></div>
                                <div>{t('Tabs_settings_Risky_1_Desc')}</div>
                            </Col>
                            <Col span={6} className="setting-item">
                                <Button danger onClick={showDeleteAllSessionsConfirm}>{t('Tabs_settings_Risky_1_Btn')}</Button>
                            </Col>
                        </Row>
                        <Divider className="setting-divider" />
                        <Row>
                            <Col span={18} className="setting-title">
                                <div><span>{t('Tabs_settings_Risky_2_Head')}</span></div>
                                <div>{t('Tabs_settings_Risky_2_Desc')}</div>
                            </Col>
                            <Col span={6} className="setting-item">
                                <Button danger onClick={showDeleteAccountConfirm}>{t('Tabs_settings_Risky_2_Btn')}</Button>
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