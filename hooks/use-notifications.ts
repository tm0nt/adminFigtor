// hooks/use-notifications.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Notification } from "@/types/notification"

export function useNotifications(unreadOnly = false) {
  return useQuery<Notification[]>({
    queryKey: ["notifications", unreadOnly],
    queryFn: async () => {
      const params = unreadOnly ? "?unreadOnly=true" : ""
      const res = await fetch(`/api/notifications${params}`)
      if (!res.ok) throw new Error("Falha ao carregar notificações")
      return res.json()
    },
    staleTime: 1000 * 30, // 30 segundos
    refetchInterval: 1000 * 60, // refetch a cada 1 minuto
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, read }: { id: string; read: boolean }) => {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read }),
      })
      if (!res.ok) throw new Error("Falha ao atualizar notificação")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications/mark-all-read", { method: "POST" })
      if (!res.ok) throw new Error("Falha ao marcar todas como lidas")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Falha ao deletar notificação")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}
