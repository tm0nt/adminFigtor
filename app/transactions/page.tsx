// app/(dashboard)/transactions/page.tsx
"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Search, Download, CreditCard, User, Calendar } from "lucide-react"
import { useTransactions } from "@/hooks/use-transactions"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"

export default function TransactionsPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isExporting, setIsExporting] = useState(false)

  const { data, isLoading } = useTransactions({ search, page, statusFilter })

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/admin/transactions/export')
      if (!response.ok) throw new Error('Erro ao exportar')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transacoes-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Transações exportadas com sucesso!')
    } catch (error) {
      toast.error('Erro ao exportar transações')
    } finally {
      setIsExporting(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PAID: "bg-green-500/10 text-green-500",
      PENDING: "bg-yellow-500/10 text-yellow-500",
      FAILED: "bg-red-500/10 text-red-500",
      CANCELED: "bg-gray-500/10 text-gray-500",
    }
    return colors[status] || "bg-gray-500/10 text-gray-500"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PAID: "Pago",
      PENDING: "Pendente",
      FAILED: "Falhou",
      CANCELED: "Cancelado",
    }
    return labels[status] || status
  }

  const formatAmount = (amount: any) => {
    if (!amount) return "R$ 0,00"
    return `R$ ${Number(amount).toFixed(2).replace('.', ',')}`
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-slide-in-left">
          <div>
            <h1 className="text-[#ffffff] text-2xl sm:text-3xl font-semibold mb-2">Transações</h1>
            <p className="text-[#666666]">{data?.total || 0} transações registradas</p>
          </div>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="w-full sm:w-auto bg-[#90f209] text-[#000000] font-semibold px-6 py-3 rounded-xl hover:bg-[#a0ff20] transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            {isExporting ? "Exportando..." : "Exportar"}
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
                placeholder="Buscar por usuário ou ID..."
                className="w-full bg-[#1a1a1a] text-[#ffffff] placeholder:text-[#666666] rounded-xl border border-[#262626] pl-12 pr-4 py-3 outline-none transition-all duration-300 focus:border-[#90f209]"
              />
            </div>
            <div className="w-full lg:w-64">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#1a1a1a] text-[#ffffff] rounded-xl border border-[#262626] px-4 py-3 outline-none focus:border-[#90f209] transition-colors"
              >
                <option value="all">Todos os Status</option>
                <option value="PAID">Pago</option>
                <option value="PENDING">Pendente</option>
                <option value="FAILED">Falhou</option>
                <option value="CANCELED">Cancelado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="animate-slide-in-left">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl">
              <div className="text-[#90f209] text-lg">Carregando...</div>
            </div>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="grid grid-cols-1 gap-4 lg:hidden">
                {data?.transactions?.map((transaction: any) => (
                  <div
                    key={transaction.id}
                    className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-4 hover:border-[#262626] transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[#ffffff] font-medium truncate">{transaction.userName}</p>
                        <p className="text-[#666666] text-sm truncate">{transaction.userEmail}</p>
                      </div>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(transaction.status)}`}>
                        {getStatusLabel(transaction.status)}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="w-4 h-4 text-[#666666]" />
                        <span className="text-[#ffffff] font-medium">{transaction.planName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-[#666666]" />
                        <span className="text-[#666666]">
                          {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#1a1a1a]">
                      <span className="text-[#90f209] text-lg font-bold">{formatAmount(transaction.amount)}</span>
                      <span className="text-[#666666] text-xs">{transaction.paymentMethod || "N/A"}</span>
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
                        <th className="text-left text-[#666666] text-sm font-medium px-6 py-4">Plano</th>
                        <th className="text-left text-[#666666] text-sm font-medium px-6 py-4">Valor</th>
                        <th className="text-left text-[#666666] text-sm font-medium px-6 py-4">Método</th>
                        <th className="text-left text-[#666666] text-sm font-medium px-6 py-4">Status</th>
                        <th className="text-left text-[#666666] text-sm font-medium px-6 py-4">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.transactions?.map((transaction: any) => (
                        <tr
                          key={transaction.id}
                          className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a]/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-[#ffffff] font-medium">{transaction.userName}</p>
                              <p className="text-[#666666] text-sm">{transaction.userEmail}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-[#ffffff]">{transaction.planName}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-[#90f209] font-bold">{formatAmount(transaction.amount)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-[#ffffff]">{transaction.paymentMethod || "N/A"}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                              {getStatusLabel(transaction.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-[#666666] text-sm">
                              {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true, locale: ptBR })}
                            </p>
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
    </DashboardLayout>
  )
}
