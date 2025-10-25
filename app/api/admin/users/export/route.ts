// app/api/admin/users/export/route.ts (novo caminho)
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

    // Buscar TODOS os usuários com todos os dados
    const { rows: users } = await query(
      `SELECT 
         u."id",
         u."email",
         u."name",
         u."createdAt",
         u."updatedAt",
         CASE WHEN u."passwordHash" IS NOT NULL THEN 'Ativo' ELSE 'Inativo' END as "status",
         p."displayName" as "planoAtual",
         p."name" as "planoCodigo",
         s."status" as "statusAssinatura",
         s."currentPeriodStart" as "inicioAssinatura",
         s."currentPeriodEnd" as "fimAssinatura",
         (SELECT COUNT(*)::int FROM public."ConversionJob" WHERE "userId" = u."id") as "totalConversoes",
         (SELECT COUNT(*)::int FROM public."Subscription" WHERE "userId" = u."id") as "totalAssinaturas",
         (SELECT COUNT(*)::int FROM public."Payment" WHERE "userId" = u."id" AND "status" = 'PAID') as "totalPagamentos",
         (SELECT SUM("amount")::float FROM public."Payment" WHERE "userId" = u."id" AND "status" = 'PAID') as "totalGasto"
       FROM public."User" u
       LEFT JOIN public."Subscription" s ON u."id" = s."userId" 
         AND s."isCurrent" = true
         AND s."status" = 'ACTIVE'
         AND s."currentPeriodEnd" > NOW()
       LEFT JOIN public."Plan" p ON s."planId" = p."id"
       ORDER BY u."createdAt" DESC`
    )

    // Converter para CSV
    const headers = [
      'ID',
      'Email',
      'Nome',
      'Status',
      'Plano Atual',
      'Código do Plano',
      'Status Assinatura',
      'Início Assinatura',
      'Fim Assinatura',
      'Total Conversões',
      'Total Assinaturas',
      'Total Pagamentos',
      'Total Gasto (R$)',
      'Data Cadastro',
      'Última Atualização'
    ]

    const csvRows = [
      headers.join(','),
      ...users.map(user => [
        user.id,
        `"${user.email}"`,
        `"${user.name || 'Sem nome'}"`,
        user.status,
        `"${user.planoAtual || 'Sem plano'}"`,
        user.planoCodigo || 'N/A',
        user.statusAssinatura || 'N/A',
        user.inicioAssinatura ? new Date(user.inicioAssinatura).toLocaleDateString('pt-BR') : 'N/A',
        user.fimAssinatura ? new Date(user.fimAssinatura).toLocaleDateString('pt-BR') : 'N/A',
        user.totalConversoes || 0,
        user.totalAssinaturas || 0,
        user.totalPagamentos || 0,
        user.totalGasto?.toFixed(2) || '0.00',
        new Date(user.createdAt).toLocaleDateString('pt-BR'),
        new Date(user.updatedAt).toLocaleDateString('pt-BR')
      ].join(','))
    ]

    const csv = csvRows.join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="usuarios-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })

  } catch (error: any) {
    console.error("Erro ao exportar usuários:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}
