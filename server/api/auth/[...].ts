import { NuxtAuthHandler } from '#auth'
import GoogleProvider from 'next-auth/providers/google'

console.log('Auth handler environment:', {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set',
    NUXT_SESSION_PASSWORD: process.env.NUXT_SESSION_PASSWORD ? 'Set' : 'Not set',
    NUXT_AUTH_ORIGIN: process.env.NUXT_AUTH_ORIGIN,
    ORIGIN: process.env.ORIGIN,
    NUXT_PUBLIC_SITE_URL: process.env.NUXT_PUBLIC_SITE_URL
})

const origin = process.env.NUXT_AUTH_ORIGIN || process.env.ORIGIN || process.env.NUXT_PUBLIC_SITE_URL || 'https://trackhub.up.railway.app'

export default NuxtAuthHandler({
    providers: [
        GoogleProvider.default({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        })
    ],
    secret: process.env.NUXT_SESSION_PASSWORD,
    pages: {
        signIn: '/auth/login'
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
            }
            return session
        }
    },
    // Add this line to set the origin explicitly
    origin: origin
})

console.log('Auth handler configured with origin:', origin)