// src/auth.config.ts
import Credentials from "next-auth/providers/credentials"

// IMPORTANTE: Este arquivo é usado no middleware (Edge Runtime)
// NÃO pode importar bcrypt, crypto, ou fazer queries de database aqui!
const authConfig = {
  session: { strategy: "jwt" as const },
  
  pages: {
    signIn: "/",
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (credentials) => {
        // A lógica real está em auth.ts
        return null
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.sub = user.id
        token.role = user.role // ✅ ADICIONAR ROLE AO TOKEN
      }
      return token
    },
    async session({ session, token }: any) {
      if (session.user && token.sub) {
        session.user.id = token.sub
        session.user.role = token.role // ✅ ADICIONAR ROLE À SESSION
      }
      return session
    },
    async redirect({ url, baseUrl }: any) {
      if (url?.startsWith("/")) return `${baseUrl}${url}`
      try {
        const u = new URL(url)
        if (u.origin === baseUrl) return url
      } catch {}
      return `${baseUrl}/dashboard`
    },
  },
}

export default authConfig
