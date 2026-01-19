import React from 'react'
import { Modal, Form, Input, Select } from 'antd'

const { Option } = Select

function EditPersonModal({ visible, person, onCancel, onOk, existingFaceIds }) {
  const [form] = Form.useForm()

  React.useEffect(() => {
    if (visible && person) {
      form.setFieldsValue({
        ...person
      })
    }
  }, [visible, person, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      onOk(values)
      form.resetFields()
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  if (!person) return null

  return (
    <Modal
      title="编辑人物"
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
      >
        <Form.Item
          name="avatar"
          label="缩略图（头像）"
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="faceId"
          label="Face ID"
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="internalName"
          label="主播名称（对内）"
        >
          <Input disabled placeholder="仅内部管理可见" />
        </Form.Item>

        <Form.Item
          name="externalName"
          label="对外人物名"
        >
          <Input disabled placeholder="前端客户可见的名称" />
        </Form.Item>

        <Form.Item
          name="sourceType"
          label="类型"
          rules={[{ required: true }]}
        >
          <Select disabled>
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

        <Form.Item label="资产统计">
          <Input disabled value={`共${person?.images?.length || 0}个，${person?.images?.filter(i => i.shelfStatus === 'shelved').length || 0}个上架`} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default EditPersonModal

