import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, Select, InputNumber, Tag, Button, Space, message, DatePicker } from 'antd'
import dayjs from 'dayjs'

const { Option } = Select

function EditImageModal({ visible, image, personName, isPrivate, onCancel, onOk, onShelfStatusChange }) {
  const [form] = Form.useForm()

  useEffect(() => {
    if (visible && image) {
      form.setFieldsValue({
        ...image,
        externalImageName: image.externalImageName || '',
        styles: image.styles || [],
        industry: Array.isArray(image.industry) ? image.industry : (image.industry ? [image.industry] : []),
        season: Array.isArray(image.season) ? image.season : (image.season ? [image.season] : []),
        scene: Array.isArray(image.scene) ? image.scene : (image.scene ? [image.scene] : []),
        supportBackground: image.supportBackground ? '支持' : '不支持',
        authStartTime: image.authStartTime ? dayjs(image.authStartTime) : null,
        authEndTime: image.authEndTime ? dayjs(image.authEndTime) : null
      })
    }
  }, [visible, image, personName, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const normalizedUserId =
        typeof values.userId === 'string'
          ? values.userId
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
              .join(',')
          : values.userId
      const submitData = {
        ...values,
        userId: isPrivate ? normalizedUserId : undefined,
        styles: Array.isArray(values.styles) ? values.styles : (values.styles ? [values.styles] : []),
        industry: Array.isArray(values.industry) ? values.industry : (values.industry ? [values.industry] : []),
        season: Array.isArray(values.season) ? values.season : (values.season ? [values.season] : []),
        scene: Array.isArray(values.scene) ? values.scene : (values.scene ? [values.scene] : []),
        supportBackground: values.supportBackground === '支持',
        authStartTime: values.authStartTime ? values.authStartTime.format('YYYY-MM-DD') : null,
        authEndTime: values.authEndTime ? values.authEndTime.format('YYYY-MM-DD') : null
      }
      onOk(submitData)
      form.resetFields()
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  const styleOptions = ['商务', '休闲', '正式', '运动', '红衣', '蓝衣']

  const handleShelfToggle = () => {
    const newStatus = image.shelfStatus === 'shelved' ? 'unshelved' : 'shelved'
    onShelfStatusChange(newStatus)
    message.success(`形象已${newStatus === 'shelved' ? '上架' : '下架'}`)
  }

  if (!image) return null

  return (
    <Modal
      title={`编辑形象 - ${image.externalImageName}`}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={800}
      okText="确定"
      cancelText="取消"
      footer={[
        <Button key="shelf" type={image.shelfStatus === 'shelved' ? 'default' : 'primary'} onClick={handleShelfToggle}>
          {image.shelfStatus === 'shelved' ? '下架' : '上架'}
        </Button>,
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="ok" type="primary" onClick={handleOk}>
          确定
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="thumbnail"
          label="缩略图"
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="imageKey"
          label="形象Key"
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="externalImageName"
          label="对外形象名称"
          rules={[
            { required: true, message: '请输入对外形象名称' },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve()
                const pattern = new RegExp(`^${personName}-.+$`)
                if (!pattern.test(value)) {
                  return Promise.reject(new Error(`格式必须为：${personName}-特征`))
                }
                return Promise.resolve()
              }
            }
          ]}
        >
          <Input placeholder={`格式：${personName}-特征`} />
        </Form.Item>

        <Form.Item
          name="sourceType"
          label="类型"
        >
          <Select>
            <Option value="VIRTUAL_MAN_TYPE_SELF_PRESET">自研预设数字人</Option>
            <Option value="VIRTUAL_MAN_TYPE_SELF_GENERATED">自研生成数字人</Option>
            <Option value="VIRTUAL_MAN_TYPE_TENCENT_CLOUD">腾讯云数字人</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="styles"
          label="风格"
        >
          <Select mode="multiple" placeholder="选择风格（可多选）" allowClear>
            {styleOptions.map(style => (
              <Option key={style} value={style}>{style}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="industry"
          label="赛道"
        >
          <Select mode="multiple" placeholder="选择赛道（可多选）" allowClear>
            <Option value="本地生活">本地生活</Option>
            <Option value="食品饮料">食品饮料</Option>
            <Option value="通用">通用</Option>
            <Option value="电商">电商</Option>
            <Option value="教育">教育</Option>
            <Option value="医疗">医疗</Option>
          </Select>
        </Form.Item>

        {isPrivate && (
          <Form.Item
            name="userId"
            label="所属用户"
            rules={[
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve()
                  const parts = String(value)
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                  if (parts.length === 0) return Promise.resolve()
                  // 允许字母/数字/下划线/中划线，逗号分隔
                  const ok = parts.every((p) => /^[A-Za-z0-9_-]+$/.test(p))
                  if (!ok) {
                    return Promise.reject(new Error('请输入多个用户ID，用英文逗号分隔（仅支持字母/数字/_/-）'))
                  }
                  return Promise.resolve()
                }
              }
            ]}
          >
            <Input placeholder="可输入多个用户ID，用英文逗号分隔，例如：U001,U002" />
          </Form.Item>
        )}

        <Form.Item label="上架状态">
          <Tag color={image.shelfStatus === 'shelved' ? 'green' : 'default'}>
            {image.shelfStatus === 'shelved' ? '已上架' : '未上架'}
          </Tag>
          {image.unshelveReason && (
            <span style={{ marginLeft: 8, color: '#999' }}>
              下架原因：{image.unshelveReason}
            </span>
          )}
        </Form.Item>

        <Form.Item
          name="authStartTime"
          label="授权开始时间"
        >
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          name="authEndTime"
          label="授权结束时间"
        >
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          name="pose"
          label="姿势"
        >
          <Select placeholder="选择姿势">
            <Option value="站立">站立</Option>
            <Option value="坐姿">坐姿</Option>
            <Option value="行走">行走</Option>
            <Option value="手势">手势</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="proportion"
          label="比例"
        >
          <Select placeholder="选择比例">
            <Option value="全身">全身</Option>
            <Option value="半身">半身</Option>
            <Option value="特写">特写</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="season"
          label="季节"
        >
          <Select mode="multiple" placeholder="选择季节（可多选）" allowClear>
            <Option value="春季">春季</Option>
            <Option value="夏季">夏季</Option>
            <Option value="秋季">秋季</Option>
            <Option value="冬季">冬季</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="scene"
          label="场景"
        >
          <Select mode="multiple" placeholder="选择场景（可多选）" allowClear>
            <Option value="室内">室内</Option>
            <Option value="户外">户外</Option>
            <Option value="商场">商场</Option>
            <Option value="会议室">会议室</Option>
            <Option value="办公室">办公室</Option>
            <Option value="客厅">客厅</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="supportBackground"
          label="支持上传背景"
        >
          <Select placeholder="选择是否支持上传背景">
            <Option value="支持">支持</Option>
            <Option value="不支持">不支持</Option>
          </Select>
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

export default EditImageModal

