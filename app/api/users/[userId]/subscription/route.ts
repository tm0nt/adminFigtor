// app/api/users/[userId]/subscription/route.ts
import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/auth"

export const runtime = "nodejs"

export async function POST(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { userId } = await context.params
    const { planId } = await req.json()

    console.log("📦 Criando assinatura:", { userId, planId })

    // Buscar detalhes do plano
    const { rows: planRows } = await query(
      `SELECT * FROM public."Plan" WHERE id = $1`,
      [planId]
    )

    if (planRows.length === 0) {
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 })
    }

    const plan = planRows[0]

    // Cancelar assinatura atual (se existir)
    await query(
      `UPDATE public."Subscription"
       SET "isCurrent" = false, 
           "cancelAtPeriodEnd" = true, 
           "canceledAt" = NOW()
       WHERE "userId" = $1 AND "isCurrent" = true`,
      [userId]
    )

    // Datas da assinatura
    const now = new Date()
    const periodEnd = new Date()
    periodEnd.setMonth(periodEnd.getMonth() + 1)

    // Criar nova assinatura (SEM customLimit)
    const { rows: subscriptionRows } = await query(
      `INSERT INTO public."Subscription" 
         ("userId", "planId", "status", "isCurrent", "startedAt", "currentPeriodStart", "currentPeriodEnd")
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        userId,
        planId,
        'ACTIVE',
        true,
        now,
        now,
        periodEnd
      ]
    )

    const subscription = subscriptionRows[0]

    // Atualizar currentSubscriptionId do usuário
    await query(
      `UPDATE public."User"
       SET "currentSubscriptionId" = $1
       WHERE id = $2`,
      [subscription.id, userId]
    )

    // Criar período de uso
    await query(
      `INSERT INTO public."UsagePeriod"
         ("subscriptionId", "periodStart", "periodEnd", "pagesUsed", "conversions")
       VALUES ($1, $2, $3, 0, 0)`,
      [subscription.id, now, periodEnd]
    )

    console.log("✅ Assinatura criada:", subscription.id)

    return NextResponse.json(subscription)
  } catch (error: any) {
    console.error("Erro ao criar assinatura:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}
