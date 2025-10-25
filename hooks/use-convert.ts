// hooks/use-convert.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useConvert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { fileKey: string; title: string }) => {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      
      const json = await res.json()
      
      if (!res.ok) {
        throw new Error(json.error || "Erro ao converter")
      }
      
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversions"] })
      queryClient.invalidateQueries({ queryKey: ["stats"] })
      queryClient.invalidateQueries({ queryKey: ["subscription"] })
    },
  })
}
