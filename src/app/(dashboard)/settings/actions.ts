'use server'

import { revalidatePath } from 'next/cache'
import bcrypt from 'bcrypt'
import { auth } from '@/auth'
import { db } from '@/lib/db'

async function requireAdmin(): Promise<string> {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session?.user?.id || role !== 'ADMIN') throw new Error('权限不足，仅管理员可操作')
  return session.user.id
}

export async function createUser(formData: FormData) {
  await requireAdmin()

  const name     = (formData.get('name')     as string | null)?.trim()
  const email    = (formData.get('email')    as string | null)?.trim().toLowerCase()
  const password = (formData.get('password') as string | null)?.trim()
  const role     = (formData.get('role')     as string | null) ?? 'EDITOR'

  if (!name || !email || !password) return '请填写姓名、邮箱和密码'
  if (password.length < 8)          return '密码至少 8 位'
  if (!email.includes('@'))         return '邮箱格式不正确'

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) return '该邮箱已被注册'

  const hashed = await bcrypt.hash(password, 12)
  await db.user.create({ data: { name, email, password: hashed, role } })
  revalidatePath('/settings')
  return null // null = success
}

export async function deleteUser(userId: string) {
  const adminId = await requireAdmin()
  if (userId === adminId) throw new Error('不能删除自己的账号')

  const target = await db.user.findUnique({ where: { id: userId }, select: { role: true } })
  if (target?.role === 'ADMIN') {
    const adminCount = await db.user.count({ where: { role: 'ADMIN' } })
    if (adminCount <= 1) throw new Error('系统中至少保留一个管理员账号')
  }

  await db.user.delete({ where: { id: userId } })
  revalidatePath('/settings')
}
