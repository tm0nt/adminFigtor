// hooks/use-admins.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export function useAdmins() {
  return useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const res = await fetch("/api/admins")
      if (!res.ok) throw new Error("Erro ao buscar administradores")
      return res.json()
    },
  })
}

export function useCreateAdmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Erro ao criar administrador")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] })
    },
  })
}

export function useUpdateAdmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await fetch(`/api/admins/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Erro ao atualizar administrador")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] })
    },
  })
}

export function useDeleteAdmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admins/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Erro ao deletar administrador")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] })
    },
  })
}

export function useResetPassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admins/${id}/reset-password`, {
        method: "POST",
      })
      if (!res.ok) throw new Error("Erro ao resetar senha")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] })
    },
  })
}
