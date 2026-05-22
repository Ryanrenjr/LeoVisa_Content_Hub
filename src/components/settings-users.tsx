'use client'

import { useState, useTransition, useRef } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Loader2, UserPlus, X } from 'lucide-react'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { createUser, deleteUser } from '@/app/(dashboard)/settings/actions'
import { toast } from 'sonner'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type UserRow = {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

// ─── Config ───────────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; hint: string }> = {
  ADMIN:     { label: '管理员',  color: '#0071E3', bg: 'rgba(0,113,227,0.1)',  hint: '所有权限，可管理用户' },
  PUBLISHER: { label: '分发执行', color: '#6E3FFB', bg: 'rgba(110,63,251,0.1)', hint: '负责内容分发到各账号' },
  EDITOR:    { label: '内容编辑', color: '#34C759', bg: 'rgba(52,199,89,0.1)',  hint: '负责选题与内容制作' },
}

const ease = [0.4, 0, 0.2, 1] as const

function avatarColor(name: string): string {
  const colors = ['#0071E3', '#6E3FFB', '#FF9500', '#34C759', '#FF3B30']
  return colors[name.charCodeAt(0) % colors.length]
}

// ─── Add user form ────────────────────────────────────────────────────────────

function AddUserForm({ onClose }: { onClose: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const data = new FormData(formRef.current!)
    startTransition(async () => {
      const err = await createUser(data)
      if (err) {
        setError(err)
      } else {
        toast.success('账号已创建')
        onClose()
      }
    })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(0,0,0,0.1)',
    background: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
    color: '#1D1D1F',
    letterSpacing: '-0.01em',
    outline: 'none',
    fontFamily: 'inherit',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#86868B',
    fontWeight: 500,
    letterSpacing: '-0.01em',
    marginBottom: '6px',
    display: 'block',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease }}
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,113,227,0.15)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(0,113,227,0.08)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1D1D1F', letterSpacing: '-0.022em' }}>
          添加新成员
        </h3>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#86868B', display: 'flex', padding: '4px' }}
        >
          <X size={16} />
        </button>
      </div>

      <form ref={formRef} onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>姓名</label>
            <input name="name" required placeholder="例：Winnie" style={inputStyle}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#0071E3' }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'rgba(0,0,0,0.1)' }}
            />
          </div>
          <div>
            <label style={labelStyle}>邮箱</label>
            <input name="email" type="email" required placeholder="例：winnie@company.com" style={inputStyle}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#0071E3' }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'rgba(0,0,0,0.1)' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>初始密码</label>
            <input name="password" type="password" required placeholder="至少 8 位" style={inputStyle}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#0071E3' }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'rgba(0,0,0,0.1)' }}
            />
          </div>
          <div>
            <label style={labelStyle}>角色</label>
            <select name="role" defaultValue="EDITOR" style={{ ...inputStyle, cursor: 'pointer' }}>
              {Object.entries(ROLE_CONFIG).map(([val, cfg]) => (
                <option key={val} value={val}>{cfg.label} — {cfg.hint}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p style={{ fontSize: '13px', color: '#FF3B30', marginBottom: '12px', letterSpacing: '-0.01em' }}>
            ⚠ {error}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '8px 18px', borderRadius: '999px', fontSize: '14px', border: '1px solid rgba(0,0,0,0.12)', background: 'transparent', color: '#6E6E73', cursor: 'pointer' }}
          >
            取消
          </button>
          <button
            type="submit"
            disabled={pending}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 18px', borderRadius: '999px', fontSize: '14px', fontWeight: 600,
              border: 'none', background: '#0071E3', color: '#fff',
              cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.7 : 1,
            }}
          >
            {pending && <Loader2 size={13} className="animate-spin" />}
            创建账号
          </button>
        </div>
      </form>
    </motion.div>
  )
}

// ─── User row ─────────────────────────────────────────────────────────────────

