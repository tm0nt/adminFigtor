// hooks/use-user-profile.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { UserWithProfile, UpdateUserInput } from "@/types/user"

export function useUserProfile() {
  return useQuery<UserWithProfile>({
    queryKey: ["user", "profile"],
    queryFn: async () => {
      const res = await fetch("/api/user/profile")
      if (!res.ok) throw new Error("Falha ao carregar perfil")
      return res.json()
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos (anteriormente cacheTime)
  })
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateUserInput) => {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Falha ao atualizar perfil")
      return res.json()
    },
    onSuccess: (data) => {
      // Atualiza cache local imediatamente
      queryClient.setQueryData(["user", "profile"], data)
    },
  })
}
