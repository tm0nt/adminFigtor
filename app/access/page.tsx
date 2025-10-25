// app/(dashboard)/access/page.tsx
"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Plus, Edit, Trash2, X, Eye, EyeOff, Key, Shield } from "lucide-react"
import { useAdmins, useCreateAdmin, useUpdateAdmin, useDeleteAdmin, useResetPassword } from "@/hooks/use-admins"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function AccessPage() {
  const { data: session } = useSession()
  const [showModal, setShowModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<any>(null)
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState("")
  
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    role: "ADMIN",
    isActive: true,
  })

  const { data: admins, isLoading } = useAdmins()
  const createAdmin = useCreateAdmin()
  const updateAdmin = useUpdateAdmin()
  const deleteAdmin = useDeleteAdmin()
  const resetPassword = useResetPassword()

  // Verificar se é SUPER_ADMIN
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN"

  if (!isSuperAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-[#ffffff] text-2xl font-semibold mb-2">Acesso Negado</h1>
            <p className="text-[#666666]">Apenas SUPER_ADMIN pode acessar esta página</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const handleOpenModal = (admin?: any) => {
    if (admin) {
      setEditingAdmin(admin)
      setFormData({
        email: admin.email,
        name: admin.name,
        password: "",
        role: admin.role,
        isActive: admin.isActive,
      })
    } else {
      setEditingAdmin(null)
      setFormData({
        email: "",
        name: "",
        password: "",
        role: "ADMIN",
        isActive: true,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingAdmin(null)
    setGeneratedPassword("")
  }

  const generatePassword = () => {
    const length = 12
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    setFormData({ ...formData, password })
    setGeneratedPassword(password)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingAdmin && !formData.password) {
      toast.error("Senha é obrigatória para novos administradores")
      return
    }

    try {
      if (editingAdmin) {
        await updateAdmin.mutateAsync({ id: editingAdmin.id, ...formData })
        toast.success("Administrador atualizado com sucesso!")
      } else {
        await createAdmin.mutateAsync(formData)
        toast.success("Administrador criado com sucesso!")
      }
      handleCloseModal()
    } catch (error) {
      toast.error("Erro ao salvar administrador")
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja deletar o administrador "${name}"?`)) {
      try {
        await deleteAdmin.mutateAsync(id)
        toast.success("Administrador deletado com sucesso!")
      } catch (error) {
        toast.error("Erro ao deletar administrador")
      }
    }
  }

  const handleResetPassword = async () => {
    if (!selectedAdminId) return

    try {
      const result = await resetPassword.mutateAsync(selectedAdminId)
      setGeneratedPassword(result.newPassword)
      toast.success("Senha resetada com sucesso!")
    } catch (error) {
      toast.error("Erro ao resetar senha")
    }
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-slide-in-left">
          <div>
            <h1 className="text-[#ffffff] text-2xl sm:text-3xl font-semibold mb-2">Gerenciamento de Acesso</h1>
            <p className="text-[#666666]">{admins?.length || 0} administradores cadastrados</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto bg-[#90f209] text-[#000000] font-semibold px-6 py-3 rounded-xl hover:bg-[#a0ff20] transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Novo Admin
          </button>
        </div>

        {/* Admins Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="text-[#90f209] text-lg">Carregando...</div>
            </div>
          ) : (
            admins?.map((admin: any) => (
              <div
                key={admin.id}
                className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-6 hover:border-[#262626] transition-all duration-300 animate-slide-in-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#90f209] flex items-center justify-center text-[#000000] font-bold text-xl">
                    {admin.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedAdminId(admin.id)
                        setShowPasswordModal(true)
                      }}
                      className="p-2 rounded-lg bg-[#1a1a1a] text-[#ffffff] hover:bg-[#262626] transition-colors"
                      title="Resetar Senha"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenModal(admin)}
                      className="p-2 rounded-lg bg-[#1a1a1a] text-[#ffffff] hover:bg-[#262626] transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(admin.id, admin.name)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                      disabled={admin.id === session?.user?.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-[#ffffff] text-xl font-semibold mb-1">{admin.name}</h3>
                <p className="text-[#666666] text-sm mb-4 truncate">{admin.email}</p>

                <div className="flex items-center justify-between pt-4 border-t border-[#1a1a1a]">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(admin.role).color}`}>
                    {getRoleBadge(admin.role).label}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    admin.isActive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  }`}>
                    {admin.isActive ? "Ativo" : "Inativo"}
                  </span>
                </div>

                {admin.lastLoginAt && (
                  <p className="text-[#666666] text-xs mt-3">
                    Último login {formatDistanceToNow(new Date(admin.lastLoginAt), { addSuffix: true, locale: ptBR })}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Criar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in-up">
          <div className="bg-[#0f0f0f] rounded-3xl p-8 max-w-2xl w-full border border-[#1a1a1a] shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[#ffffff] text-2xl font-semibold">
                {editingAdmin ? "Editar Administrador" : "Novo Administrador"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg bg-[#1a1a1a] text-[#ffffff] hover:bg-[#262626] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[#666666] text-sm mb-2 block">Nome Completo</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#1a1a1a] text-[#ffffff] rounded-xl border border-[#262626] px-4 py-3 outline-none focus:border-[#90f209] transition-colors"
                    placeholder="João Silva"
                    required
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[#666666] text-sm mb-2 block">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-[#1a1a1a] text-[#ffffff] rounded-xl border border-[#262626] px-4 py-3 outline-none focus:border-[#90f209] transition-colors"
                    required
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="SUPPORT">Suporte</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#666666] text-sm mb-2 block">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#1a1a1a] text-[#ffffff] rounded-xl border border-[#262626] px-4 py-3 outline-none focus:border-[#90f209] transition-colors"
                  placeholder="admin@exemplo.com"
                  required
                  disabled={!!editingAdmin}
                />
              </div>

              {!editingAdmin && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[#666666] text-sm">Senha</label>
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="text-[#90f209] text-sm hover:underline"
                    >
                      Gerar Senha Forte
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-[#1a1a1a] text-[#ffffff] rounded-xl border border-[#262626] px-4 py-3 pr-12 outline-none focus:border-[#90f209] transition-colors"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#ffffff]"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {generatedPassword && (
                    <p className="text-[#90f209] text-sm mt-2">
                      ⚠️ Salve esta senha em local seguro!
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="flex items-center gap-2 text-[#ffffff]">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#90f209]"
                  />
                  Administrador Ativo
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-[#1a1a1a] text-[#ffffff] font-semibold py-3 rounded-xl hover:bg-[#262626] transition-all duration-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createAdmin.isPending || updateAdmin.isPending}
                  className="flex-1 bg-[#90f209] text-[#000000] font-bold py-3 rounded-xl hover:bg-[#a0ff20] transition-all duration-300 disabled:opacity-50"
                >
                  {editingAdmin ? "Atualizar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Resetar Senha */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0f0f] rounded-3xl p-8 max-w-md w-full border border-[#1a1a1a] shadow-2xl">
            <div className="text-center mb-6">
              <Key className="w-16 h-16 text-[#90f209] mx-auto mb-4" />
              <h2 className="text-[#ffffff] text-2xl font-semibold mb-2">Resetar Senha</h2>
              <p className="text-[#666666]">Uma nova senha será gerada automaticamente</p>
            </div>

            {generatedPassword ? (
              <div className="bg-[#1a1a1a] rounded-xl p-4 mb-6">
                <p className="text-[#666666] text-sm mb-2">Nova Senha:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-[#0f0f0f] text-[#90f209] px-4 py-3 rounded-lg font-mono text-sm">
                    {generatedPassword}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPassword)
                      toast.success("Senha copiada!")
                    }}
                    className="p-3 bg-[#90f209] text-[#000000] rounded-lg hover:bg-[#a0ff20] transition-colors"
                  >
                    📋
                  </button>
                </div>
                <p className="text-yellow-500 text-xs mt-3">
                  ⚠️ Salve esta senha! Ela não será exibida novamente.
                </p>
              </div>
            ) : null}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setSelectedAdminId(null)
                  setGeneratedPassword("")
                }}
                className="flex-1 bg-[#1a1a1a] text-[#ffffff] font-semibold py-3 rounded-xl hover:bg-[#262626] transition-all"
              >
                {generatedPassword ? "Fechar" : "Cancelar"}
              </button>
              {!generatedPassword && (
                <button
                  onClick={handleResetPassword}
                  disabled={resetPassword.isPending}
                  className="flex-1 bg-red-500 text-[#ffffff] font-semibold py-3 rounded-xl hover:bg-red-600 transition-all disabled:opacity-50"
                >
                  Resetar Senha
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
