// app/api/admin/change-password/route.ts
import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/auth"
import bcrypt from "bcryptjs"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "A nova senha deve ter no mínimo 8 caracteres" }, { status: 400 })
    }

    // Buscar senha atual
    const { rows } = await query(
      `SELECT password FROM public."Admin" WHERE id = $1`,
      [session.user.id]
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: "Admin não encontrado" }, { status: 404 })
    }

    // Verificar senha atual
    const isValid = await bcrypt.compare(currentPassword, rows[0].password)
    if (!isValid) {
      return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 })
    }

    // Hash da nova senha
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    // Atualizar senha
    await query(
      `UPDATE public."Admin"
       SET password = $1, "updatedAt" = NOW()
       WHERE id = $2`,
      [newPasswordHash, session.user.id]
    )

    return NextResponse.json({ success: true, message: "Senha alterada com sucesso" })
  } catch (error: any) {
    console.error("Erro ao alterar senha:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}
