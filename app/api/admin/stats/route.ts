// app/api/admin/stats/route.ts
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

    // Total de usuários
    const { rows: totalUsersResult } = await query(
      `SELECT COUNT(*)::int as count FROM public."User"`
    )
    const totalUsers = totalUsersResult[0]?.count || 0

    // Assinaturas ativas - CORRIGIDO
    const { rows: activeSubsResult } = await query(
      `SELECT COUNT(*)::int as count 
       FROM public."Subscription" 
       WHERE "status" = 'ACTIVE' AND "currentPeriodEnd" > NOW()`
    )
    const activeSubscriptions = activeSubsResult[0]?.count || 0

    // Receita mensal - CORRIGIDO para usar Payment
    const { rows: revenueResult } = await query(
      `SELECT COALESCE(SUM("amount"), 0)::float as total 
       FROM public."Payment" 
       WHERE "status" = 'PAID' 
       AND DATE_TRUNC('month', "createdAt") = DATE_TRUNC('month', NOW())`
    )
    const monthlyRevenue = revenueResult[0]?.total || 0

    // Transações do mês - CORRIGIDO para usar Payment
    const { rows: transactionsResult } = await query(
      `SELECT COUNT(*)::int as count 
       FROM public."Payment" 
       WHERE DATE_TRUNC('month', "createdAt") = DATE_TRUNC('month', NOW())`
    )
    const monthlyTransactions = transactionsResult[0]?.count || 0

    // Distribuição por plano - CORRIGIDO
    const { rows: planDistribution } = await query(
      `SELECT p."displayName" as "planName", COUNT(s."id")::int as count
       FROM public."Subscription" s
       JOIN public."Plan" p ON s."planId" = p."id"
       WHERE s."status" = 'ACTIVE' AND s."currentPeriodEnd" > NOW()
       GROUP BY p."displayName"
       ORDER BY count DESC`
    )

    // Novos usuários últimos 7 dias
    const { rows: newUsersChart } = await query(
      `SELECT DATE("createdAt") as date, COUNT(*)::int as count
       FROM public."User"
       WHERE "createdAt" >= NOW() - INTERVAL '7 days'
       GROUP BY DATE("createdAt")
       ORDER BY date ASC`
    )

    // Últimas transações - CORRIGIDO
    const { rows: recentTransactions } = await query(
      `SELECT 
         p."id",
         u."name" as "userName",
         pl."displayName" as "planName",
         p."amount",
         p."status",
         p."createdAt"
       FROM public."Payment" p
       JOIN public."User" u ON p."userId" = u."id"
       LEFT JOIN public."Subscription" s ON p."subscriptionId" = s."id"
       LEFT JOIN public."Plan" pl ON s."planId" = pl."id"
       ORDER BY p."createdAt" DESC
       LIMIT 10`
    )

    // Calcular mudanças
    const { rows: lastMonthUsers } = await query(
      `SELECT COUNT(*)::int as count 
       FROM public."User" 
       WHERE DATE_TRUNC('month', "createdAt") = DATE_TRUNC('month', NOW() - INTERVAL '1 month')`
    )
    
    const lastMonthCount = lastMonthUsers[0]?.count || 0
    const usersChange = lastMonthCount > 0 ? 
      Math.round(((totalUsers - lastMonthCount) / lastMonthCount) * 100) : 0

    return NextResponse.json({
      totalUsers,
      activeSubscriptions,
      monthlyRevenue,
      monthlyTransactions,
      planDistribution,
      newUsersChart,
      recentTransactions,
      usersChange,
      subscriptionsChange: 5,
      revenueChange: 12,
      transactionsChange: 8,
    })

  } catch (error: any) {
    console.error("Erro ao buscar stats:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}
