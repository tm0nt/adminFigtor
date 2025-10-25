// app/page.tsx
"use client"

import { useState, Suspense } from "react"
import { Mail, KeyRound, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()

  function resolveCallbackUrl(): string {
    const param = searchParams.get("callbackUrl")
    let cb: string = "/dashboard"

    if (!param) return cb

    try {
      if (param.startsWith("/")) return param

      const u = new URL(param, window.location.origin)
      if (u.origin === window.location.origin) {
        return u.pathname + u.search + u.hash
      }
    } catch {
      // ignora inválido
    }
    return cb
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const t = toast.loading("Entrando...")

    try {
      const callbackUrl = resolveCallbackUrl()

      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      })

      if (res?.error) {
        toast.error("Credenciais inválidas", { id: t })
        return
      }

      toast.success("Login realizado com sucesso!", { id: t })

      if (res?.url) {
        router.push(res.url)
      } else {
        router.push(callbackUrl)
      }
    } catch {
      toast.error("Erro ao autenticar", { id: t })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#000000] relative overflow-hidden flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#90f209]/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#90f209]/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="mb-12 animate-fade-in-down relative z-10">
        <div className="flex items-center justify-center">
          <Image src="/logo.png" alt="Figtor" width={160} height={40} priority className="h-10 w-auto" />
        </div>
      </div>

      <div className="w-full max-w-md animate-fade-in-up relative z-10">
        <h1 className="text-[#ffffff] text-3xl font-light text-center mb-2 text-balance">
          Insira abaixo seus dados
        </h1>
        <p className="text-[#666666] text-center mb-8 text-sm">Acesse sua conta e comece a criar</p>

        <form className="space-y-5" onSubmit={handleLogin}>
          <div className="group">
            <label className="text-[#ffffff] text-sm font-medium block mb-2">Insira aqui seu e-mail de cadastro</label>
            <div className="relative">
              <Mail
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 ${
                  emailFocused ? "text-[#90f209] scale-110" : "text-[#666666]"
                }`}
              />
              <input
                type="email"
                placeholder="seu@email.com"
                className="w-full bg-[#0f0f0f] text-[#ffffff] placeholder:text-[#666666] rounded-xl border-2 border-[#1a1a1a] pl-12 pr-4 py-4 outline-none transition-all duration-300 focus:border-[#90f209] focus:bg-[#1a1a1a] focus:shadow-[0_0_20px_rgba(144,242,9,0.1)]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                required
              />
            </div>
          </div>

          <div className="group">
            <label className="text-[#ffffff] text-sm font-medium block mb-2">Sua senha</label>
            <div className="relative">
              <KeyRound
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 ${
                  passwordFocused ? "text-[#90f209] scale-110" : "text-[#666666]"
                }`}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full bg-[#0f0f0f] text-[#ffffff] placeholder:text-[#666666] rounded-xl border-2 border-[#1a1a1a] pl-12 pr-12 py-4 outline-none transition-all duration-300 focus:border-[#90f209] focus:bg-[#1a1a1a] focus:shadow-[0_0_20px_rgba(144,242,9,0.1)]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#90f209] transition-all duration-200 hover:scale-110"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#90f209] text-[#000000] font-bold py-4 rounded-xl hover:bg-[#a0ff20] transition-all duration-300 hover:shadow-[0_0_30px_rgba(144,242,9,0.3)] hover:scale-[1.02] active:scale-[0.98] mt-6 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "ENTRAR AGORA"}
          </button>

        </form>

      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-[#90f209] text-lg">Carregando...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
