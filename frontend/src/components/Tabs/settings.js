import React, { useState, useEffect } from "react";
import { Layout, Button, Card, Popconfirm, Select, Col, Row, Divider} from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import './style.css'
import { request } from "../../services/request";

const { Header, Content } = Layout;

function TabSettings ({ onCloseTab }) {

    const [loaded, setLoaded] = useState(true);

    useEffect(() => {
        setLoaded(true);
    }, []);

    const handleDeleteAllSessions = async () => {
        try {
            await request.delete('/api/sessions/delete_all/');
            const newUrl = `${window.location.href}?autologin=true`;
            window.location.href = newUrl;
        } catch (error) {
            console.error('Failed to delete sessions:', error);
        }
    };

    return(
        <Layout style={{ height: '100%'}}>
            <Header className='Header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>偏好设置</h2>
                <Button icon={<CloseOutlined />} onClick={onCloseTab}/>
            </Header>
            <Content className={loaded ? 'tab-content float-up' : 'tab-content'} style={{ padding: '0 50px', overflow: 'auto'}}>
            <Card style={{marginTop: '25px'}} title="清除数据" >
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
            </Content>
        </Layout>
    )
};
  
export default TabSettings;