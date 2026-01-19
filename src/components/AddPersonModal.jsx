import React, { useState } from 'react'
import { Modal, Form, Input, Select, DatePicker, Upload, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { Option } = Select

function AddPersonModal({ visible, onCancel, onOk, existingFaceIds }) {
  const [form] = Form.useForm()
  const [faceIdMode, setFaceIdMode] = useState('new') // 'new' | 'existing'

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const submitData = {
        ...values,
        authStartTime: values.authStartTime ? values.authStartTime.format('YYYY-MM-DD') : null,
        authEndTime: values.authEndTime ? values.authEndTime.format('YYYY-MM-DD') : null,
        faceId: faceIdMode === 'existing' ? values.existingFaceId : values.newFaceId
      }
      delete submitData.existingFaceId
      delete submitData.newFaceId
      onOk(submitData)
      form.resetFields()
      setFaceIdMode('new')
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    setFaceIdMode('new')
    onCancel()
  }

  return (
    <Modal
      title="录入人物"
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
          faceIdMode: 'new',
          sourceType: 'VIRTUAL_MAN_TYPE_SELF_PRESET',
          gender: 'male',
          age: 'youth'
        }}
      >
        <Form.Item
          label="Face ID"
          required
        >
          <Select
            value={faceIdMode}
            onChange={setFaceIdMode}
            style={{ marginBottom: 16 }}
          >
            <Option value="new">新建Face ID</Option>
            <Option value="existing">关联已有人物</Option>
          </Select>
          {faceIdMode === 'new' ? (
            <Form.Item
              name="newFaceId"
              rules={[
                { required: true, message: '请输入Face ID' },
                {
                  validator: (_, value) => {
                    if (value && existingFaceIds.includes(value)) {
                      return Promise.reject('该Face ID已存在')
                    }
                    return Promise.resolve()
                  }
                }
              ]}
            >
              <Input placeholder="请输入新的Face ID" />
            </Form.Item>
          ) : (
            <Form.Item
              name="existingFaceId"
              rules={[{ required: true, message: '请选择已有人物' }]}
            >
              <Select placeholder="选择已有人物" showSearch>
                {existingFaceIds.map(id => (
                  <Option key={id} value={id}>{id}</Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </Form.Item>

        <Form.Item
          name="internalName"
          label="主播名称（对内）"
          rules={[{ required: true, message: '请输入主播名称' }]}
        >
          <Input placeholder="仅内部管理可见" />
        </Form.Item>

        <Form.Item
          name="externalName"
          label="对外人物名"
          rules={[{ required: true, message: '请输入对外人物名' }]}
        >
          <Input placeholder="前端客户可见的名称" />
        </Form.Item>

        <Form.Item
          name="sourceType"
          label="类型"
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="VIRTUAL_MAN_TYPE_SELF_PRESET">自研预设数字人</Option>
            <Option value="VIRTUAL_MAN_TYPE_SELF_GENERATED">自研生成数字人</Option>
            <Option value="VIRTUAL_MAN_TYPE_TENCENT_CLOUD">腾讯云数字人</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="gender"
          label="性别"
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="male">男</Option>
            <Option value="female">女</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="age"
          label="年龄"
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="child">少儿</Option>
            <Option value="youth">青年</Option>
            <Option value="middle">中年</Option>
            <Option value="elder">老年</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="avatar"
          label="头像"
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
          name="authStartTime"
          label="授权开始时间"
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="authEndTime"
          label="授权结束时间"
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AddPersonModal

