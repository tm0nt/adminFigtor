// app/api/admins/[id]/reset-password/route.ts
import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/auth"
import bcrypt from "bcryptjs"

export const runtime = "nodejs"

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    const { id } = await context.params

    // Gerar senha aleatória
    const newPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12).toUpperCase() + "!@#"
    const passwordHash = await bcrypt.hash(newPassword, 10)

    // Atualizar senha
    const { rows } = await query(
      `UPDATE public."Admin" 
       SET password = $1, "updatedAt" = NOW()
       WHERE id = $2
       RETURNING id, email, name`,
      [passwordHash, id]
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: "Admin não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      newPassword,
      admin: rows[0]
    })
  } catch (error: any) {
    console.error("Erro ao resetar senha:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}
