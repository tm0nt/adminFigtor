// auth.ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { query } from "@/lib/db"
import bcrypt from "bcryptjs"
import authConfig from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (creds) => {
        try {
          const email = (creds?.email as string ?? "").toLowerCase().trim()
          const password = creds?.password as string ?? ""
          
          console.log("🔐 Tentando login com:", email)
          
          if (!email || !password) {
            console.log("❌ Email ou senha não fornecidos")
            return null
          }

          // Buscar admin na tabela Admin
          const { rows } = await query<{
            id: string
            email: string
            name: string
            password: string
            role: string
            isActive: boolean
          }>(
            `SELECT "id", "email", "name", "password", "role", "isActive"
             FROM public."Admin"
             WHERE "email" = $1
             LIMIT 1`,
            [email],
          )

          console.log("👤 Admin encontrado:", rows[0] ? "Sim" : "Não")

          const admin = rows[0]
          
          // Verificar se admin existe
          if (!admin) {
            console.log("❌ Admin não encontrado no banco")
            return null
          }
          
          if (!admin.password) {
            console.log("❌ Admin sem senha cadastrada")
            return null
          }
          
          // Verificar se está ativo
          if (!admin.isActive) {
            console.log("❌ Admin está desativado")
            return null
          }

          // Verificar senha
          console.log("🔑 Verificando senha...")
          const ok = await bcrypt.compare(password, admin.password)
          
          if (!ok) {
            console.log("❌ Senha incorreta")
            return null
          }

          console.log("✅ Login bem-sucedido!")

          // Atualizar lastLoginAt
          await query(
            `UPDATE public."Admin" 
             SET "lastLoginAt" = NOW(), "updatedAt" = NOW()
             WHERE "id" = $1`,
            [admin.id]
          )

          return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
          }
        } catch (error) {
          console.error("💥 Erro durante authorize:", error)
          return null
        }
      },
    }),
  ],
})
