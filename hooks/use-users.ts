// hooks/use-users.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

interface UseUsersParams {
  search: string
  page: number
  statusFilter: string
  planFilter: string
}

export function useUsers({ search, page, statusFilter, planFilter }: UseUsersParams) {
  return useQuery({
    queryKey: ["users", search, page, statusFilter, planFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        search,
        page: page.toString(),
        statusFilter,
        planFilter,
      })
      const res = await fetch(`/api/users?${params}`)
      if (!res.ok) throw new Error("Erro ao buscar usuários")
      return res.json()
    },
  })
}

export function useUserDetails(userId: string) {
  return useQuery({
    queryKey: ["user-details", userId],
    queryFn: async () => {
      if (!userId) return null
      const res = await fetch(`/api/users/${userId}`)
      if (!res.ok) throw new Error("Erro ao buscar detalhes do usuário")
      return res.json()
    },
    enabled: !!userId,
  })
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const res = await fetch(`/api/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      })
      if (!res.ok) throw new Error("Erro ao atualizar status")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["user-details"] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Erro ao deletar usuário")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, planId }: { // SEM customLimit
      userId: string
      planId: string
    }) => {
      const res = await fetch(`/api/users/${userId}/subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }), // SEM customLimit
      })
      if (!res.ok) throw new Error("Erro ao criar assinatura")
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-details", variables.userId] })
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}
