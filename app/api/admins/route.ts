// app/api/admins/route.ts
import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/auth"
import bcrypt from "bcryptjs"

export const runtime = "nodejs"

export async function GET() {
  try {
    const session = await auth()
    
    // ✅ CORRIGIDO: session.user.role ao invés de session.role
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    const { rows: admins } = await query(
      `SELECT 
         id, email, name, role, "isActive", "lastLoginAt", "createdAt"
       FROM public."Admin"
       ORDER BY "createdAt" DESC`
    )

    return NextResponse.json(admins)
  } catch (error: any) {
    console.error("Erro ao buscar admins:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    
    // ✅ CORRIGIDO: session.user.role ao invés de session.user.role
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    const { email, name, password, role, isActive } = await req.json()

    // Verificar se email já existe
    const { rows: existing } = await query(
      `SELECT id FROM public."Admin" WHERE email = $1`,
      [email]
    )

    if (existing.length > 0) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 })
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 10)

    // Criar admin
    const { rows } = await query(
      `INSERT INTO public."Admin" 
         (email, name, password, role, "isActive")
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, role, "isActive", "createdAt"`,
      [email, name, passwordHash, role || "ADMIN", isActive ?? true]
    )

    return NextResponse.json(rows[0])
  } catch (error: any) {
    console.error("Erro ao criar admin:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}
