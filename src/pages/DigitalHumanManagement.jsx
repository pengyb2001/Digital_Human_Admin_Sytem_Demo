import React, { useState, useEffect, useRef } from 'react'
import { Card, Tabs, Button, message, Space, Modal } from 'antd'
import SearchAndFilter from '../components/SearchAndFilter'
import TreeTable from '../components/TreeTable'
import { mockData } from '../utils/mockData'
import { checkAuthorizationExpiry } from '../utils/authorization'
import './DigitalHumanManagement.css'

const { TabPane } = Tabs

function DigitalHumanManagement() {
  const [activeTab, setActiveTab] = useState('public') // 'public' | 'private'
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [searchParams, setSearchParams] = useState({
    batchFaceIds: [],
    batchImageKeys: [],
    customerSearch: '',
    format: 'all',
    authStatus: 'all',
    shelfStatus: 'all',
    gender: 'all',
    age: 'all',
    sourceType: 'all',
    styles: [],
    industries: [],
    professions: [],
    poses: [],
    proportions: [],
    seasons: [],
    scenes: []
  })
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [selectedImageKeys, setSelectedImageKeys] = useState(new Set()) // 选中的形象key集合
  const batchKeysNoticeRef = useRef('')

  const normalizeKey = (s) => String(s).trim().toLowerCase()

  // 批量 Key 中存在但当前库没有的项 → 提示过滤数量
  useEffect(() => {
    const f = searchParams.batchFaceIds || []
    const i = searchParams.batchImageKeys || []
    const sig = JSON.stringify({ f, i })
    if (sig === batchKeysNoticeRef.current) return
    batchKeysNoticeRef.current = sig

    if (f.length === 0 && i.length === 0) return

    const faceTokenMatchesPerson = (nk, person) =>
      normalizeKey(person.faceId) === nk ||
      (person.externalName && normalizeKey(person.externalName) === nk)

    let invalidFace = 0
    if (f.length > 0) {
      invalidFace = f.filter(
        (k) => !data.some((p) => faceTokenMatchesPerson(normalizeKey(k), p))
      ).length
    }

    const imageTokenMatches = (nk, img) =>
      normalizeKey(img.imageKey) === nk ||
      (img.externalImageName && normalizeKey(img.externalImageName) === nk)

    let invalidImg = 0
    if (i.length > 0) {
      invalidImg = i.filter(
        (k) =>
          !data.some((p) =>
            p.images?.some((img) => imageTokenMatches(normalizeKey(k), img))
          )
      ).length
    }

    const parts = []
    if (invalidFace > 0) parts.push(`${invalidFace} 条人物条件`)
    if (invalidImg > 0) parts.push(`${invalidImg} 条形象条件`)
    if (parts.length > 0) {
      message.info(`已过滤 ${parts.join('、')}（数据中不存在）`)
    }
  }, [data, searchParams.batchFaceIds, searchParams.batchImageKeys])

  // 初始化数据
  useEffect(() => {
    const initialData = mockData.filter(item => 
      item.type === (activeTab === 'public' ? 'public' : 'private')
    )
    setData(initialData)
    setFilteredData(initialData)
  }, [activeTab])

  // 每日检测授权过期
  useEffect(() => {
    const checkExpiry = () => {
      setData(prevData => {
        return prevData.map(person => {
          const updatedImages = person.images.map(image => {
            // 检查形象的授权时间（仅使用形象维度的授权时间）
            if (image.authEndTime && image.shelfStatus === 'shelved' && checkAuthorizationExpiry(image.authEndTime)) {
              return {
                ...image,
                shelfStatus: 'unshelved',
                unshelveReason: '授权过期'
              }
            }
            return image
          })
          return { ...person, images: updatedImages }
        })
      })
    }

    // 立即检查一次
    checkExpiry()
    
    // 每天检查一次
    const interval = setInterval(checkExpiry, 24 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // 筛选逻辑
  useEffect(() => {
    let result = [...data]

    const batchFace = (searchParams.batchFaceIds || [])
      .map((k) => normalizeKey(k))
      .filter(Boolean)
    const batchImg = (searchParams.batchImageKeys || [])
      .map((k) => normalizeKey(k))
      .filter(Boolean)

    if (batchFace.length > 0) {
      const faceSet = new Set(batchFace)
      result = result.filter((person) => {
        if (faceSet.has(normalizeKey(person.faceId))) return true
        if (person.externalName && faceSet.has(normalizeKey(person.externalName))) return true
        return false
      })
    }

    if (batchImg.length > 0) {
      const imgSet = new Set(batchImg)
      result = result
        .map((person) => ({
          ...person,
          images: (person.images || []).filter((img) => {
            if (imgSet.has(normalizeKey(img.imageKey))) return true
            if (img.externalImageName && imgSet.has(normalizeKey(img.externalImageName))) return true
            return false
          })
        }))
        .filter((person) => person.images.length > 0)
    }

    result = result.map((person) => ({
      ...person,
      rowThumbnailOverride:
        batchImg.length > 0
          ? person.images?.[0]?.thumbnail || person.avatar
          : undefined
    }))

    // 所属客户搜索（仅私有库）
    if (activeTab === 'private' && searchParams.customerSearch) {
      const search = searchParams.customerSearch.toLowerCase()
      result = result.filter(person => 
        person.customer?.toLowerCase().includes(search)
      )
    }

    // 版式筛选
    if (searchParams.format !== 'all') {
      result = result.map(person => ({
        ...person,
        images: person.images.filter(img => img.format === searchParams.format)
      })).filter(person => person.images.length > 0)
    }

    // 授权状态筛选（基于形象维度的授权时间）
    if (searchParams.authStatus !== 'all') {
      result = result.map(person => ({
        ...person,
        images: person.images.filter(img => {
          // 仅使用形象维度的授权时间
          if (!img.authEndTime) return false
          const daysRemaining = checkAuthorizationExpiry(img.authEndTime, true)
          if (searchParams.authStatus === 'active') {
            return daysRemaining === null || daysRemaining > 30
          } else if (searchParams.authStatus === 'expiring') {
            return daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 30
          } else if (searchParams.authStatus === 'expired') {
            return daysRemaining !== null && daysRemaining <= 0
          }
          return true
        })
      })).filter(person => person.images.length > 0)
    }

    // 上架状态筛选
    if (searchParams.shelfStatus !== 'all') {
      result = result.map(person => ({
        ...person,
        images: person.images.filter(img => {
          if (searchParams.shelfStatus === 'unshelved') return img.shelfStatus === 'unshelved'
          if (searchParams.shelfStatus === 'shelved') return img.shelfStatus === 'shelved'
          return true
        })
      })).filter(person => person.images.length > 0)
    }

    // 性别筛选
    if (searchParams.gender !== 'all') {
      result = result.filter(person => person.gender === searchParams.gender)
    }

    // 年龄筛选
    if (searchParams.age !== 'all') {
      result = result.filter(person => person.age === searchParams.age)
    }

    // 类型筛选
    if (searchParams.sourceType !== 'all') {
      result = result.filter(person => person.sourceType === searchParams.sourceType)
    }

    // 风格筛选（多选）
    if (searchParams.styles && searchParams.styles.length > 0) {
      result = result.map(person => ({
        ...person,
        images: person.images.filter(img => 
          img.styles && img.styles.some(s => searchParams.styles.includes(s))
        )
      })).filter(person => person.images.length > 0)
    }

    // 赛道筛选（多选）
    if (searchParams.industries && searchParams.industries.length > 0) {
      result = result.map(person => ({
        ...person,
        images: person.images.filter(img => 
          img.industry && searchParams.industries.includes(img.industry)
        )
      })).filter(person => person.images.length > 0)
    }

    // 职业筛选（多选）
    if (searchParams.professions && searchParams.professions.length > 0) {
      result = result.map(person => ({
        ...person,
        images: person.images.filter(img => 
          img.profession && searchParams.professions.includes(img.profession)
        )
      })).filter(person => person.images.length > 0)
    }

    // 姿势筛选（多选）
    if (searchParams.poses && searchParams.poses.length > 0) {
      result = result.map(person => ({
        ...person,
        images: person.images.filter(img => 
          img.pose && searchParams.poses.includes(img.pose)
        )
      })).filter(person => person.images.length > 0)
    }

    // 比例筛选（多选）
    if (searchParams.proportions && searchParams.proportions.length > 0) {
      result = result.map(person => ({
        ...person,
        images: person.images.filter(img => 
          img.proportion && searchParams.proportions.includes(img.proportion)
        )
      })).filter(person => person.images.length > 0)
    }

    // 季节筛选（多选）
    if (searchParams.seasons && searchParams.seasons.length > 0) {
      result = result.map(person => ({
        ...person,
        images: person.images.filter(img => 
          img.season && searchParams.seasons.includes(img.season)
        )
      })).filter(person => person.images.length > 0)
    }

    // 场景筛选（多选）
    if (searchParams.scenes && searchParams.scenes.length > 0) {
      result = result.map(person => ({
        ...person,
        images: person.images.filter(img => 
          img.scene && searchParams.scenes.includes(img.scene)
        )
      })).filter(person => person.images.length > 0)
    }

    setFilteredData(result)
  }, [data, searchParams, activeTab])

  const handleEditPerson = (personId, personData) => {
    setData(data.map(person => 
      person.id === personId ? { ...person, ...personData } : person
    ))
    message.success('人物信息更新成功')
  }

  const handleDeletePerson = (personId) => {
    const person = data.find(p => p.id === personId)
    if (!person) return
    
    // 检查该人物下是否有已上架的形象
    const hasShelvedImages = person.images?.some(img => img.shelfStatus === 'shelved')
    if (hasShelvedImages) {
      message.warning('该人物下有已上架的形象，不允许删除，请先下架所有形象')
      return
    }
    
    setData(data.filter(person => person.id !== personId))
    message.success('人物删除成功')
  }

  const handleEditImage = (personId, imageId, imageData) => {
    setData(data.map(person => 
      person.id === personId
        ? {
            ...person,
            images: person.images.map(img =>
              img.id === imageId ? { ...img, ...imageData } : img
            )
          }
        : person
    ))
    message.success('形象信息更新成功')
  }

  const handleDeleteImage = (personId, imageId, shelfStatus) => {
    if (shelfStatus === 'shelved') {
      message.warning('已上架的形象不允许删除，请先下架')
      return
    }
    setData(data.map(person => 
      person.id === personId
        ? {
            ...person,
            images: person.images.filter(img => img.id !== imageId)
          }
        : person
    ))
    message.success('形象删除成功')
  }

  const handleShelfStatusChange = (personId, imageId, newStatus) => {
    setData((prev) =>
      prev.map((person) =>
        person.id === personId
          ? {
              ...person,
              images: person.images.map((img) =>
                img.id === imageId ? { ...img, shelfStatus: newStatus } : img
              )
            }
          : person
      )
    )
    message.success(`形象已${newStatus === 'shelved' ? '上架' : '下架'}`)
  }

  const applyBatchShelfStatus = (updates, newStatus) => {
    if (updates.length === 0) return
    const key = (u) => `${u.personId}:${u.imageId}`
    const hit = new Set(updates.map(key))
    setData((prev) =>
      prev.map((person) => ({
        ...person,
        images: person.images.map((img) => {
          if (hit.has(`${person.id}:${img.id}`)) {
            return { ...img, shelfStatus: newStatus }
          }
          return img
        })
      }))
    )
  }

  const handleExpand = (personId) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(personId)) {
      newExpanded.delete(personId)
    } else {
      newExpanded.add(personId)
    }
    setExpandedRows(newExpanded)
  }

  // 获取所有形象的key（用于全选）
  const getAllImageKeys = () => {
    const keys = new Set()
    filteredData.forEach(person => {
      if (person.images && person.images.length > 0) {
        person.images.forEach(image => {
          keys.add(`image-${image.id}`)
        })
      }
    })
    return keys
  }

  // 获取人物下所有形象的key
  const getPersonImageKeys = (personId) => {
    const person = filteredData.find(p => p.id === personId)
    if (!person || !person.images) return new Set()
    return new Set(person.images.map(img => `image-${img.id}`))
  }

  // 处理选择变化
  const handleSelectionChange = (selectedKeys) => {
    setSelectedImageKeys(new Set(selectedKeys))
  }

  // 处理人物选择（选择人物时，选择其下所有形象）
  const handlePersonSelect = (personId, selected) => {
    const imageKeys = getPersonImageKeys(personId)
    const newSelected = new Set(selectedImageKeys)
    if (selected) {
      imageKeys.forEach(key => newSelected.add(key))
    } else {
      imageKeys.forEach(key => newSelected.delete(key))
    }
    setSelectedImageKeys(newSelected)
  }

  // 全选/取消全选
  const handleSelectAll = (selected) => {
    if (selected) {
      setSelectedImageKeys(getAllImageKeys())
    } else {
      setSelectedImageKeys(new Set())
    }
  }

  const collectShelveUpdates = () => {
    const updates = []
    filteredData.forEach((person) => {
      if (person.images) {
        person.images.forEach((image) => {
          const key = `image-${image.id}`
          if (selectedImageKeys.has(key) && image.shelfStatus === 'unshelved') {
            updates.push({ personId: person.id, imageId: image.id })
          }
        })
      }
    })
    return updates
  }

  const collectUnshelveUpdates = () => {
    const updates = []
    filteredData.forEach((person) => {
      if (person.images) {
        person.images.forEach((image) => {
          const key = `image-${image.id}`
          if (selectedImageKeys.has(key) && image.shelfStatus === 'shelved') {
            updates.push({ personId: person.id, imageId: image.id })
          }
        })
      }
    })
    return updates
  }

  // 批量上架
  const handleBatchShelve = () => {
    if (selectedImageKeys.size === 0) {
      message.warning('请先选择要上架的形象')
      return
    }

    const updates = collectShelveUpdates()

    if (updates.length === 0) {
      message.warning('所选形象中没有可上架的项目')
      return
    }

    Modal.confirm({
      title: '确认批量上架',
      content: `将对 ${updates.length} 个形象执行上架操作，是否继续？`,
      okText: '确认上架',
      cancelText: '取消',
      onOk: () => {
        console.info('[批量上架]', {
          count: updates.length,
          items: updates.map((u) => ({ personId: u.personId, imageId: u.imageId }))
        })
        applyBatchShelfStatus(updates, 'shelved')
        message.success(`成功上架 ${updates.length} 个形象`)
        setSelectedImageKeys(new Set())
      }
    })
  }

  // 批量下架
  const handleBatchUnshelve = () => {
    if (selectedImageKeys.size === 0) {
      message.warning('请先选择要下架的形象')
      return
    }

    const updates = collectUnshelveUpdates()

    if (updates.length === 0) {
      message.warning('所选形象中没有可下架的项目')
      return
    }

    Modal.confirm({
      title: '确认批量下架',
      content: `将对 ${updates.length} 个形象执行下架操作，是否继续？`,
      okText: '确认下架',
      cancelText: '取消',
      onOk: () => {
        console.info('[批量下架]', {
          count: updates.length,
          items: updates.map((u) => ({ personId: u.personId, imageId: u.imageId }))
        })
        applyBatchShelfStatus(updates, 'unshelved')
        message.success(`成功下架 ${updates.length} 个形象`)
        setSelectedImageKeys(new Set())
      }
    })
  }

  return (
    <div className="digital-human-management">
      <Card>
        <div className="tab-header">
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            type="card"
            size="large"
          >
            <TabPane tab="公有数字人" key="public" />
            <TabPane tab="私有数字人" key="private" />
          </Tabs>
        </div>

        <SearchAndFilter
          searchParams={searchParams}
          onSearchChange={setSearchParams}
          isPrivate={activeTab === 'private'}
        />

        <div className="table-header">
          <Space>
            <Button
              onClick={handleBatchShelve}
              disabled={selectedImageKeys.size === 0}
            >
              批量上架
            </Button>
            <Button
              onClick={handleBatchUnshelve}
              disabled={selectedImageKeys.size === 0}
            >
              批量下架
            </Button>
            {selectedImageKeys.size > 0 && (
              <span style={{ color: '#999' }}>
                已选择 {selectedImageKeys.size} 个形象
              </span>
            )}
            <span style={{ color: '#999', marginLeft: 16 }}>
              共上架 {filteredData.reduce((count, person) => 
                count + (person.images?.filter(img => img.shelfStatus === 'shelved').length || 0), 0
              )} 个形象
            </span>
          </Space>
        </div>

        <TreeTable
          data={filteredData}
          isPrivate={activeTab === 'private'}
          expandedRows={expandedRows}
          onExpand={handleExpand}
          onEditPerson={handleEditPerson}
          onDeletePerson={handleDeletePerson}
          onEditImage={handleEditImage}
          onDeleteImage={handleDeleteImage}
          onShelfStatusChange={handleShelfStatusChange}
          selectedImageKeys={selectedImageKeys}
          onSelectionChange={handleSelectionChange}
          onPersonSelect={handlePersonSelect}
          onSelectAll={handleSelectAll}
          totalPersons={filteredData.length}
          totalImages={filteredData.reduce((sum, person) => sum + (person.images?.length || 0), 0)}
          totalShelvedImages={filteredData.reduce((sum, person) => 
            sum + (person.images?.filter(img => img.shelfStatus === 'shelved').length || 0), 0
          )}
        />
      </Card>
    </div>
  )
}

export default DigitalHumanManagement

