// hooks/use-payments.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export function usePayments() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const res = await fetch("/api/payments")
      if (!res.ok) throw new Error("Falha ao carregar pagamentos")
      return res.json()
    },
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { planId: string; method: string }) => {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Falha ao criar pagamento")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] })
    },
  })
}

export function usePaymentCards() {
  return useQuery({
    queryKey: ["payment-cards"],
    queryFn: async () => {
      const res = await fetch("/api/payment-cards")
      if (!res.ok) throw new Error("Falha ao carregar cartões")
      return res.json()
    },
  })
}

export function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const res = await fetch("/api/plans")
      if (!res.ok) throw new Error("Falha ao carregar planos")
      return res.json()
    },
  })
}
