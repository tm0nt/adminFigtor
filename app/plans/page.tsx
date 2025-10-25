// app/(dashboard)/plans/page.tsx
"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Plus, Edit, Trash2, X } from "lucide-react"
import { usePlans, useCreatePlan, useUpdatePlan, useDeletePlan } from "@/hooks/use-plans"
import { toast } from "sonner"

export default function PlansPage() {
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    pagesLimitPerMonth: 0,
    isUnlimited: false,
    priceAmount: 0,
    currency: "BRL",
    isActive: true,
  })

  const { data: plans, isLoading } = usePlans()
  const createPlan = useCreatePlan()
  const updatePlan = useUpdatePlan()
  const deletePlan = useDeletePlan()

  const handleOpenModal = (plan?: any) => {
    if (plan) {
      setEditingPlan(plan)
      setFormData({
        name: plan.name,
        displayName: plan.displayName,
        pagesLimitPerMonth: plan.pagesLimitPerMonth,
        isUnlimited: plan.isUnlimited,
        priceAmount: plan.priceAmount,
        currency: plan.currency,
        isActive: plan.isActive,
      })
    } else {
      setEditingPlan(null)
      setFormData({
        name: "",
        displayName: "",
        pagesLimitPerMonth: 0,
        isUnlimited: false,
        priceAmount: 0,
        currency: "BRL",
        isActive: true,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingPlan(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingPlan) {
        await updatePlan.mutateAsync({ id: editingPlan.id, ...formData })
        toast.success("Plano atualizado com sucesso!")
      } else {
        await createPlan.mutateAsync(formData)
        toast.success("Plano criado com sucesso!")
      }
      handleCloseModal()
    } catch (error) {
      toast.error("Erro ao salvar plano")
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja deletar o plano "${name}"?`)) {
      try {
        await deletePlan.mutateAsync(id)
        toast.success("Plano deletado com sucesso!")
      } catch (error) {
        toast.error("Erro ao deletar plano")
      }
    }
  }

  const getPlanColor = (name: string) => {
    const colors: Record<string, string> = {
      FREE: "bg-gray-500",
      BASIC: "bg-blue-500",
      ELITE: "bg-purple-500",
      UNLIMITED: "bg-[#90f209]",
    }
    return colors[name] || "bg-gray-500"
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-slide-in-left">
          <div>
            <h1 className="text-[#ffffff] text-3xl font-semibold mb-2">Planos</h1>
            <p className="text-[#666666]">{plans?.length || 0} planos cadastrados</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-[#90f209] text-[#000000] font-semibold px-6 py-3 rounded-xl hover:bg-[#a0ff20] transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Novo Plano
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="text-[#90f209] text-lg">Carregando...</div>
            </div>
          ) : (
            plans?.map((plan: any) => (
              <div
                key={plan.id}
                className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-6 hover:border-[#262626] transition-all duration-300 animate-slide-in-left hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${getPlanColor(plan.name)} flex items-center justify-center`}>
                    <span className="text-2xl">
                      {plan.name === "FREE" ? "🆓" : plan.name === "BASIC" ? "📦" : plan.name === "ELITE" ? "👑" : "🚀"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal(plan)}
                      className="p-2 rounded-lg bg-[#1a1a1a] text-[#ffffff] hover:bg-[#262626] transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id, plan.displayName)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-[#ffffff] text-xl font-semibold mb-2">{plan.displayName}</h3>
                
                <div className="space-y-2 mb-4">
                  <p className="text-[#666666] text-sm">
                    {plan.isUnlimited ? "Conversões ilimitadas" : `${plan.pagesLimitPerMonth} páginas/mês`}
                  </p>
                <p className="text-[#90f209] text-2xl font-bold">
  R$ {plan.priceAmount ? Number(plan.priceAmount).toFixed(2) : "0.00"}
  <span className="text-[#666666] text-sm font-normal">/mês</span>
</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#1a1a1a]">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    plan.isActive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  }`}>
                    {plan.isActive ? "Ativo" : "Inativo"}
                  </span>
                  <span className="text-[#666666] text-xs">
                    {plan._count?.subscriptions || 0} assinantes
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in-up">
          <div className="bg-[#0f0f0f] rounded-3xl p-8 max-w-2xl w-full border border-[#1a1a1a] shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[#ffffff] text-2xl font-semibold">
                {editingPlan ? "Editar Plano" : "Novo Plano"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg bg-[#1a1a1a] text-[#ffffff] hover:bg-[#262626] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#666666] text-sm mb-2 block">Nome (Identificador)</label>
                  <select
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#1a1a1a] text-[#ffffff] rounded-xl border border-[#262626] px-4 py-3 outline-none focus:border-[#90f209] transition-colors"
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="FREE">FREE</option>
                    <option value="BASIC">BASIC</option>
                    <option value="ELITE">ELITE</option>
                    <option value="UNLIMITED">UNLIMITED</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#666666] text-sm mb-2 block">Nome de Exibição</label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full bg-[#1a1a1a] text-[#ffffff] rounded-xl border border-[#262626] px-4 py-3 outline-none focus:border-[#90f209] transition-colors"
                    placeholder="Ex: Plano Básico"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-[#ffffff] mb-2">
                  <input
                    type="checkbox"
                    checked={formData.isUnlimited}
                    onChange={(e) => setFormData({ ...formData, isUnlimited: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#90f209]"
                  />
                  Conversões Ilimitadas
                </label>
              </div>

              {!formData.isUnlimited && (
                <div>
                  <label className="text-[#666666] text-sm mb-2 block">Limite de Páginas/Mês</label>
                  <input
                    type="number"
                    value={formData.pagesLimitPerMonth}
                    onChange={(e) => setFormData({ ...formData, pagesLimitPerMonth: parseInt(e.target.value) })}
                    className="w-full bg-[#1a1a1a] text-[#ffffff] rounded-xl border border-[#262626] px-4 py-3 outline-none focus:border-[#90f209] transition-colors"
                    min="0"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#666666] text-sm mb-2 block">Preço</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.priceAmount}
                    onChange={(e) => setFormData({ ...formData, priceAmount: parseFloat(e.target.value) })}
                    className="w-full bg-[#1a1a1a] text-[#ffffff] rounded-xl border border-[#262626] px-4 py-3 outline-none focus:border-[#90f209] transition-colors"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="text-[#666666] text-sm mb-2 block">Moeda</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full bg-[#1a1a1a] text-[#ffffff] rounded-xl border border-[#262626] px-4 py-3 outline-none focus:border-[#90f209] transition-colors"
                    required
                  >
                    <option value="BRL">BRL (R$)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-[#ffffff]">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#90f209]"
                  />
                  Plano Ativo
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-[#1a1a1a] text-[#ffffff] font-semibold py-3 rounded-xl hover:bg-[#262626] transition-all duration-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createPlan.isPending || updatePlan.isPending}
                  className="flex-1 bg-[#90f209] text-[#000000] font-bold py-3 rounded-xl hover:bg-[#a0ff20] transition-all duration-300 disabled:opacity-50"
                >
                  {editingPlan ? "Atualizar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
