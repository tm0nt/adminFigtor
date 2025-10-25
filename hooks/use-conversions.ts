// hooks/use-conversions.ts
import { useQuery } from "@tanstack/react-query"

interface UseConversionsParams {
  search: string
  page: number
}

export function useConversions({ search, page }: UseConversionsParams) {
  return useQuery({
    queryKey: ["conversions", search, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        search,
        page: page.toString(),
      })
      const res = await fetch(`/api/conversions?${params}`)
      if (!res.ok) throw new Error("Erro ao buscar conversões")
      return res.json()
    },
  })
}
