// app/api/users/route.ts
import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/auth"

export const runtime = "nodejs"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const statusFilter = searchParams.get("statusFilter") || "all"
    const planFilter = searchParams.get("planFilter") || "all"
    const limit = 20
    const offset = (page - 1) * limit

    // Construir query dinâmica
    let whereConditions = []
    let queryParams: any[] = []
    let paramIndex = 1

    // Filtro de busca
    if (search) {
      whereConditions.push(`(u."name" ILIKE $${paramIndex} OR u."email" ILIKE $${paramIndex})`)
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    // Filtro de status
    if (statusFilter === "active") {
      whereConditions.push(`u."passwordHash" IS NOT NULL`)
    } else if (statusFilter === "inactive") {
      whereConditions.push(`u."passwordHash" IS NULL`)
    }

    // Filtro de plano
    if (planFilter !== "all") {
      whereConditions.push(`p."name" = $${paramIndex}`)
      queryParams.push(planFilter)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

    // Buscar usuários - CORRIGIDO COM currentPeriodEnd
    const { rows: users } = await query(
      `SELECT 
         u."id",
         u."email",
         u."name",
         u."createdAt",
         p."displayName" as "planName",
         s."status" as "subscriptionStatus",
         CASE WHEN u."passwordHash" IS NOT NULL THEN true ELSE false END as "isActive"
       FROM public."User" u
       LEFT JOIN public."Subscription" s ON u."id" = s."userId" 
         AND s."isCurrent" = true
         AND s."status" = 'ACTIVE' 
         AND s."currentPeriodEnd" > NOW()
       LEFT JOIN public."Plan" p ON s."planId" = p."id"
       ${whereClause}
       ORDER BY u."createdAt" DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset]
    )

    // Contar total - SEM JOIN complexo para evitar erro
    const { rows: countResult } = await query(
      `SELECT COUNT(DISTINCT u."id")::int as total
       FROM public."User" u
       LEFT JOIN public."Subscription" s ON u."id" = s."userId" AND s."isCurrent" = true
       LEFT JOIN public."Plan" p ON s."planId" = p."id"
       ${whereClause}`,
      queryParams
    )

    const total = countResult[0]?.total || 0
    const pages = Math.ceil(total / limit)

    return NextResponse.json({ users, total, pages, page })
  } catch (error: any) {
    console.error("Erro ao buscar usuários:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}
