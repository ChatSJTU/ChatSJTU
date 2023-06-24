import React, {useRef,useState} from 'react';
import MainLayout from './components/MainLayout'
import './App.css';

// const {Header, Content, Sider, Footer} = Layout;

const App = () => {
    return (
        <div style={{ background: '#f0f2f5', height: '100%' }}>
            <MainLayout />
        </div>
    )
}
export default App;