function UserRowItem({ user, isSelf }: { user: UserRow; isSelf: boolean }) {
  const [deleting, startDelete] = useTransition()
  const cfg = ROLE_CONFIG[user.role] ?? ROLE_CONFIG.EDITOR
  const color = avatarColor(user.name)
  const date = new Date(user.createdAt)
  const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`

  function handleDelete() {
    startDelete(async () => {
      try {
        await deleteUser(user.id)
        toast.success(`已删除 ${user.name} 的账号`)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '删除失败')
      }
    })
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '14px 20px',
      borderRadius: '12px',
      background: 'rgba(255,255,255,0.7)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255,255,255,0.85)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 4px rgba(0,0,0,0.04)',
      opacity: deleting ? 0.5 : 1,
      transition: 'opacity 0.2s',
    }}>
      {/* Avatar */}
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%', background: color, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: '14px', fontWeight: 700,
      }}>
        {user.name[0]?.toUpperCase()}
      </div>

      {/* Name + email */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#1D1D1F', letterSpacing: '-0.022em' }}>
            {user.name}
          </span>
          {isSelf && (
            <span style={{ fontSize: '10px', color: '#86868B', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', padding: '1px 6px' }}>
              你
            </span>
          )}
        </div>
        <div style={{ fontSize: '12px', color: '#86868B', letterSpacing: '-0.01em', marginTop: '2px' }}>
          {user.email}
        </div>
      </div>

      {/* Role badge */}
      <span style={{
        fontSize: '11px', fontWeight: 600, letterSpacing: '-0.01em',
        color: cfg.color, background: cfg.bg, borderRadius: '999px', padding: '3px 10px', flexShrink: 0,
      }}>
        {cfg.label}
      </span>

      {/* Created date */}
      <span style={{ fontSize: '11px', color: '#AEAEB2', whiteSpace: 'nowrap', flexShrink: 0, letterSpacing: '-0.01em' }}>
        {dateStr}
      </span>

      {/* Delete */}
      {isSelf ? (
        <div style={{ width: '28px', flexShrink: 0 }} />
      ) : (
        <AlertDialog>
          <AlertDialogTrigger
            disabled={deleting}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '28px', height: '28px', borderRadius: '8px', border: 'none',
              background: 'transparent', color: '#C7C7CC', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,59,48,0.08)'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#FF3B30'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#C7C7CC'
            }}
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </AlertDialogTrigger>
          <AlertDialogContent style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.08)' }}>
            <AlertDialogHeader>
              <AlertDialogTitle style={{ fontSize: '17px', fontWeight: 600, letterSpacing: '-0.022em' }}>
                确认删除账号？
              </AlertDialogTitle>
              <AlertDialogDescription style={{ fontSize: '14px', color: '#6E6E73', letterSpacing: '-0.01em', lineHeight: 1.6 }}>
                将删除 <strong>{user.name}</strong>（{user.email}）的登录权限。此操作不可恢复。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel style={{ borderRadius: '999px', fontSize: '14px' }}>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                style={{ borderRadius: '999px', fontSize: '14px', background: '#FF3B30', border: 'none' }}
              >
                确认删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

interface SettingsUsersProps {
  users: UserRow[]
  currentUserId: string
}

export function SettingsUsers({ users, currentUserId }: SettingsUsersProps) {
  const [showForm, setShowForm] = useState(false)

  const gradientText: React.CSSProperties = {
    display: 'inline-block',
    backgroundImage: 'linear-gradient(135deg, #1D1D1F 0%, #6E3FFB 50%, #0071E3 100%)',
    WebkitBackgroundClip: 'text', backgroundClip: 'text',
    WebkitTextFillColor: 'transparent', color: 'transparent',
  }

  return (
    <div style={{ padding: '0 24px 100px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{ marginTop: '56px', marginBottom: '36px' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.07 }}>
            <span style={gradientText}>用户管理</span>
          </h1>
          <button
            onClick={() => setShowForm((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 18px', borderRadius: '999px', fontSize: '14px', fontWeight: 600,
              border: 'none', background: showForm ? '#6E6E73' : '#0071E3', color: '#fff',
              cursor: 'pointer', transition: 'background 0.2s', letterSpacing: '-0.01em',
              boxShadow: showForm ? 'none' : '0 4px 12px rgba(0,113,227,0.25)',
            }}
          >
            {showForm ? <X size={13} /> : <UserPlus size={13} />}
            {showForm ? '收起' : '添加成员'}
          </button>
        </div>
        <p style={{ fontSize: '16px', color: '#6E6E73', letterSpacing: '-0.01em' }}>
          共 {users.length} 位成员 · 仅管理员可见
        </p>
      </motion.div>

      {/* Add user form */}
      {showForm && <AddUserForm onClose={() => setShowForm(false)} />}

      {/* User list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {users.map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05, ease: [0.4, 0, 0.2, 1] }}
          >
            <UserRowItem user={user} isSelf={user.id === currentUserId} />
          </motion.div>
        ))}
      </div>

      {/* Role legend */}
      <div style={{
        marginTop: '32px', padding: '16px 20px', borderRadius: '12px',
        background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)',
      }}>
        <p style={{ fontSize: '11px', color: '#86868B', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '10px', textTransform: 'uppercase' }}>
          角色说明
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: cfg.color, background: cfg.bg, borderRadius: '999px', padding: '2px 8px' }}>
                {cfg.label}
              </span>
              <span style={{ fontSize: '12px', color: '#86868B', letterSpacing: '-0.01em' }}>{cfg.hint}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
