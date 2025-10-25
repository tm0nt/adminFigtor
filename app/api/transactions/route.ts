// app/api/transactions/route.ts
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
    const limit = 20
    const offset = (page - 1) * limit

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
    if (statusFilter !== "all") {
      whereConditions.push(`p."status" = $${paramIndex}`)
      queryParams.push(statusFilter)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

    // Buscar transações (tabela Payment)
    const { rows: transactions } = await query(
      `SELECT 
         p."id",
         p."amount",
         p."status",
         p."paymentMethod",
         p."createdAt",
         u."name" as "userName",
         u."email" as "userEmail",
         pl."displayName" as "planName"
       FROM public."Payment" p
       JOIN public."User" u ON p."userId" = u."id"
       LEFT JOIN public."Subscription" s ON p."subscriptionId" = s."id"
       LEFT JOIN public."Plan" pl ON s."planId" = pl."id"
       ${whereClause}
       ORDER BY p."createdAt" DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset]
    )

    // Contar total
    const { rows: countResult } = await query(
      `SELECT COUNT(*)::int as total
       FROM public."Payment" p
       JOIN public."User" u ON p."userId" = u."id"
       LEFT JOIN public."Subscription" s ON p."subscriptionId" = s."id"
       LEFT JOIN public."Plan" pl ON s."planId" = pl."id"
       ${whereClause}`,
      queryParams
    )

    const total = countResult[0]?.total || 0
    const pages = Math.ceil(total / limit)

    return NextResponse.json({ transactions, total, pages, page })
  } catch (error: any) {
    console.error("Erro ao buscar transações:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}
