import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const adminEmail = process.env.ADMIN_EMAIL
        const adminPassword = process.env.ADMIN_PASSWORD

        if (
          credentials.email !== adminEmail ||
          credentials.password !== adminPassword
        ) {
          return null
        }

        // Upsert admin user in DB
        const adminUser = await prisma.user.upsert({
          where: { email: adminEmail },
          update: {},
          create: {
            email: adminEmail,
            name: 'Admin',
            role: Role.ADMIN,
          },
        })

        return {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }

      // For Google sign-ins, fetch role from DB
      if (account?.provider === 'google' && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true },
        })
        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string
        ;(session.user as any).role = token.role as Role
      }
      return session
    },
    async signIn({ user, account }) {
      // Allow admin credentials login
      if (account?.provider === 'admin-credentials') return true

      // For Google: ensure customer user exists in DB
      if (account?.provider === 'google' && user.email) {
        await prisma.user.upsert({
          where: { email: user.email },
          update: { name: user.name ?? undefined, image: user.image ?? undefined },
          create: {
            email: user.email,
            name: user.name,
            image: user.image,
            role: Role.CUSTOMER,
          },
        })
      }
      return true
    },
  },
}
