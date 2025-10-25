// hooks/use-devices.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Device } from "@/types/device"

export function useDevices() {
  return useQuery<Device[]>({
    queryKey: ["devices"],
    queryFn: async () => {
      const res = await fetch("/api/devices")
      if (!res.ok) throw new Error("Falha ao carregar dispositivos")
      return res.json()
    },
  })
}

export function useRemoveDevice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (deviceId: string) => {
      const res = await fetch(`/api/devices/${deviceId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Falha ao remover dispositivo")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] })
    },
  })
}

export function useRegisterCurrentDevice() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/devices/current", { method: "POST" })
      if (!res.ok) throw new Error("Falha ao registrar dispositivo")
      return res.json()
    },
  })
}
