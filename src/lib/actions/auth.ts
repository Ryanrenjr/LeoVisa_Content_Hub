'use server'

import { AuthError } from 'next-auth'
import { signIn, signOut } from '@/auth'

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  const callbackUrl = (formData.get('callbackUrl') as string | null) ?? '/'
  try {
    await signIn('credentials', {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      redirectTo: callbackUrl,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return '邮箱或密码错误，请检查后重试'
        default:
          return '出错了，请稍后再试'
      }
    }
    throw error
  }
}

export async function handleSignOut() {
  await signOut({ redirectTo: '/login' })
}
