// hooks/use-feedbacks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Feedback } from "@/types/notification"

export function useFeedbacks() {
  return useQuery<Feedback[]>({
    queryKey: ["feedbacks"],
    queryFn: async () => {
      const res = await fetch("/api/feedbacks")
      if (!res.ok) throw new Error("Falha ao carregar feedbacks")
      return res.json()
    },
  })
}

export function useCreateFeedback() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { rating: number; message: string; type?: string }) => {
      const res = await fetch("/api/feedbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Falha ao enviar feedback")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] })
    },
  })
}
