// components/dashboard-layout.tsx
"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  CreditCard,
  History,
  Receipt,
  LogOut,
  Users2,
  User,
  Menu,
  X,
} from "lucide-react"
import Image from "next/image"
import { signOut, useSession } from "next-auth/react"
import { toast } from "sonner"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession() // ✅ Usar session ao invés de useUserProfile
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    const t = toast.loading("Saindo...")
    try {
      await signOut({ redirect: true, callbackUrl: "/" })
      toast.success("Sessão encerrada", { id: t })
    } catch {
      toast.error("Não foi possível encerrar a sessão", { id: t })
    }
  }

  const getDisplayName = () => {
    // ✅ Pegar nome da session
    if (!session?.user?.name) return "Admin"
    const nameParts = session.user.name.trim().split(" ").filter(Boolean)
    if (nameParts.length === 0) return "Admin"
    if (nameParts.length === 1) return nameParts[0]
    return `${nameParts[0]} ${nameParts[nameParts.length - 1]}`
  }

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/users", icon: Users, label: "Usuários" },
    { href: "/plans", icon: CreditCard, label: "Planos" },
    { href: "/history", icon: History, label: "Histórico" },
    { href: "/transactions", icon: Receipt, label: "Transações" },
    { href: "/access", icon: Users2, label: "Acessos" },
  ]

  return (
    <div className="min-h-screen bg-[#000000] flex">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-12 h-12 bg-[#90f209] rounded-xl flex items-center justify-center shadow-lg hover:bg-[#a0ff20] transition-all duration-300 hover:scale-110 active:scale-95"
      >
        {mobileMenuOpen ? <X className="w-6 h-6 text-[#000000]" /> : <Menu className="w-6 h-6 text-[#000000]" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-72 bg-[#0a0a0a]/95 backdrop-blur-xl border-r border-[#1a1a1a] transition-all duration-300 flex flex-col shadow-2xl`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[#1a1a1a]">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <Image src="/logo.png" alt="Figtor" width={160} height={40} priority className="h-10 w-auto" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item, index) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{ animationDelay: `${index * 50}ms` }}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group animate-slide-in-left ${
                  isActive
                    ? "bg-[#90f209] text-[#000000] shadow-lg shadow-[#90f209]/20"
                    : "text-[#999999] hover:bg-[#1a1a1a] hover:text-[#ffffff] hover:translate-x-1"
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "" : "group-hover:scale-110"}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#1a1a1a] px-6 lg:px-12 py-5 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <h2 className="text-[#ffffff] text-xl lg:text-2xl font-light hidden lg:block">
              Olá, <span className="font-semibold text-[#90f209]">{getDisplayName()}</span>
            </h2>

            <div className="lg:hidden w-8"></div>

            <div className="flex items-center gap-3">
              <Link
                href="/account"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a1a1a] text-[#ffffff] hover:bg-[#262626] transition-all duration-300 border border-[#262626] hover:border-[#333333] hover:scale-105 active:scale-95"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">Minha Conta</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all duration-300 border border-red-500/20 hover:border-red-500/30 hover:scale-105 active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">Sair</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-12 animate-fade-in-up">{children}</main>
      </div>
    </div>
  )
}
