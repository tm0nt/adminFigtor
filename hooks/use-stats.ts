// hooks/use-stats.ts
import { useQuery } from "@tanstack/react-query"

export function useStats(period = "7D") {
  return useQuery({
    queryKey: ["stats", period],
    queryFn: async () => {
      const res = await fetch(`/api/stats?period=${period}`)
      if (!res.ok) throw new Error("Falha ao carregar estatísticas")
      return res.json()
    },
  })
}
