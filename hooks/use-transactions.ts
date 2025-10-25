// hooks/use-transactions.ts
import { useQuery } from "@tanstack/react-query"

interface UseTransactionsParams {
  search: string
  page: number
  statusFilter: string
}

export function useTransactions({ search, page, statusFilter }: UseTransactionsParams) {
  return useQuery({
    queryKey: ["transactions", search, page, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        search,
        page: page.toString(),
        statusFilter,
      })
      const res = await fetch(`/api/transactions?${params}`)
      if (!res.ok) throw new Error("Erro ao buscar transações")
      return res.json()
    },
  })
}
