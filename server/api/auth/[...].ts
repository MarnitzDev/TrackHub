import { NuxtAuthHandler } from '#auth'
import GoogleProvider from 'next-auth/providers/google'

export default NuxtAuthHandler({
    origin: process.env.NUXT_PUBLIC_SITE_URL,
    secret: process.env.AUTH_SECRET,
    providers: [
        GoogleProvider.default({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackUrl: `${process.env.NUXT_PUBLIC_SITE_URL}/api/auth/callback/google`
        })
    ],
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
    }
})