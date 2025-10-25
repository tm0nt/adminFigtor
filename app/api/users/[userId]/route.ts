// app/api/users/[userId]/route.ts
import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/auth"

export const runtime = "nodejs"

export async function GET(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { userId } = await context.params

    console.log("🔍 Buscando usuário:", userId)

    // Buscar dados do usuário
    const { rows: userRows } = await query(
      `SELECT 
         u."id",
         u."email",
         u."name",
         u."createdAt",
         CASE WHEN u."passwordHash" IS NOT NULL THEN true ELSE false END as "isActive"
       FROM public."User" u
       WHERE u."id" = $1`,
      [userId]
    )

    console.log("👤 Usuário encontrado:", userRows.length > 0)

    if (userRows.length === 0) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const user = userRows[0]

    // Contar conversões
    const { rows: conversionsCount } = await query(
      `SELECT COUNT(*)::int as count
       FROM public."ConversionJob"
       WHERE "userId" = $1`,
      [userId]
    )

    // Contar assinaturas totais
    const { rows: subscriptionsCount } = await query(
      `SELECT COUNT(*)::int as count
       FROM public."Subscription"
       WHERE "userId" = $1`,
      [userId]
    )

    // Buscar assinatura atual - SEM customLimit
    const { rows: currentSubscription } = await query(
      `SELECT 
         s."id",
         s."status",
         s."currentPeriodStart",
         s."currentPeriodEnd",
         p."name" as "planName",
         p."displayName" as "planDisplayName",
         p."pagesLimitPerMonth" as "pagesLimit",
         p."isUnlimited"
       FROM public."Subscription" s
       JOIN public."Plan" p ON s."planId" = p."id"
       WHERE s."userId" = $1 
         AND s."isCurrent" = true
         AND s."status" = 'ACTIVE'
         AND s."currentPeriodEnd" > NOW()
       LIMIT 1`,
      [userId]
    )

    // Buscar histórico de assinaturas
    const { rows: subscriptionHistory } = await query(
      `SELECT 
         s."id",
         s."status",
         s."currentPeriodStart",
         s."currentPeriodEnd",
         p."displayName" as "planDisplayName"
       FROM public."Subscription" s
       JOIN public."Plan" p ON s."planId" = p."id"
       WHERE s."userId" = $1
       ORDER BY s."currentPeriodStart" DESC
       LIMIT 10`,
      [userId]
    )

    return NextResponse.json({
      ...user,
      conversionsCount: conversionsCount[0]?.count || 0,
      subscriptionsCount: subscriptionsCount[0]?.count || 0,
      currentSubscription: currentSubscription[0] || null,
      subscriptionHistory,
    })

  } catch (error: any) {
    console.error("❌ Erro ao buscar detalhes do usuário:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { userId } = await context.params

    // Deletar usuário (cascade irá deletar relacionamentos)
    await query(`DELETE FROM public."User" WHERE "id" = $1`, [userId])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Erro ao deletar usuário:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
