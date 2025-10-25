// app/api/conversions/route.ts
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
    const limit = 20
    const offset = (page - 1) * limit

    let whereConditions = []
    let queryParams: any[] = []
    let paramIndex = 1

    // Filtro de busca
    if (search) {
      whereConditions.push(`(c."figmaId" ILIKE $${paramIndex} OR u."name" ILIKE $${paramIndex} OR u."email" ILIKE $${paramIndex})`)
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

    // Buscar conversões
    const { rows: conversions } = await query(
      `SELECT 
         c."id",
         c."figmaId",
         c."figmaNodeId",
         c."projectName",
         c."createdAt",
         u."name" as "userName",
         u."email" as "userEmail"
       FROM public."Conversion" c
       JOIN public."User" u ON c."userId" = u."id"
       ${whereClause}
       ORDER BY c."createdAt" DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset]
    )

    // Contar total
    const { rows: countResult } = await query(
      `SELECT COUNT(*)::int as total
       FROM public."Conversion" c
       JOIN public."User" u ON c."userId" = u."id"
       ${whereClause}`,
      queryParams
    )

    const total = countResult[0]?.total || 0
    const pages = Math.ceil(total / limit)

    return NextResponse.json({ conversions, total, pages, page })
  } catch (error: any) {
    console.error("Erro ao buscar conversões:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
