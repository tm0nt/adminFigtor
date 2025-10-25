// app/(dashboard)/account/page.tsx
"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAdminProfile, useUpdateAdminProfile, useChangePassword } from "@/hooks/use-admin-profile"
import { toast } from "sonner"
import { Eye, EyeOff, User, Lock, Mail, Shield } from "lucide-react"

export default function AccountPage() {
  const { data, isLoading } = useAdminProfile()
  const updateProfile = useUpdateAdminProfile()
  const changePassword = useChangePassword()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || "",
        email: data.email || "",
      })
    }
  }, [data])

  const validatePasswordForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Senha atual obrigatória"
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "Nova senha obrigatória"
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "Senha deve ter no mínimo 8 caracteres"
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Senhas não conferem"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório")
      return
    }

    const t = toast.loading("Salvando...")

    try {
      await updateProfile.mutateAsync({
        name: formData.name,
      })
      toast.success("Dados atualizados com sucesso!", { id: t })
    } catch (error) {
      toast.error("Erro ao atualizar dados", { id: t })
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePasswordForm()) {
      toast.error("Corrija os erros no formulário")
      return
    }

    const t = toast.loading("Alterando senha...")

    try {
      await changePassword.mutateAsync({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      toast.success("Senha alterada com sucesso!", { id: t })
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setErrors({})
    } catch (error: any) {
      toast.error(error.message || "Erro ao alterar senha", { id: t })
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-[#666666]">Carregando...</div>
        </div>
      </DashboardLayout>
    )
  }

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      SUPER_ADMIN: { color: "bg-[#90f209]/10 text-[#90f209]", label: "Super Admin" },
      ADMIN: { color: "bg-blue-500/10 text-blue-500", label: "Admin" },
      SUPPORT: { color: "bg-purple-500/10 text-purple-500", label: "Suporte" },
    }
    return badges[role] || badges.ADMIN
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-8">
        {/* Header com Info do Admin */}
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-[#90f209] flex items-center justify-center text-[#000000] font-bold text-3xl flex-shrink-0">
              {data?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="flex-1">
              <h1 className="text-[#ffffff] text-3xl font-semibold mb-2">{data?.name || "Admin"}</h1>
              <p className="text-[#666666] mb-3">{data?.email}</p>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(data?.role || "ADMIN").color}`}>
                  <Shield className="w-3 h-3 inline mr-1" />
                  {getRoleBadge(data?.role || "ADMIN").label}
                </span>
                {data?.lastLoginAt && (
                  <span className="text-[#666666] text-xs">
                    Último acesso: {new Date(data.lastLoginAt).toLocaleString("pt-BR")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dados Pessoais */}
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-8">
          <h2 className="text-[#ffffff] text-2xl font-semibold mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-[#90f209]" />
            Dados Pessoais
          </h2>

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[#ffffff] text-sm block mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#1a1a1a] text-[#ffffff] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#90f209] transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-[#ffffff] text-sm block mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  E-mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full bg-[#262626] text-[#666666] rounded-xl px-4 py-3 cursor-not-allowed"
                />
                <p className="text-[#666666] text-xs mt-1">O e-mail não pode ser alterado</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={updateProfile.isPending}
                className="bg-[#90f209] text-[#000000] font-semibold px-8 py-3 rounded-xl hover:bg-[#a0ff20] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              >
                {updateProfile.isPending ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </div>

        {/* Alterar Senha */}
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-8">
          <h2 className="text-[#ffffff] text-2xl font-semibold mb-6 flex items-center gap-2">
            <Lock className="w-6 h-6 text-[#90f209]" />
            Alterar Senha
          </h2>

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <label className="text-[#ffffff] text-sm block mb-2">
                Senha Atual <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className={`w-full bg-[#1a1a1a] text-[#ffffff] rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 transition-all ${
                    errors.currentPassword ? "ring-2 ring-red-500" : "focus:ring-[#90f209]"
                  }`}
                  placeholder="Digite sua senha atual"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#ffffff] transition-colors"
                >
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[#ffffff] text-sm block mb-2">
                  Nova Senha <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className={`w-full bg-[#1a1a1a] text-[#ffffff] rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 transition-all ${
                      errors.newPassword ? "ring-2 ring-red-500" : "focus:ring-[#90f209]"
                    }`}
                    placeholder="Mínimo 8 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#ffffff] transition-colors"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
              </div>

              <div>
                <label className="text-[#ffffff] text-sm block mb-2">
                  Confirmar Nova Senha <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className={`w-full bg-[#1a1a1a] text-[#ffffff] rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 transition-all ${
                      errors.confirmPassword ? "ring-2 ring-red-500" : "focus:ring-[#90f209]"
                    }`}
                    placeholder="Repita a nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#ffffff] transition-colors"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#262626]">
              <p className="text-[#666666] text-sm">
                <strong className="text-[#ffffff]">Dica de Segurança:</strong> Use uma senha forte com pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.
              </p>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
                  setErrors({})
                }}
                className="bg-[#1a1a1a] text-[#ffffff] font-semibold px-8 py-3 rounded-xl hover:bg-[#262626] transition-all duration-300 border border-[#262626]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={changePassword.isPending}
                className="bg-[#90f209] text-[#000000] font-semibold px-8 py-3 rounded-xl hover:bg-[#a0ff20] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              >
                {changePassword.isPending ? "Alterando..." : "Alterar Senha"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
