import React, { useState } from 'react'
import { Avatar, Button, Popover, Tag, Space, message } from 'antd'
import { CopyOutlined, EyeOutlined } from '@ant-design/icons'

function ImageRow({ record, onAddImage, onEditImage }) {
  const [hovered, setHovered] = useState(false)

  const handleCopyKey = () => {
    navigator.clipboard.writeText(record.imageKey)
    message.success('形象Key已复制')
  }

  const detailContent = (
    <div style={{ width: 300 }}>
      <div><strong>职业：</strong>{record.profession || '-'}</div>
      <div><strong>姿势：</strong>{record.pose || '-'}</div>
      <div><strong>比例：</strong>{record.proportion || '-'}</div>
      <div><strong>季节：</strong>{record.season || '-'}</div>
      <div><strong>场景：</strong>{record.scene || '-'}</div>
      <div><strong>支持上传背景：</strong>{record.supportBackground ? '支持' : '不支持'}</div>
      <div><strong>宽：</strong>{record.width || '-'}</div>
      <div><strong>高：</strong>{record.height || '-'}</div>
    </div>
  )

  return (
    <div 
      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ position: 'relative' }}>
        <Avatar 
          src={record.thumbnail} 
          size={60}
          shape="square"
          icon={!record.thumbnail && <EyeOutlined />}
        />
        {hovered && record.previewUrl && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 70,
            zIndex: 1000,
            background: '#fff',
            padding: 8,
            borderRadius: 4,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}>
            <img 
              src={record.previewUrl} 
              alt="预览" 
              style={{ width: 200, height: 'auto' }}
            />
          </div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 4 }}>
          <Space>
            <span style={{ fontWeight: 500 }}>{record.externalImageName}</span>
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={handleCopyKey}
            />
            <span style={{ color: '#999', fontSize: 12 }}>{record.imageKey}</span>
          </Space>
        </div>
        <div>
          <Space size="small">
            {record.format && (
              <Tag color={record.format === 'horizontal' ? 'blue' : 'green'}>
                {record.format === 'horizontal' ? '横版' : '竖版'}
              </Tag>
            )}
            {record.styles?.map((style, idx) => (
              <Tag key={idx}>{style}</Tag>
            ))}
            {record.industry && (
              <Tag color="purple">{record.industry}</Tag>
            )}
            {record.shelfStatus && (
              <Tag color={
                record.shelfStatus === 'shelved' ? 'green' :
                record.shelfStatus === 'pending' ? 'orange' : 'default'
              }>
                {record.shelfStatus === 'shelved' ? '已上架' :
                 record.shelfStatus === 'pending' ? '未上架' : '已下架'}
              </Tag>
            )}
            <Popover content={detailContent} title="详细参数" trigger="click">
              <Button type="link" size="small">详细参数</Button>
            </Popover>
          </Space>
        </div>
      </div>
    </div>
  )
}

export default ImageRow

