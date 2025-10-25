// app/api/plans/[id]/route.ts
import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/auth"

export const runtime = "nodejs"

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> } // ✅ Promise aqui
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const data = await req.json()
    const { id } = await context.params // ✅ AWAIT aqui

    const { rows } = await query(
      `UPDATE public."Plan" 
       SET 
         "name" = $1,
         "displayName" = $2,
         "pagesLimitPerMonth" = $3,
         "isUnlimited" = $4,
         "priceAmount" = $5,
         "currency" = $6,
         "isActive" = $7,
         "updatedAt" = NOW()
       WHERE "id" = $8
       RETURNING *`,
      [
        data.name,
        data.displayName,
        data.pagesLimitPerMonth,
        data.isUnlimited,
        data.priceAmount, // ✅ CORRIGIDO: priceAmount
        data.currency,
        data.isActive,
        id,
      ]
    )

    return NextResponse.json(rows[0])
  } catch (error: any) {
    console.error("Erro ao atualizar plano:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> } // ✅ Promise aqui
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await context.params // ✅ AWAIT aqui

    console.log("🗑️ Tentando deletar plano:", id)

    // Verificar se há assinaturas ativas
    const { rows: activeSubscriptions } = await query(
      `SELECT COUNT(*)::int as count
       FROM public."Subscription"
       WHERE "planId" = $1 AND "status" = 'ACTIVE' AND "currentPeriodEnd" > NOW()`,
      [id]
    )

    console.log("📊 Assinaturas ativas:", activeSubscriptions[0]?.count)

    if (activeSubscriptions[0]?.count > 0) {
      return NextResponse.json(
        { error: "Não é possível deletar um plano com assinaturas ativas" },
        { status: 400 }
      )
    }

    // Deletar plano
    const result = await query(`DELETE FROM public."Plan" WHERE "id" = $1 RETURNING "id"`, [id])
    
    console.log("✅ Plano deletado:", result.rows[0])

    return NextResponse.json({ success: true, deletedId: result.rows[0]?.id })
  } catch (error: any) {
    console.error("❌ Erro ao deletar plano:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}
