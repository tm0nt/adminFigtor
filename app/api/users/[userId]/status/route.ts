// app/api/users/[userId]/status/route.ts
import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/auth"

export const runtime = "nodejs"

export async function PATCH(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { isActive } = await req.json()
    const { userId } = await context.params // CORRIGIDO: await context.params

    console.log("🔄 Atualizando status do usuário:", userId, "para", isActive)

    // Se isActive é false, vamos remover a senha (desativar usuário)
    if (!isActive) {
      await query(
        `UPDATE public."User" 
         SET "passwordHash" = NULL, "updatedAt" = NOW()
         WHERE "id" = $1`,
        [userId]
      )
    }
    // Se isActive é true, usuário continua sem senha (precisa redefinir)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Erro ao atualizar status:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
