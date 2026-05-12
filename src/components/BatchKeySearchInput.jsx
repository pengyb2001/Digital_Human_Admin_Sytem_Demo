import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Input, Button, Tag, Modal, message } from 'antd'
import { UnorderedListOutlined } from '@ant-design/icons'
import './BatchKeySearchInput.css'

const MAX_KEYS = 500

function parseLines(text) {
  return text
    .split(/[\r\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function dedupeMerge(existing, incoming) {
  const seen = new Set(
    existing.map((k) => k.toLowerCase())
  )
  const next = [...existing]
  for (const k of incoming) {
    const low = k.toLowerCase()
    if (seen.has(low)) continue
    seen.add(low)
    next.push(k)
  }
  return next.slice(0, MAX_KEYS)
}

function BatchKeySearchInput({
  labelTitle,
  placeholder,
  keys,
  onKeysChange,
  modalTitle,
  tagLabelPrefix,
  modalHint,
  pastePlaceholder
}) {
  const [draft, setDraft] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [draftKeys, setDraftKeys] = useState([])
  const wasModalOpenRef = useRef(false)

  useEffect(() => {
    if (modalOpen && !wasModalOpenRef.current) {
      setDraftKeys([...keys])
      setPasteText('')
    }
    wasModalOpenRef.current = modalOpen
  }, [modalOpen, keys])

  const count = keys.length

  const setKeysCapped = (next) => {
    if (next.length > MAX_KEYS) {
      message.warning(`最多添加 ${MAX_KEYS} 个 Key，已截取前 ${MAX_KEYS} 个`)
      onKeysChange(next.slice(0, MAX_KEYS))
      return
    }
    onKeysChange(next)
  }

  const addSingle = (raw) => {
    const v = raw.trim()
    if (!v) return
    const exists = keys.some((k) => k.toLowerCase() === v.toLowerCase())
    if (exists) return
    setKeysCapped([...keys, v])
  }

  const handlePressEnter = (e) => {
    e.preventDefault()
    addSingle(draft)
    setDraft('')
  }

  const handleTagClose = (e) => {
    e?.stopPropagation?.()
    onKeysChange([])
  }

  const handleModalOk = () => {
    const fromPaste = parseLines(pasteText)
    let merged = dedupeMerge(draftKeys, fromPaste)
    if (merged.length > MAX_KEYS) {
      message.warning(`最多添加 ${MAX_KEYS} 个 Key，已截取前 ${MAX_KEYS} 个`)
      merged = merged.slice(0, MAX_KEYS)
    }
    onKeysChange(merged)
    setModalOpen(false)
  }

  const removeDraftKey = (k) => {
    setDraftKeys(draftKeys.filter((x) => x !== k))
  }

  const tagText = useMemo(
    () => `${tagLabelPrefix} · ${count}`,
    [tagLabelPrefix, count]
  )

  return (
    <div className="batch-key-search-input">
      <div className="batch-key-search-input-inner">
        {count > 0 && (
          <Tag
            color="blue"
            closable
            onClose={handleTagClose}
            className="batch-key-search-tag"
            onClick={() => setModalOpen(true)}
          >
            {tagText}
          </Tag>
        )}
        <Input
          className="batch-key-search-field"
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onPressEnter={handlePressEnter}
          bordered={false}
          allowClear
          aria-label={labelTitle}
        />
        <Button
          type="link"
          size="small"
          icon={<UnorderedListOutlined />}
          onClick={() => setModalOpen(true)}
        >
          批量
        </Button>
      </div>

      <Modal
        title={modalTitle}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleModalOk}
        okText="确定"
        cancelText="取消"
        width={520}
        destroyOnClose
      >
        <p className="batch-key-modal-hint">
          {modalHint ?? (
            <>在下方粘贴多行 Key，每行一个；可与「已添加列表」合并，最多 {MAX_KEYS} 个。</>
          )}
        </p>
        <Input.TextArea
          rows={8}
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder={pastePlaceholder ?? '粘贴多行 Key，每行一个'}
          style={{ marginBottom: 12 }}
        />
        <div className="batch-key-modal-section-title">已添加列表</div>
        <div className="batch-key-modal-list">
          {draftKeys.length === 0 ? (
            <span className="batch-key-modal-empty">暂无</span>
          ) : (
            draftKeys.map((k) => (
              <Tag
                key={k}
                closable
                onClose={() => removeDraftKey(k)}
                style={{ marginBottom: 8 }}
              >
                {k}
              </Tag>
            ))
          )}
        </div>
        <div className="batch-key-modal-footer-count">
          当前已添加 {draftKeys.length} / {MAX_KEYS} 个
        </div>
      </Modal>
    </div>
  )
}

export default BatchKeySearchInput
export { MAX_KEYS }
