// middleware.ts
import authConfig from "./auth.config"
import NextAuth from "next-auth"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Rotas que só usuários NÃO logados podem acessar (páginas de autenticação)
  const authRoutes = ["/", "/signup", "/auth/forgot-password", "/auth/reset-password"]
  const isAuthRoute = authRoutes.includes(nextUrl.pathname)

  // Rotas públicas que TODOS podem acessar (API e assets)
const isPublicAPI =
  nextUrl.pathname.startsWith("/api/auth/") ||
  nextUrl.pathname.startsWith("/api/register") ||
  nextUrl.pathname.startsWith("/api/forgot-password") ||
  nextUrl.pathname.startsWith("/api/reset-password")


  // Libera API routes e assets públicos sempre
  if (isPublicAPI) {
    return NextResponse.next()
  }

  // Se usuário está LOGADO e tenta acessar páginas de auth → redireciona para dashboard
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin))
  }

  // Se usuário NÃO está logado e tenta acessar rota protegida → redireciona para login
  if (!isLoggedIn && !isAuthRoute) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search)
    return NextResponse.redirect(new URL(`/?callbackUrl=${callbackUrl}`, nextUrl.origin))
  }

  // Casos permitidos:
  // - Usuário logado acessando rota protegida
  // - Usuário não logado acessando rota de auth
  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets|logo\\.png).*)"],
}
