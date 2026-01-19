import React from 'react'
import { Table, Avatar, Tag, Button, Space, Popconfirm, Tooltip, message, Popover, Checkbox, Image } from 'antd'
import { 
  EditOutlined, 
  DeleteOutlined, 
  CaretRightOutlined,
  CaretDownOutlined,
  SettingOutlined,
  CopyOutlined,
  EyeOutlined,
  CloseOutlined
} from '@ant-design/icons'
import EditPersonModal from './EditPersonModal'
import EditImageModal from './EditImageModal'
import { checkAuthorizationExpiry } from '../utils/authorization'
import './TreeTable.css'

function TreeTable({
  data,
  isPrivate,
  expandedRows,
  onExpand,
  onEditPerson,
  onDeletePerson,
  onEditImage,
  onDeleteImage,
  onShelfStatusChange,
  selectedImageKeys,
  onSelectionChange,
  onPersonSelect,
  onSelectAll,
  totalPersons,
  totalImages,
  totalShelvedImages
}) {
  const [editingPerson, setEditingPerson] = React.useState(null)
  const [editingImage, setEditingImage] = React.useState(null)

  // 获取所有形象的key
  const getAllImageKeys = () => {
    const keys = []
    data.forEach(person => {
      if (person.images && person.images.length > 0) {
        person.images.forEach(image => {
          keys.push(`image-${image.id}`)
        })
      }
    })
    return keys
  }

  // 获取人物下所有形象的key
  const getPersonImageKeys = (personId) => {
    const person = data.find(p => p.id === personId)
    if (!person || !person.images) return []
    return person.images.map(img => `image-${img.id}`)
  }

  // 检查人物是否被全选（其下所有形象都被选中）
  const isPersonFullySelected = (personId) => {
    const imageKeys = getPersonImageKeys(personId)
    if (imageKeys.length === 0) return false
    return imageKeys.every(key => selectedImageKeys.has(key))
  }

  // 检查人物是否部分选中
  const isPersonIndeterminate = (personId) => {
    const imageKeys = getPersonImageKeys(personId)
    if (imageKeys.length === 0) return false
    const selectedCount = imageKeys.filter(key => selectedImageKeys.has(key)).length
    return selectedCount > 0 && selectedCount < imageKeys.length
  }

  // 检查是否全选
  const isAllSelected = () => {
    const allKeys = getAllImageKeys()
    if (allKeys.length === 0) return false
    return allKeys.every(key => selectedImageKeys.has(key))
  }

  // 检查是否部分全选
  const isIndeterminate = () => {
    const allKeys = getAllImageKeys()
    if (allKeys.length === 0) return false
    const selectedCount = allKeys.filter(key => selectedImageKeys.has(key)).length
    return selectedCount > 0 && selectedCount < allKeys.length
  }

  // 人物行（父级）的列定义
  const personColumns = [
    {
      title: (
        <Checkbox
          checked={isAllSelected()}
          indeterminate={isIndeterminate()}
          onChange={(e) => onSelectAll(e.target.checked)}
        />
      ),
      key: 'selection',
      width: 60,
      render: (text, record) => {
        const imageKeys = getPersonImageKeys(record.id)
        if (imageKeys.length === 0) return null
        
        return (
          <Checkbox
            checked={isPersonFullySelected(record.id)}
            indeterminate={isPersonIndeterminate(record.id)}
            onChange={(e) => {
              e.stopPropagation()
              onPersonSelect(record.id, e.target.checked)
            }}
            onClick={(e) => e.stopPropagation()}
          />
        )
      }
    },
    {
      title: '缩略图',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      width: 120,
      render: (text, record) => {
        const images = imageDataMap.get(record.id) || []
        const hasImages = images.length > 0
        const isExpanded = expandedRows.has(record.id)
        
        return (
          <Space size="small" align="center">
            <Avatar 
              src={record.avatar} 
              size={50}
              icon={!record.avatar && <EyeOutlined />}
            />
            {hasImages && (
              <Button
                type="text"
                icon={isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
                onClick={(e) => {
                  e.stopPropagation()
                  onExpand(record.id)
                }}
                style={{ 
                  padding: 0,
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
            )}
          </Space>
        )
      }
    },
    {
      title: 'Face ID',
      dataIndex: 'faceId',
      key: 'faceId',
      width: 150,
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: '主播名称',
      dataIndex: 'internalName',
      key: 'internalName',
      width: 150
    },
    {
      title: '对外人物名',
      dataIndex: 'externalName',
      key: 'externalName',
      width: 150
    },
    {
      title: '类型',
      dataIndex: 'sourceType',
      key: 'sourceType',
      width: 120,
      render: (text) => {
        const typeMap = {
          'VIRTUAL_MAN_TYPE_SELF_PRESET': { label: '自研预设数字人', color: 'blue' },
          'VIRTUAL_MAN_TYPE_SELF_GENERATED': { label: '自研生成数字人', color: 'cyan' },
          'VIRTUAL_MAN_TYPE_TENCENT_CLOUD': { label: '腾讯云数字人', color: 'purple' }
        }
        const type = typeMap[text] || { label: text, color: 'default' }
        return <Tag color={type.color}>{type.label}</Tag>
      }
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      render: (text) => text === 'male' ? '男' : '女'
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      width: 80,
      render: (text) => {
        const ageMap = {
          'child': '少儿',
          'youth': '青年',
          'middle': '中年',
          'elder': '老年'
        }
        return ageMap[text] || text
      }
    },
    {
      title: '资产统计',
      dataIndex: 'assetStats',
      key: 'assetStats',
      width: 120,
      render: (text, record) => {
        const total = record.images?.length || 0
        const shelved = record.images?.filter(img => img.shelfStatus === 'shelved').length || 0
        return `共${total}个，${shelved}个上架`
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (text, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => setEditingPerson(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个人物吗？这将删除该人物下的所有形象。"
            onConfirm={() => onDeletePerson(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  // 形象行（子级）的列定义
  const imageColumns = [
    {
      title: '',
      key: 'selection',
      width: 60,
      className: 'image-table-header-cell',
      render: (text, record) => (
        <Checkbox
          checked={selectedImageKeys.has(`image-${record.id}`)}
          onChange={(e) => {
            const newSelected = new Set(selectedImageKeys)
            if (e.target.checked) {
              newSelected.add(`image-${record.id}`)
            } else {
              newSelected.delete(`image-${record.id}`)
            }
            onSelectionChange(Array.from(newSelected))
          }}
        />
      )
    },
    {
      title: '缩略图',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      width: 100,
      className: 'image-table-header-cell',
      render: (text, record) => (
        <Popover
          content={
            record.previewUrl ? (
              record.previewUrl.includes('.mp4') || record.previewUrl.includes('video') ? (
                <video
                  src={record.previewUrl}
                  width={300}
                  autoPlay
                  loop
                  muted
                  style={{ display: 'block' }}
                />
              ) : (
                <img src={record.previewUrl || record.thumbnail} width={300} alt="预览" />
              )
            ) : (
              <img src={record.thumbnail} width={300} alt="预览" />
            )
          }
          trigger="hover"
          placement="right"
        >
          <Avatar 
            src={record.thumbnail} 
            size={60}
            shape="square"
            icon={!record.thumbnail && <EyeOutlined />}
            style={{ cursor: 'pointer' }}
          />
        </Popover>
      )
    },
    {
      title: '形象Key',
      dataIndex: 'imageKey',
      key: 'imageKey',
      width: 150,
      className: 'image-table-header-cell',
      render: (text) => (
        <div>
          <span style={{ fontWeight: 500, marginRight: 8 }}>{text}</span>
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => {
              navigator.clipboard.writeText(text)
              message.success('形象Key已复制')
            }}
          />
        </div>
      )
    },
    {
      title: '对外形象名称',
      dataIndex: 'externalImageName',
      key: 'externalImageName',
      width: 200,
      className: 'image-table-header-cell',
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: '风格',
      dataIndex: 'styles',
      key: 'styles',
      width: 150,
      className: 'image-table-header-cell',
      render: (styles) => (
        <Space size="small">
          {styles?.map((style, idx) => (
            <Tag key={idx}>{style}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: '赛道',
      dataIndex: 'industry',
      key: 'industry',
      width: 120,
      className: 'image-table-header-cell',
      render: (text) => text && <Tag color="purple">{text}</Tag>
    },
    ...(isPrivate ? [{
      title: '所属用户',
      dataIndex: 'userId',
      key: 'userId',
      width: 120,
      className: 'image-table-header-cell',
      render: (text) => {
        if (!text) return '-'
        const value = String(text)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .join(',')
        return value || '-'
      }
    }] : []),
    {
      title: '上架状态',
      dataIndex: 'shelfStatus',
      key: 'shelfStatus',
      width: 180,
      className: 'image-table-header-cell',
      render: (text, record) => {
        const tag = (
          <Tag color={text === 'shelved' ? 'green' : 'default'}>
            {text === 'shelved' ? '已上架' : '未上架'}
          </Tag>
        )

        return (
          <Space size="small" align="center">
            {record.unshelveReason ? (
              <Tooltip title={`下架原因：${record.unshelveReason}`}>
                {tag}
              </Tooltip>
            ) : (
              tag
            )}
            {text === 'shelved' ? (
              <Button
                type="link"
                size="small"
                onClick={() => onShelfStatusChange(record.personId, record.id, 'unshelved')}
              >
                下架
              </Button>
            ) : (
              <Button
                type="link"
                size="small"
                onClick={() => onShelfStatusChange(record.personId, record.id, 'shelved')}
              >
                上架
              </Button>
            )}
          </Space>
        )
      }
    },
    {
      title: '授权开始时间',
      dataIndex: 'authStartTime',
      key: 'authStartTime',
      width: 120,
      className: 'image-table-header-cell',
      render: (text) => text || '-'
    },
    {
      title: '授权结束时间',
      dataIndex: 'authEndTime',
      key: 'authEndTime',
      width: 120,
      className: 'image-table-header-cell',
      render: (text, record) => {
        if (!text) return '-'
        const daysRemaining = checkAuthorizationExpiry(text, true)
        let color = 'green'
        if (daysRemaining !== null) {
          if (daysRemaining <= 0) color = 'red'
          else if (daysRemaining <= 30) color = 'orange'
        }
        return (
          <span style={{ color }}>
            {text}
            {daysRemaining !== null && (
              <Tag color={color} style={{ marginLeft: 4, fontSize: 10 }}>
                {daysRemaining > 0 ? `剩余${daysRemaining}天` : '已过期'}
              </Tag>
            )}
          </span>
        )
      }
    },
    {
      title: '失效时间',
      dataIndex: 'expireTime',
      key: 'expireTime',
      width: 120,
      className: 'image-table-header-cell',
      render: (text) => text || '-'
    },
    {
      title: '详细参数',
      key: 'detail',
      width: 120,
      className: 'image-table-header-cell',
      render: (text, record) => {
        const detailContent = (
          <div style={{ width: 300 }}>
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
          <Popover content={detailContent} title="详细参数" trigger="click">
            <Button type="link" size="small">查看</Button>
          </Popover>
        )
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      className: 'image-table-header-cell',
      render: (text, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<SettingOutlined />}
            onClick={() => setEditingImage(record)}
            title="编辑形象"
          />
          <Popconfirm
            title="确定要删除这个形象吗？"
            onConfirm={() => onDeleteImage(record.personId, record.id, record.shelfStatus)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<CloseOutlined />}
              title="删除形象"
            />
          </Popconfirm>
        </Space>
      )
    }
  ]

  // 构建表格数据
  const personData = []
  const imageDataMap = new Map()
  
  data.forEach(person => {
    const isExpanded = expandedRows.has(person.id)
    personData.push({
      key: `person-${person.id}`,
      ...person,
      isExpanded
    })

    // 存储该人物的形象数据
    if (person.images && person.images.length > 0) {
      imageDataMap.set(person.id, person.images.map(image => ({
        key: `image-${image.id}`,
        ...image,
        personId: person.id,
        personName: person.externalName
      })))
    }
  })

  return (
    <div className="tree-table-container">
      {/* 人物表格 */}
      <Table
        columns={personColumns}
        dataSource={personData}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: () => `共 ${totalPersons} 个人物，${totalImages} 个形象`
        }}
        rowClassName="person-row"
        expandable={{
          expandedRowKeys: Array.from(expandedRows).map(id => `person-${id}`),
          onExpand: (expanded, record) => {
            onExpand(record.id)
          },
          expandIcon: () => null, // 隐藏默认展开图标，使用自定义的
          indentSize: 0,
          expandedRowRender: (record) => {
            const images = imageDataMap.get(record.id) || []
            
            return (
              <div className="expanded-image-container">
                {/* L型连接线 */}
                <div className="connection-line">
                  <div className="connection-line-vertical"></div>
                  <div className="connection-line-horizontal"></div>
                </div>
                
                {/* 子表格容器 */}
                {images.length > 0 ? (
                  <div className="image-table-wrapper">
                    <Table
                      columns={imageColumns}
                      dataSource={images}
                      pagination={false}
                      rowClassName="image-row"
                      size="small"
                      className="image-table"
                    />
                  </div>
                ) : (
                  <div className="empty-image-state">
                    <span style={{ color: '#999', fontSize: 14 }}>
                      暂无形象
                    </span>
                  </div>
                )}
              </div>
            )
          }
        }}
      />


      {editingPerson && (
        <EditPersonModal
          visible={!!editingPerson}
          person={editingPerson}
          onCancel={() => setEditingPerson(null)}
          onOk={(data) => {
            onEditPerson(editingPerson.id, data)
            setEditingPerson(null)
          }}
          existingFaceIds={data.filter(p => p.id !== editingPerson.id).map(p => p.faceId)}
        />
      )}

      {editingImage && (
        <EditImageModal
          visible={!!editingImage}
          image={editingImage}
          personName={editingImage.personName}
          isPrivate={isPrivate}
          onCancel={() => setEditingImage(null)}
          onOk={(data) => {
            onEditImage(editingImage.personId, editingImage.id, data)
            setEditingImage(null)
          }}
          onShelfStatusChange={(status) => {
            onShelfStatusChange(editingImage.personId, editingImage.id, status)
          }}
        />
      )}
    </div>
  )
}

export default TreeTable

