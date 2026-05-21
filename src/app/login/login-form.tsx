'use client'

import { useActionState, useState } from 'react'
import { motion } from 'framer-motion'
import { Compass, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import { authenticate } from '@/lib/actions/auth'

// ─── Avatar color helper ──────────────────────────────────────────────────────

const gradientText: React.CSSProperties = {
  display: 'inline-block',
  background: 'linear-gradient(135deg, #0071E3 0%, #6E3FFB 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
}

// ─── Input component ──────────────────────────────────────────────────────────

function Input({
  type,
  name,
  placeholder,
  required,
  rightSlot,
}: {
  type: string
  name: string
  placeholder: string
  required?: boolean
  rightSlot?: React.ReactNode
}) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          height: '48px',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.8)',
          border: `1px solid ${focused ? '#0071E3' : 'rgba(0,0,0,0.12)'}`,
          boxShadow: focused ? '0 0 0 4px rgba(0,113,227,0.1)' : 'none',
          padding: rightSlot ? '0 48px 0 16px' : '0 16px',
          fontSize: '16px',
          color: '#1D1D1F',
          outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxSizing: 'border-box',
          letterSpacing: '-0.01em',
        }}
      />
      {rightSlot && (
        <div
          style={{
            position: 'absolute',
            right: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          {rightSlot}
        </div>
      )}
    </div>
  )
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      style={{
        width: '420px',
        maxWidth: '100%',
        padding: '48px',
        borderRadius: '24px',
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.8)',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.9), 0 24px 64px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
      }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(0,113,227,0.1), rgba(110,63,251,0.1))',
            border: '1px solid rgba(0,113,227,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
          }}
        >
          <Compass size={28} color="#0071E3" strokeWidth={1.8} />
        </div>
        <span style={{ fontSize: '20px', fontWeight: 700, color: '#1D1D1F', letterSpacing: '-0.03em' }}>
          LeoVisa
        </span>
        <span style={{ fontSize: '12px', color: '#86868B', letterSpacing: '-0.01em', marginTop: '2px' }}>
          内容生产中心
        </span>
      </motion.div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        style={{ marginBottom: '28px', textAlign: 'center' }}
      >
        <h1 style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: '6px', lineHeight: 1 }}>
          <span style={gradientText}>欢迎回来</span>
        </h1>
        <p style={{ fontSize: '14px', color: '#86868B', letterSpacing: '-0.01em' }}>
          登录以继续
        </p>
      </motion.div>

      {/* Form */}
      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Input type="email" name="email" placeholder="邮箱地址" required />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <Input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="密码"
            required
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#86868B' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
        </motion.div>

        {/* Error message */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(255,59,48,0.08)',
              border: '1px solid rgba(255,59,48,0.15)',
            }}
          >
            <AlertCircle size={14} color="#FF3B30" />
            <span style={{ fontSize: '13px', color: '#FF3B30', letterSpacing: '-0.01em' }}>
              {errorMessage}
            </span>
          </motion.div>
        )}

        {/* Submit button */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          style={{ marginTop: '6px' }}
        >
          <button
            type="submit"
            disabled={isPending}
            style={{
              width: '100%',
              height: '50px',
              borderRadius: '980px',
              border: 'none',
              background: isPending
                ? 'rgba(0,113,227,0.5)'
                : 'linear-gradient(135deg, #0071E3 0%, #6E3FFB 100%)',
              color: '#fff',
              fontSize: '17px',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              cursor: isPending ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'opacity 0.2s, transform 0.2s',
              transform: isPending ? 'none' : undefined,
            }}
            onMouseEnter={(e) => {
              if (!isPending) (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.opacity = '1'
            }}
          >
            {isPending && <Loader2 size={18} className="animate-spin" />}
            {isPending ? '登录中...' : '登录'}
          </button>
        </motion.div>
      </form>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#86868B', letterSpacing: '-0.01em' }}
      >
        首次使用？联系 Ryan 获取账号
      </motion.p>
    </motion.div>
  )
}
