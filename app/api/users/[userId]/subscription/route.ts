// app/api/users/[userId]/subscription/route.ts
import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/auth"

export const runtime = "nodejs"

export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { userId } = params
    const { planId, customLimit } = await req.json()

    // Cancelar assinatura atual se existir
    await query(
      `UPDATE public."Subscription"
       SET "isCurrent" = false, "canceledAt" = NOW(), "status" = 'CANCELED'
       WHERE "userId" = $1 AND "isCurrent" = true`,
      [userId]
    )

    // Criar nova assinatura
    const { rows } = await query(
      `INSERT INTO public."Subscription" 
         ("userId", "planId", "status", "isCurrent", "currentPeriodStart", "currentPeriodEnd", "customLimit")
       VALUES ($1, $2, 'ACTIVE', true, NOW(), NOW() + INTERVAL '30 days', $3)
       RETURNING *`,
      [userId, planId, customLimit || null]
    )

    return NextResponse.json(rows[0])
  } catch (error: any) {
    console.error("Erro ao criar assinatura:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
