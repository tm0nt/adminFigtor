// app/api/admin/profile/route.ts
import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/auth"

export const runtime = "nodejs"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { rows } = await query(
      `SELECT id, email, name, role, "isActive", "lastLoginAt", "createdAt"
       FROM public."Admin"
       WHERE id = $1`,
      [session.user.id]
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: "Admin não encontrado" }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error: any) {
    console.error("Erro ao buscar perfil:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { name } = await req.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    }

    const { rows } = await query(
      `UPDATE public."Admin"
       SET name = $1, "updatedAt" = NOW()
       WHERE id = $2
       RETURNING id, email, name, role, "isActive"`,
      [name.trim(), session.user.id]
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: "Admin não encontrado" }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error: any) {
    console.error("Erro ao atualizar perfil:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}
