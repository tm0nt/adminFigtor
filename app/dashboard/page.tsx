// app/(dashboard)/dashboard/page.tsx
"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Users, CreditCard, TrendingUp, DollarSign, Activity, UserCheck } from "lucide-react"
import { useAdminStats } from "@/hooks/use-admin-stats"

export default function DashboardPage() {
  const { data: stats, isLoading } = useAdminStats()

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-[#90f209] text-lg">Carregando...</div>
        </div>
      </DashboardLayout>
    )
  }

  const cards = [
    {
      title: "Total de Usuários",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      change: stats?.usersChange || 0,
    },
    {
      title: "Assinaturas Ativas",
      value: stats?.activeSubscriptions || 0,
      icon: UserCheck,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      change: stats?.subscriptionsChange || 0,
    },
    {
      title: "Receita Mensal",
      value: `R$ ${(stats?.monthlyRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: "text-[#90f209]",
      bgColor: "bg-[#90f209]/10",
      change: stats?.revenueChange || 0,
    },
    {
      title: "Transações (Mês)",
      value: stats?.monthlyTransactions || 0,
      icon: Activity,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      change: stats?.transactionsChange || 0,
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-slide-in-left">
          <h1 className="text-[#ffffff] text-3xl font-semibold mb-2">Dashboard Administrativo</h1>
          <p className="text-[#666666]">Visão geral da plataforma</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => {
            const Icon = card.icon
            const isPositive = card.change >= 0
            
            return (
              <div
                key={index}
                style={{ animationDelay: `${index * 100}ms` }}
                className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-6 hover:border-[#262626] transition-all duration-300 animate-slide-in-left hover:scale-105"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    <TrendingUp className={`w-4 h-4 ${!isPositive && 'rotate-180'}`} />
                    <span>{Math.abs(card.change)}%</span>
                  </div>
                </div>
                <h3 className="text-[#666666] text-sm font-medium mb-1">{card.title}</h3>
                <p className="text-[#ffffff] text-2xl font-bold">{card.value}</p>
              </div>
            )
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Planos por Tipo */}
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-6 hover:border-[#262626] transition-all duration-300 animate-slide-in-left">
            <h2 className="text-[#ffffff] text-xl font-semibold mb-6">Planos Ativos</h2>
            
            <div className="space-y-4">
              {stats?.planDistribution?.map((plan: any, index: number) => {
                const percentage = (plan.count / (stats?.activeSubscriptions || 1)) * 100
                const colors = ['#90f209', '#3b82f6', '#8b5cf6', '#f59e0b']
                
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#ffffff] text-sm font-medium">{plan.planName}</span>
                      <span className="text-[#666666] text-sm">{plan.count} usuários</span>
                    </div>
                    <div className="relative">
                      <div className="bg-[#1a1a1a] rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: colors[index % colors.length]
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Novos Usuários (Últimos 7 dias) */}
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-6 hover:border-[#262626] transition-all duration-300 animate-slide-in-right">
            <h2 className="text-[#ffffff] text-xl font-semibold mb-6">Novos Usuários (7 dias)</h2>
            
            <div className="h-64 flex items-end justify-between gap-3">
              {stats?.newUsersChart?.map((day: any, i: number) => {
                const maxCount = Math.max(...(stats?.newUsersChart?.map((d: any) => d.count) || [1]))
                const height = (day.count / maxCount) * 100
                
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div
                      className="w-full rounded-t-lg transition-all duration-300 group-hover:opacity-80 relative cursor-pointer bg-[#90f209]"
                      style={{ height: `${height}%`, minHeight: '20px' }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a] px-2 py-1 rounded text-xs text-[#ffffff] opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                        {day.count} usuários
                      </div>
                    </div>
                    <span className="text-[#666666] text-xs font-medium">
                      {new Date(day.date).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Últimas Transações */}
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-6 hover:border-[#262626] transition-all duration-300 animate-slide-in-left">
          <h2 className="text-[#ffffff] text-xl font-semibold mb-6">Últimas Transações</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  <th className="text-left text-[#666666] text-sm font-medium pb-3">Usuário</th>
                  <th className="text-left text-[#666666] text-sm font-medium pb-3">Plano</th>
                  <th className="text-left text-[#666666] text-sm font-medium pb-3">Valor</th>
                  <th className="text-left text-[#666666] text-sm font-medium pb-3">Status</th>
                  <th className="text-left text-[#666666] text-sm font-medium pb-3">Data</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentTransactions?.map((transaction: any, index: number) => (
                  <tr key={index} className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a]/50 transition-colors">
                    <td className="py-4 text-[#ffffff] text-sm">{transaction.userName}</td>
                    <td className="py-4 text-[#ffffff] text-sm">{transaction.planName}</td>
                    <td className="py-4 text-[#ffffff] text-sm font-medium">
                      R$ {transaction.amount.toFixed(2)}
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'COMPLETED' 
                          ? 'bg-green-500/10 text-green-500' 
                          : transaction.status === 'PENDING'
                          ? 'bg-yellow-500/10 text-yellow-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {transaction.status === 'COMPLETED' ? 'Concluído' : 
                         transaction.status === 'PENDING' ? 'Pendente' : 'Falhou'}
                      </span>
                    </td>
                    <td className="py-4 text-[#666666] text-sm">
                      {new Date(transaction.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
