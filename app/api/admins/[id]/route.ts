// app/api/admins/[id]/route.ts
import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/auth"
import bcrypt from "bcryptjs"

export const runtime = "nodejs"

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    const { id } = await context.params
    const { name, role, isActive, password } = await req.json()

    let updateQuery = `UPDATE public."Admin" SET "updatedAt" = NOW()`
    const queryParams: any[] = []
    let paramIndex = 1

    if (name !== undefined) {
      updateQuery += `, name = $${paramIndex}`
      queryParams.push(name)
      paramIndex++
    }

    if (role !== undefined) {
      updateQuery += `, role = $${paramIndex}`
      queryParams.push(role)
      paramIndex++
    }

    if (isActive !== undefined) {
      updateQuery += `, "isActive" = $${paramIndex}`
      queryParams.push(isActive)
      paramIndex++
    }

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10)
      updateQuery += `, password = $${paramIndex}`
      queryParams.push(passwordHash)
      paramIndex++
    }

    updateQuery += ` WHERE id = $${paramIndex} RETURNING id, email, name, role, "isActive"`
    queryParams.push(id)

    const { rows } = await query(updateQuery, queryParams)

    if (rows.length === 0) {
      return NextResponse.json({ error: "Admin não encontrado" }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error: any) {
    console.error("Erro ao atualizar admin:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    const { id } = await context.params

    // Não permitir deletar a si mesmo
    if (session.user.id === id) {
      return NextResponse.json({ error: "Você não pode deletar sua própria conta" }, { status: 400 })
    }

    await query(`DELETE FROM public."Admin" WHERE id = $1`, [id])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Erro ao deletar admin:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}
