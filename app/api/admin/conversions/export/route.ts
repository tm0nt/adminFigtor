// app/api/admin/conversions/export/route.ts
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

    const { rows: conversions } = await query(
      `SELECT 
         c."id",
         u."name" as "userName",
         u."email" as "userEmail",
         f."fileKey" as "figmaId",
         f."name" as "projectName",
         c."createdAt",
         c."completedAt",
         (SELECT COUNT(*)::int FROM public."ConversionItem" WHERE "jobId" = c."id") as "totalPages"
       FROM public."ConversionJob" c
       JOIN public."User" u ON c."userId" = u."id"
       JOIN public."FigmaProject" f ON c."projectId" = f."id"
       ORDER BY c."createdAt" DESC`
    )

    const headers = [
      'ID',
      'Usuário',
      'Email',
      'Figma ID',
      'Nome do Projeto',
      'Total de Páginas',
      'Data da Conversão',
      'Data de Conclusão'
    ]

    const csvRows = [
      headers.join(','),
      ...conversions.map(conv => [
        conv.id,
        `"${conv.userName || 'Sem nome'}"`,
        `"${conv.userEmail}"`,
        conv.figmaId,
        `"${conv.projectName || 'Sem nome'}"`,
        conv.totalPages || 0,
        new Date(conv.createdAt).toLocaleString('pt-BR'),
        conv.completedAt ? new Date(conv.completedAt).toLocaleString('pt-BR') : 'Em andamento'
      ].join(','))
    ]

    const csv = csvRows.join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="conversoes-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })

  } catch (error: any) {
    console.error("Erro ao exportar conversões:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}
