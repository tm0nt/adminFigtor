// app/(dashboard)/users/page.tsx
"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { 
  Search, Filter, Ban, CheckCircle, Eye, Trash2, 
  Calendar, CreditCard, Activity, X, Plus, Download 
} from "lucide-react"
import { useUsers, useUserDetails, useUpdateUserStatus, useDeleteUser, useUpdateSubscription } from "@/hooks/use-users"
import { usePlans } from "@/hooks/use-plans"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function UsersPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [planFilter, setPlanFilter] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [newSubscription, setNewSubscription] = useState({ planId: "" })
  const [isExporting, setIsExporting] = useState(false)

  const { data, isLoading } = useUsers({ search, page, statusFilter, planFilter })
  const { data: userDetails } = useUserDetails(selectedUserId || "")
  const { data: plans } = usePlans()
  const updateStatus = useUpdateUserStatus()
  const deleteUser = useDeleteUser()
  const updateSubscription = useUpdateSubscription()

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await updateStatus.mutateAsync({ userId, isActive: !currentStatus })
      toast.success(`Usuário ${!currentStatus ? "ativado" : "desativado"} com sucesso`)
    } catch (error) {
      toast.error("Erro ao atualizar status do usuário")
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (confirm(`Tem certeza que deseja deletar o usuário "${userName}"? Esta ação não pode ser desfeita.`)) {
      try {
        await deleteUser.mutateAsync(userId)
        toast.success("Usuário deletado com sucesso")
        setSelectedUserId(null)
      } catch (error) {
        toast.error("Erro ao deletar usuário")
      }
    }
  }

  const handleCreateSubscription = async () => {
    if (!selectedUserId || !newSubscription.planId) {
      toast.error("Selecione um plano")
      return
    }

    try {
      await updateSubscription.mutateAsync({
        userId: selectedUserId,
        planId: newSubscription.planId,
      })
      toast.success("Assinatura criada com sucesso!")
      setShowSubscriptionModal(false)
      setNewSubscription({ planId: "" })
    } catch (error) {
      toast.error("Erro ao criar assinatura")
    }
  }

