// hooks/use-admin-profile.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export function useAdminProfile() {
  return useQuery({
    queryKey: ["admin-profile"],
    queryFn: async () => {
      const res = await fetch("/api/admin/profile")
      if (!res.ok) throw new Error("Erro ao buscar perfil")
      return res.json()
    },
  })
}

export function useUpdateAdminProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Erro ao atualizar perfil")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-profile"] })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Erro ao alterar senha")
      }
      return res.json()
    },
  })
}
