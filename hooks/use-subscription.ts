// hooks/use-subscription.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export function useSubscription() {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const res = await fetch("/api/subscription")
      if (!res.ok) throw new Error("Falha ao carregar assinatura")
      const data = await res.json()
      return data.subscription
    },
  })
}

export function useActivateFreePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/subscription/activate-free", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Falha ao ativar plano FREE")
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] })
    },
  })
}

export function useCancelSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/subscription/cancel", { method: "POST" })
      if (!res.ok) throw new Error("Falha ao cancelar assinatura")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] })
    },
  })
}

export function useReactivateSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/subscription/reactivate", { method: "POST" })
      if (!res.ok) throw new Error("Falha ao reativar assinatura")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] })
    },
  })
}

export function useCheckFreePlanEligibility() {
  return useQuery({
    queryKey: ["free-plan-eligibility"],
    queryFn: async () => {
      const res = await fetch("/api/user/free-plan-eligibility")
      if (!res.ok) throw new Error("Falha ao verificar elegibilidade")
      return res.json()
    },
  })
}
