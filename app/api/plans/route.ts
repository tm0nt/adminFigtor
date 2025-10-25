// app/api/plans/route.ts
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

    const { rows: plans } = await query(
      `SELECT 
         p.*,
         COUNT(s."id")::int as subscriptions_count
       FROM public."Plan" p
       LEFT JOIN public."Subscription" s ON p."id" = s."planId" 
         AND s."status" = 'ACTIVE'
         AND s."currentPeriodEnd" > NOW()
       GROUP BY p."id"
       ORDER BY 
         CASE p."name"
           WHEN 'FREE' THEN 1
           WHEN 'BASIC' THEN 2
           WHEN 'ELITE' THEN 3
           WHEN 'UNLIMITED' THEN 4
           ELSE 5
         END`
    )

    const formattedPlans = plans.map(plan => ({
      ...plan,
      _count: {
        subscriptions: plan.subscriptions_count || 0
      }
    }))

    return NextResponse.json(formattedPlans)
  } catch (error: any) {
    console.error("Erro ao buscar planos:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}


export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const data = await req.json()

    const { rows } = await query(
      `INSERT INTO public."Plan" 
         ("name", "displayName", "pagesLimitPerMonth", "isUnlimited", "price", "currency", "isActive")
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.name,
        data.displayName,
        data.pagesLimitPerMonth,
        data.isUnlimited,
        data.price,
        data.currency,
        data.isActive,
      ]
    )

    return NextResponse.json(rows[0])
  } catch (error: any) {
    console.error("Erro ao criar plano:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
