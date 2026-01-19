import React, { useState } from 'react'
import { Modal, Form, Input, Select, Upload, InputNumber, Switch, Tag, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

const { Option } = Select

function AddImageModal({ visible, person, onCancel, onOk }) {
  const [form] = Form.useForm()
  const [styles, setStyles] = useState([])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const submitData = {
        ...values,
        externalImageName: `${person.externalName}-${values.feature || '默认'}`,
        styles: styles,
        format: values.format || 'horizontal', // 默认横版，实际应该从上传的视频自动判断
        shelfStatus: 'unshelved' // 默认未上架
      }
      onOk(submitData)
      form.resetFields()
      setStyles([])
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    setStyles([])
    onCancel()
  }

  const styleOptions = ['商务', '休闲', '正式', '运动', '红衣', '蓝衣']

  const handleStyleChange = (value) => {
    if (!styles.includes(value)) {
      setStyles([...styles, value])
    }
  }

  const removeStyle = (style) => {
    setStyles(styles.filter(s => s !== style))
  }

  if (!person) return null

  return (
    <Modal
      title={`新增形象 - ${person.externalName}`}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={800}
      okText="确定"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          format: 'horizontal',
          supportBackground: false
        }}
      >
        <Form.Item
          name="imageKey"
          label="形象Key"
          rules={[{ required: true, message: '请输入形象Key' }]}
        >
          <Input placeholder="每个形象唯一标识" />
        </Form.Item>

        <Form.Item
          name="feature"
          label="特征"
          rules={[{ required: true, message: '请输入特征' }]}
        >
          <Input placeholder="用于生成对外形象名称：对外人物名-特征" />
        </Form.Item>

        <Form.Item
          name="thumbnail"
          label="缩略图"
        >
          <Upload
            listType="picture-card"
            maxCount={1}
            beforeUpload={() => false}
          >
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>上传</div>
            </div>
          </Upload>
        </Form.Item>

        <Form.Item
          name="format"
          label="版式"
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="horizontal">横版</Option>
            <Option value="vertical">竖版</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="风格"
        >
          <Select
            placeholder="选择风格（可多选）"
            onSelect={handleStyleChange}
            allowClear
          >
            {styleOptions.map(style => (
              <Option key={style} value={style}>{style}</Option>
            ))}
          </Select>
          <div style={{ marginTop: 8 }}>
            {styles.map(style => (
              <Tag
                key={style}
                closable
                onClose={() => removeStyle(style)}
                style={{ marginBottom: 4 }}
              >
                {style}
              </Tag>
            ))}
          </div>
        </Form.Item>

        <Form.Item
          name="industry"
          label="赛道"
        >
          <Select placeholder="选择赛道">
            <Option value="local_life">本地生活</Option>
            <Option value="food_beverage">食品饮料</Option>
            <Option value="general">通用</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="profession"
          label="职业"
        >
          <Input placeholder="职业" />
        </Form.Item>

        <Form.Item
          name="pose"
          label="姿势"
        >
          <Input placeholder="姿势" />
        </Form.Item>

        <Form.Item
          name="proportion"
          label="比例"
        >
          <Input placeholder="比例" />
        </Form.Item>

        <Form.Item
          name="season"
          label="季节"
        >
          <Input placeholder="季节" />
        </Form.Item>

        <Form.Item
          name="scene"
          label="场景"
        >
          <Input placeholder="场景" />
        </Form.Item>

        <Form.Item
          name="supportBackground"
          label="支持上传背景"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="width"
          label="宽"
        >
          <InputNumber style={{ width: '100%' }} placeholder="如：1080" />
        </Form.Item>

        <Form.Item
          name="height"
          label="高"
        >
          <InputNumber style={{ width: '100%' }} placeholder="如：1920" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AddImageModal

