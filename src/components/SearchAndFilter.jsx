import React from 'react'
import { Row, Col, Input, Select, Tag } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import './SearchAndFilter.css'

const { Option } = Select

// Tag渲染函数
const tagRender = (props) => {
  const { label, value, closable, onClose } = props
  const onPreventMouseDown = (event) => {
    event.preventDefault()
    event.stopPropagation()
  }
  return (
    <Tag
      color="blue"
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
      style={{ marginRight: 3 }}
    >
      {label}
    </Tag>
  )
}

function SearchAndFilter({ searchParams, onSearchChange, isPrivate }) {
  const handleSearchChange = (key, value) => {
    onSearchChange({
      ...searchParams,
      [key]: value
    })
  }

  // 选项数据
  const styleOptions = ['商务', '休闲', '正式', '运动', '红衣', '蓝衣']
  const industryOptions = ['本地生活', '食品饮料', '通用']
  const professionOptions = ['主持人', '导购', '讲师', '销售', '客服']
  const poseOptions = ['站立', '坐姿', '行走', '手势']
  const proportionOptions = ['全身', '半身', '特写']
  const seasonOptions = ['春季', '夏季', '秋季', '冬季']
  const sceneOptions = ['室内', '户外', '商场', '会议室', '办公室', '客厅']

  return (
    <div className="search-filter-container">
      <Row gutter={[16, 16]}>
        <Col span={isPrivate ? 6 : 8}>
          <Input
            placeholder="搜索 Face ID/主播名称/对外人物名称"
            prefix={<SearchOutlined />}
            value={searchParams.personSearch}
            onChange={(e) => handleSearchChange('personSearch', e.target.value)}
            allowClear
          />
        </Col>
        <Col span={isPrivate ? 6 : 8}>
          <Input
            placeholder="搜索 形象Key/对外形象名称"
            prefix={<SearchOutlined />}
            value={searchParams.imageSearch}
            onChange={(e) => handleSearchChange('imageSearch', e.target.value)}
            allowClear
          />
        </Col>
        {isPrivate && (
          <Col span={6}>
            <Input
              placeholder="搜索所属客户"
              prefix={<SearchOutlined />}
              value={searchParams.customerSearch}
              onChange={(e) => handleSearchChange('customerSearch', e.target.value)}
              allowClear
            />
          </Col>
        )}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={6}>
          <Select
            value={searchParams.format}
            onChange={(value) => handleSearchChange('format', value)}
            style={{ width: '100%' }}
          >
            <Option value="all">全部版式</Option>
            <Option value="horizontal">横版</Option>
            <Option value="vertical">竖版</Option>
          </Select>
        </Col>
        <Col span={6}>
          <Select
            value={searchParams.authStatus}
            onChange={(value) => handleSearchChange('authStatus', value)}
            style={{ width: '100%' }}
          >
            <Option value="all">全部授权状态</Option>
            <Option value="active">
              <span>生效中 <Tag color="green" style={{ marginLeft: 4 }}>●</Tag></span>
            </Option>
            <Option value="expiring">
              <span>即将过期 <Tag color="orange" style={{ marginLeft: 4 }}>●</Tag></span>
            </Option>
            <Option value="expired">
              <span>已过期 <Tag color="red" style={{ marginLeft: 4 }}>●</Tag></span>
            </Option>
          </Select>
        </Col>
        <Col span={6}>
          <Select
            value={searchParams.shelfStatus}
            onChange={(value) => handleSearchChange('shelfStatus', value)}
            style={{ width: '100%' }}
          >
            <Option value="all">全部上架状态</Option>
            <Option value="unshelved">未上架</Option>
            <Option value="shelved">已上架</Option>
          </Select>
        </Col>
        <Col span={6}>
          <Select
            value={searchParams.sourceType}
            onChange={(value) => handleSearchChange('sourceType', value)}
            style={{ width: '100%' }}
            placeholder="类型"
          >
            <Option value="all">全部类型</Option>
            <Option value="VIRTUAL_MAN_TYPE_SELF_PRESET">自研预设数字人</Option>
            <Option value="VIRTUAL_MAN_TYPE_SELF_GENERATED">自研生成数字人</Option>
            <Option value="VIRTUAL_MAN_TYPE_TENCENT_CLOUD">腾讯云数字人</Option>
          </Select>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={6}>
          <Select
            value={searchParams.gender}
            onChange={(value) => handleSearchChange('gender', value)}
            style={{ width: '100%' }}
            placeholder="性别"
          >
            <Option value="all">全部性别</Option>
            <Option value="male">男</Option>
            <Option value="female">女</Option>
          </Select>
        </Col>
        <Col span={6}>
          <Select
            value={searchParams.age}
            onChange={(value) => handleSearchChange('age', value)}
            style={{ width: '100%' }}
            placeholder="年龄"
          >
            <Option value="all">全部年龄</Option>
            <Option value="child">少儿</Option>
            <Option value="youth">青年</Option>
            <Option value="middle">中年</Option>
            <Option value="elder">老年</Option>
          </Select>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={6}>
          <Select
            mode="multiple"
            value={searchParams.styles || []}
            onChange={(value) => handleSearchChange('styles', value)}
            style={{ width: '100%' }}
            placeholder="风格（可多选）"
            tagRender={tagRender}
            allowClear
          >
            {styleOptions.map(style => (
              <Option key={style} value={style}>{style}</Option>
            ))}
          </Select>
        </Col>
        <Col span={6}>
          <Select
            mode="multiple"
            value={searchParams.industries || []}
            onChange={(value) => handleSearchChange('industries', value)}
            style={{ width: '100%' }}
            placeholder="赛道（可多选）"
            tagRender={tagRender}
            allowClear
          >
            {industryOptions.map(industry => (
              <Option key={industry} value={industry}>{industry}</Option>
            ))}
          </Select>
        </Col>
        <Col span={6}>
          <Select
            mode="multiple"
            value={searchParams.professions || []}
            onChange={(value) => handleSearchChange('professions', value)}
            style={{ width: '100%' }}
            placeholder="职业（可多选）"
            tagRender={tagRender}
            allowClear
          >
            {professionOptions.map(profession => (
              <Option key={profession} value={profession}>{profession}</Option>
            ))}
          </Select>
        </Col>
        <Col span={6}>
          <Select
            mode="multiple"
            value={searchParams.poses || []}
            onChange={(value) => handleSearchChange('poses', value)}
            style={{ width: '100%' }}
            placeholder="姿势（可多选）"
            tagRender={tagRender}
            allowClear
          >
            {poseOptions.map(pose => (
              <Option key={pose} value={pose}>{pose}</Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={6}>
          <Select
            mode="multiple"
            value={searchParams.proportions || []}
            onChange={(value) => handleSearchChange('proportions', value)}
            style={{ width: '100%' }}
            placeholder="比例（可多选）"
            tagRender={tagRender}
            allowClear
          >
            {proportionOptions.map(proportion => (
              <Option key={proportion} value={proportion}>{proportion}</Option>
            ))}
          </Select>
        </Col>
        <Col span={6}>
          <Select
            mode="multiple"
            value={searchParams.seasons || []}
            onChange={(value) => handleSearchChange('seasons', value)}
            style={{ width: '100%' }}
            placeholder="季节（可多选）"
            tagRender={tagRender}
            allowClear
          >
            {seasonOptions.map(season => (
              <Option key={season} value={season}>{season}</Option>
            ))}
          </Select>
        </Col>
        <Col span={6}>
          <Select
            mode="multiple"
            value={searchParams.scenes || []}
            onChange={(value) => handleSearchChange('scenes', value)}
            style={{ width: '100%' }}
            placeholder="场景（可多选）"
            tagRender={tagRender}
            allowClear
          >
            {sceneOptions.map(scene => (
              <Option key={scene} value={scene}>{scene}</Option>
            ))}
          </Select>
        </Col>
      </Row>
    </div>
  )
}

export default SearchAndFilter

