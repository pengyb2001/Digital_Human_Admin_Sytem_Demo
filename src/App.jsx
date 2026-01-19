import React from 'react'
import { Layout } from 'antd'
import DigitalHumanManagement from './pages/DigitalHumanManagement'
import './App.css'

const { Header, Content } = Layout

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
          数字人后台管理系统
        </h1>
      </Header>
      <Content style={{ padding: '24px', background: '#f5f5f5' }}>
        <DigitalHumanManagement />
      </Content>
    </Layout>
  )
}

export default App