const handleExportUsers = async () => {
  setIsExporting(true)
  try {
    const response = await fetch('/api/admin/users/export') // CAMINHO CORRIGIDO
    if (!response.ok) throw new Error('Erro ao exportar')
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `usuarios-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    
    toast.success('Usuários exportados com sucesso!')
  } catch (error) {
    toast.error('Erro ao exportar usuários')
  } finally {
    setIsExporting(false)
  }
}

  const getStatusColor = (status: boolean) => {
    return status ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
  }

  const getPlanBadgeColor = (planName: string) => {
    const colors: Record<string, string> = {
      FREE: "bg-gray-500/10 text-gray-500",
      BASIC: "bg-blue-500/10 text-blue-500",
      ELITE: "bg-purple-500/10 text-purple-500",
      UNLIMITED: "bg-[#90f209]/10 text-[#90f209]",
    }
    return colors[planName] || "bg-gray-500/10 text-gray-500"
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-slide-in-left">
          <div>
            <h1 className="text-[#ffffff] text-2xl sm:text-3xl font-semibold mb-2">Usuários</h1>
            <p className="text-[#666666]">{data?.total || 0} usuários cadastrados</p>
          </div>
          <button 
            onClick={handleExportUsers}
            disabled={isExporting}
            className="w-full sm:w-auto bg-[#90f209] text-[#000000] font-semibold px-6 py-3 rounded-xl hover:bg-[#a0ff20] transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            {isExporting ? "Exportando..." : "Exportar Usuários"}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-4 sm:p-6 animate-slide-in-left">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome ou email..."
                className="w-full bg-[#1a1a1a] text-[#ffffff] placeholder:text-[#666666] rounded-xl border border-[#262626] pl-12 pr-4 py-3 outline-none transition-all duration-300 focus:border-[#90f209]"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl border transition-all duration-300 ${
                showFilters
                  ? "bg-[#90f209] text-[#000000] border-[#90f209]"
                  : "bg-[#1a1a1a] text-[#ffffff] border-[#262626] hover:border-[#333333]"
              }`}
            >
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline">Filtros</span>
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#1a1a1a]">
              <div>
                <label className="text-[#666666] text-sm mb-2 block">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full bg-[#1a1a1a] text-[#ffffff] rounded-xl border border-[#262626] px-4 py-3 outline-none focus:border-[#90f209] transition-colors"
                >
                  <option value="all">Todos</option>
                  <option value="active">Ativos</option>
                  <option value="inactive">Inativos</option>
                </select>
              </div>
              <div>
                <label className="text-[#666666] text-sm mb-2 block">Plano</label>
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="w-full bg-[#1a1a1a] text-[#ffffff] rounded-xl border border-[#262626] px-4 py-3 outline-none focus:border-[#90f209] transition-colors"
                >
                  <option value="all">Todos os planos</option>
                  <option value="FREE">Free</option>
                  <option value="BASIC">Basic</option>
                  <option value="ELITE">Elite</option>
                  <option value="UNLIMITED">Unlimited</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Users Cards (Mobile) & Table (Desktop) */}
        <div className="animate-slide-in-left">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl">
              <div className="text-[#90f209] text-lg">Carregando...</div>
            </div>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="grid grid-cols-1 gap-4 lg:hidden">
                {data?.users?.map((user: any) => (
                  <div
                    key={user.id}
                    className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-4 hover:border-[#262626] transition-all"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-[#90f209] flex items-center justify-center text-[#000000] font-bold flex-shrink-0">
                        {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#ffffff] font-medium truncate">{user.name || "Sem nome"}</p>
                        <p className="text-[#666666] text-sm truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPlanBadgeColor(user.planName)}`}>
                        {user.planName || "Sem plano"}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.isActive)}`}>
                        {user.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </div>

                    <p className="text-[#666666] text-sm mb-4">
                      Cadastrado {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: ptBR })}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedUserId(user.id)}
                        className="flex-1 p-2 rounded-lg bg-[#1a1a1a] text-[#ffffff] hover:bg-[#262626] transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">Detalhes</span>
                      </button>
                      <button
                        onClick={() => handleStatusToggle(user.id, user.isActive)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.isActive
                            ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                            : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                        }`}
                      >
                        {user.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#1a1a1a]">
                        <th className="text-left text-[#666666] text-sm font-medium px-6 py-4">Usuário</th>
                        <th className="text-left text-[#666666] text-sm font-medium px-6 py-4">Email</th>
                        <th className="text-left text-[#666666] text-sm font-medium px-6 py-4">Plano</th>
                        <th className="text-left text-[#666666] text-sm font-medium px-6 py-4">Status</th>
                        <th className="text-left text-[#666666] text-sm font-medium px-6 py-4">Cadastro</th>
                        <th className="text-right text-[#666666] text-sm font-medium px-6 py-4">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.users?.map((user: any) => (
                        <tr
                          key={user.id}
                          className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a]/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#90f209] flex items-center justify-center text-[#000000] font-bold">
                                {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                              </div>
                              <p className="text-[#ffffff] font-medium">{user.name || "Sem nome"}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-[#ffffff]">{user.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPlanBadgeColor(user.planName)}`}>
                              {user.planName || "Sem plano"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.isActive)}`}>
                              {user.isActive ? "Ativo" : "Inativo"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-[#666666] text-sm">
                              {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: ptBR })}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedUserId(user.id)}
                                className="p-2 rounded-lg bg-[#1a1a1a] text-[#ffffff] hover:bg-[#262626] transition-colors"
                                title="Visualizar"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleStatusToggle(user.id, user.isActive)}
                                className={`p-2 rounded-lg transition-colors ${
                                  user.isActive
                                    ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                                    : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                                }`}
                                title={user.isActive ? "Desativar" : "Ativar"}
                              >
                                {user.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {data && data.pages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-4 bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl mt-4">
                  <p className="text-[#666666] text-sm">
                    Página {page} de {data.pages}
                  </p>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-[#1a1a1a] text-[#ffffff] hover:bg-[#262626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === data.pages}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-[#90f209] text-[#000000] hover:bg-[#a0ff20] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUserId && userDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in-up">
          <div className="bg-[#0f0f0f] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#1a1a1a] shadow-2xl animate-scale-in">
            <div className="sticky top-0 bg-[#0f0f0f] border-b border-[#1a1a1a] p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#90f209] flex items-center justify-center text-[#000000] font-bold text-2xl">
                  {userDetails.name?.charAt(0) || userDetails.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-[#ffffff] text-2xl font-semibold">{userDetails.name || "Sem nome"}</h2>
                  <p className="text-[#666666]">{userDetails.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserId(null)}
                className="p-2 rounded-lg bg-[#1a1a1a] text-[#ffffff] hover:bg-[#262626] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#1a1a1a] rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="w-5 h-5 text-[#90f209]" />
                    <p className="text-[#666666] text-sm">Conversões</p>
                  </div>
                  <p className="text-[#ffffff] text-2xl font-bold">{userDetails.conversionsCount}</p>
                </div>

                <div className="bg-[#1a1a1a] rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                    <p className="text-[#666666] text-sm">Assinaturas</p>
                  </div>
                  <p className="text-[#ffffff] text-2xl font-bold">{userDetails.subscriptionsCount}</p>
                </div>

                <div className="bg-[#1a1a1a] rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    <p className="text-[#666666] text-sm">Membro desde</p>
                  </div>
                  <p className="text-[#ffffff] text-sm font-medium">
                    {new Date(userDetails.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>

              <div className="bg-[#1a1a1a] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[#ffffff] text-lg font-semibold">Assinatura Atual</h3>
                  <button
                    onClick={() => setShowSubscriptionModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#90f209] text-[#000000] hover:bg-[#a0ff20] transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Nova Assinatura
                  </button>
                </div>

                {userDetails.currentSubscription ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[#666666]">Plano:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPlanBadgeColor(userDetails.currentSubscription.planName)}`}>
                        {userDetails.currentSubscription.planDisplayName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#666666]">Status:</span>
                      <span className="text-[#ffffff]">{userDetails.currentSubscription.status}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#666666]">Renova em:</span>
                      <span className="text-[#ffffff]">
                        {new Date(userDetails.currentSubscription.currentPeriodEnd).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#666666]">Limite de Páginas:</span>
                      <span className="text-[#ffffff]">
                        {userDetails.currentSubscription.isUnlimited ? "Ilimitado" : userDetails.currentSubscription.pagesLimit}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[#666666] text-center py-4">Nenhuma assinatura ativa</p>
                )}
              </div>

              <div className="bg-[#1a1a1a] rounded-xl p-6">
                <h3 className="text-[#ffffff] text-lg font-semibold mb-4">Histórico de Assinaturas</h3>
                <div className="space-y-3">
                  {userDetails.subscriptionHistory?.length > 0 ? (
                    userDetails.subscriptionHistory.map((sub: any) => (
                      <div key={sub.id} className="flex items-center justify-between py-3 border-b border-[#262626] last:border-0">
                        <div>
                          <p className="text-[#ffffff] font-medium">{sub.planDisplayName}</p>
                          <p className="text-[#666666] text-sm">
                            {new Date(sub.currentPeriodStart).toLocaleDateString("pt-BR")} - 
                            {new Date(sub.currentPeriodEnd).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          sub.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' :
                          sub.status === 'CANCELED' ? 'bg-red-500/10 text-red-500' :
                          'bg-gray-500/10 text-gray-500'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[#666666] text-center py-4">Nenhum histórico</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleStatusToggle(userDetails.id, userDetails.isActive)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all font-semibold ${
                    userDetails.isActive
                      ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                      : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                  }`}
                >
                  {userDetails.isActive ? <Ban className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                  {userDetails.isActive ? "Desativar Conta" : "Ativar Conta"}
                </button>
                <button
                  onClick={() => handleDeleteUser(userDetails.id, userDetails.name || userDetails.email)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all font-semibold"
                >
                  <Trash2 className="w-5 h-5" />
                  Deletar Usuário
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-[#0f0f0f] rounded-3xl max-w-md w-full border border-[#1a1a1a] shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#ffffff] text-xl font-semibold">Nova Assinatura</h3>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="p-2 rounded-lg bg-[#1a1a1a] text-[#ffffff] hover:bg-[#262626] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[#666666] text-sm mb-2 block">Plano</label>
                <select
                  value={newSubscription.planId}
                  onChange={(e) => setNewSubscription({ planId: e.target.value })}
                  className="w-full bg-[#1a1a1a] text-[#ffffff] rounded-xl border border-[#262626] px-4 py-3 outline-none focus:border-[#90f209] transition-colors"
                >
                  <option value="">Selecione um plano</option>
                  {plans?.map((plan: any) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.displayName} - R$ {plan.priceAmount?.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="flex-1 bg-[#1a1a1a] text-[#ffffff] font-semibold py-3 rounded-xl hover:bg-[#262626] transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateSubscription}
                  disabled={!newSubscription.planId}
                  className="flex-1 bg-[#90f209] text-[#000000] font-bold py-3 rounded-xl hover:bg-[#a0ff20] transition-all disabled:opacity-50"
                >
                  Criar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
