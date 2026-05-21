import type { NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isLoginPage = nextUrl.pathname === '/login'

      if (isLoginPage) {
        if (isLoggedIn) return Response.redirect(new URL('/', nextUrl))
        return true
      }

      return isLoggedIn
    },

    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.name = user.name
        token.role = (user as { role?: string }).role ?? 'EDITOR'
      }
      return token
    },

    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.name = token.name
        ;(session.user as { role?: string }).role = token.role as string
      }
      return session
    },
  },
  providers: [],
}
