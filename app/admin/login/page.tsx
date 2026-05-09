"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Mail, AlertCircle, ArrowLeft, Wallet } from "lucide-react"
import Link from "next/link"

// Credenciais do admin (fixas - só você consegue entrar)
const ADMIN_EMAIL = "gimomendes15@gmail.com"
const ADMIN_PASSWORD = "kamiralok"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Simular delay de verificação
    await new Promise(resolve => setTimeout(resolve, 500))

    // Verificar credenciais - só aceita as suas
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Salvar sessão no localStorage
      localStorage.setItem("admin_session", JSON.stringify({
        email: ADMIN_EMAIL,
        loggedIn: true,
        timestamp: Date.now()
      }))
      router.push("/admin")
    } else {
      setError("Email ou senha incorretos")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="p-3 bg-primary rounded-lg">
                <Wallet className="h-6 w-6 text-primary-foreground" />
              </div>
            </Link>
          </div>
          <CardTitle className="text-2xl">Painel Admin</CardTitle>
          <CardDescription>
            Acesso restrito ao administrador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            <Link href="/" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Voltar para o site
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
