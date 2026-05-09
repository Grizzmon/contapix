"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { Loader2 } from "lucide-react"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Verificar sessão no localStorage
    const session = localStorage.getItem("admin_session")
    
    if (session) {
      try {
        const parsed = JSON.parse(session)
        // Verificar se a sessão é válida (menos de 24 horas)
        const isValid = parsed.loggedIn && (Date.now() - parsed.timestamp) < 24 * 60 * 60 * 1000
        
        if (isValid) {
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem("admin_session")
          router.push("/admin/login")
        }
      } catch {
        localStorage.removeItem("admin_session")
        router.push("/admin/login")
      }
    } else {
      router.push("/admin/login")
    }
    
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <AdminDashboard userEmail="gimomendes15@gmail.com" />
}
