// hooks/use-admin-stats.ts
import { useQuery } from "@tanstack/react-query"

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats")
      if (!res.ok) throw new Error("Erro ao buscar estatísticas")
      return res.json()
    },
    refetchInterval: 30000, // Atualiza a cada 30s
  })
}
