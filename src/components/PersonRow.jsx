import React from 'react'
import { Avatar } from 'antd'
import { EyeOutlined } from '@ant-design/icons'

function PersonRow({ record }) {
  return (
    <Avatar 
      src={record.avatar} 
      size={50}
      icon={!record.avatar && <EyeOutlined />}
    />
  )
}

export default PersonRow

