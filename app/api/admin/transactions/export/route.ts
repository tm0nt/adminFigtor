// app/api/admin/transactions/export/route.ts
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

    const { rows: transactions } = await query(
      `SELECT 
         p."id",
         u."name" as "userName",
         u."email" as "userEmail",
         pl."displayName" as "planName",
         p."amount",
         p."currency",
         p."status",
         p."paymentMethod",
         p."createdAt",
         p."paidAt"
       FROM public."Payment" p
       JOIN public."User" u ON p."userId" = u."id"
       LEFT JOIN public."Subscription" s ON p."subscriptionId" = s."id"
       LEFT JOIN public."Plan" pl ON s."planId" = pl."id"
       ORDER BY p."createdAt" DESC`
    )

    const headers = [
      'ID',
      'Usuário',
      'Email',
      'Plano',
      'Valor',
      'Moeda',
      'Status',
      'Método de Pagamento',
      'Data da Transação',
      'Data do Pagamento'
    ]

    const csvRows = [
      headers.join(','),
      ...transactions.map(trans => [
        trans.id,
        `"${trans.userName || 'Sem nome'}"`,
        `"${trans.userEmail}"`,
        `"${trans.planName || 'N/A'}"`,
        Number(trans.amount || 0).toFixed(2),
        trans.currency || 'BRL',
        trans.status,
        trans.paymentMethod || 'N/A',
        new Date(trans.createdAt).toLocaleString('pt-BR'),
        trans.paidAt ? new Date(trans.paidAt).toLocaleString('pt-BR') : 'N/A'
      ].join(','))
    ]

    const csv = csvRows.join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="transacoes-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })

  } catch (error: any) {
    console.error("Erro ao exportar transações:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}
