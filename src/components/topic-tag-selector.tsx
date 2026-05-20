'use client'

import { useState, useTransition } from 'react'
import { Plus, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { AppleBadge } from '@/components/apple/apple-badge'
import { updateTopicTags, createTag } from '@/app/(dashboard)/topics/actions'

interface Tag { id: string; name: string }

interface TopicTagSelectorProps {
  topicId: string
  initialTags: Tag[]
  allTags: Tag[]
}

export function TopicTagSelector({ topicId, initialTags, allTags: initialAllTags }: TopicTagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>(initialTags)
  const [allTags, setAllTags] = useState<Tag[]>(initialAllTags)
  const [newTagName, setNewTagName] = useState('')
  const [pending, startTransition] = useTransition()

  const selectedIds = tags.map((t) => t.id)

  function toggleTag(tag: Tag) {
    const next = selectedIds.includes(tag.id)
      ? tags.filter((t) => t.id !== tag.id)
      : [...tags, tag]
    setTags(next)
    startTransition(async () => {
      await updateTopicTags(topicId, next.map((t) => t.id))
    })
  }

  function removeTag(id: string) {
    const next = tags.filter((t) => t.id !== id)
    setTags(next)
    startTransition(async () => {
      await updateTopicTags(topicId, next.map((t) => t.id))
    })
  }

  async function handleCreateTag() {
    const name = newTagName.trim()
    if (!name) return
    const tag = await createTag(name)
    const next = [...tags, tag]
    setTags(next)
    setAllTags((prev) => (prev.find((t) => t.id === tag.id) ? prev : [...prev, tag]))
    setNewTagName('')
    startTransition(async () => {
      await updateTopicTags(topicId, next.map((t) => t.id))
    })
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
      {/* Existing tags */}
      {tags.map((tag) => (
        <div
          key={tag.id}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'linear-gradient(135deg, rgba(0,113,227,0.10), rgba(0,113,227,0.04))',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(0,113,227,0.2)',
            borderRadius: '980px',
            padding: '4px 10px 4px 10px',
            fontSize: '12px',
            color: '#0071E3',
            fontWeight: 500,
          }}
        >
          {tag.name}
          <button
            onClick={() => removeTag(tag.id)}
            style={{
              background: 'none',
              border: 'none',
              padding: '0 0 0 2px',
              cursor: 'pointer',
              color: 'rgba(0,113,227,0.5)',
              display: 'flex',
              alignItems: 'center',
              lineHeight: 1,
            }}
            aria-label={`删除标签 ${tag.name}`}
          >
            <X size={11} />
          </button>
        </div>
      ))}

      {/* Add tag popover */}
      <Popover>
        <PopoverTrigger
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '980px',
            fontSize: '12px',
            fontWeight: 500,
            border: '1px dashed rgba(0,0,0,0.2)',
            background: 'transparent',
            color: '#6E6E73',
            cursor: 'pointer',
          }}
        >
          <Plus size={11} />
          添加标签
        </PopoverTrigger>
        <PopoverContent
          style={{
            width: '220px',
            padding: '12px',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}
        >
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#86868B', marginBottom: '10px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            选择标签
          </p>

          {/* Existing tags checkboxes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '12px' }}>
            {allTags.map((tag) => (
              <div key={tag.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Checkbox
                  id={`sel-tag-${tag.id}`}
                  checked={selectedIds.includes(tag.id)}
                  onCheckedChange={() => toggleTag(tag)}
                  disabled={pending}
                />
                <Label htmlFor={`sel-tag-${tag.id}`} style={{ fontSize: '13px', color: '#1D1D1F', cursor: 'pointer' }}>
                  {tag.name}
                </Label>
              </div>
            ))}
          </div>

          {/* Create new tag */}
          <div
            style={{
              borderTop: '1px solid rgba(0,0,0,0.06)',
              paddingTop: '10px',
              display: 'flex',
              gap: '6px',
            }}
          >
            <input
              type="text"
              placeholder="新标签名..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateTag() }}
              style={{
                flex: 1,
                fontSize: '12px',
                padding: '5px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(0,0,0,0.12)',
                outline: 'none',
                background: 'rgba(255,255,255,0.6)',
                color: '#1D1D1F',
              }}
            />
            <button
              onClick={handleCreateTag}
              disabled={!newTagName.trim()}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                background: newTagName.trim() ? '#0071E3' : '#C7C7CC',
                color: '#fff',
                cursor: newTagName.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              创建
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
