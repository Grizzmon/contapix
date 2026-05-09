'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Account, Transaction } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Wallet, 
  LogOut, 
  Users, 
  ArrowLeftRight,
  Plus,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { AccountsManager } from './accounts-manager'
import { TransactionsManager } from './transactions-manager'

interface AdminDashboardProps {
  userEmail: string
}

export function AdminDashboard({ userEmail }: AdminDashboardProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      const [{ data: accountsData }, { data: transactionsData }] = await Promise.all([
        supabase.from('accounts').select('*').order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').order('created_at', { ascending: false })
      ])
      
      if (accountsData) setAccounts(accountsData)
      if (transactionsData) setTransactions(transactionsData)
      setLoading(false)
    }
    
    fetchData()
  }, [supabase])

  // Real-time subscriptions
  useEffect(() => {
    const accountsChannel = supabase
      .channel('admin-accounts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'accounts' },
        async () => {
          const { data } = await supabase
            .from('accounts')
            .select('*')
            .order('created_at', { ascending: false })
          if (data) setAccounts(data)
        }
      )
      .subscribe()

    const transactionsChannel = supabase
      .channel('admin-transactions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        async () => {
          const { data } = await supabase
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false })
          if (data) setTransactions(data)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(accountsChannel)
      supabase.removeChannel(transactionsChannel)
    }
  }, [supabase])

  const handleLogout = () => {
    localStorage.removeItem("admin_session")
    router.push('/admin/login')
  }

  const activeAccounts = accounts.filter(a => a.status === 'active').length
  const totalTransactions = transactions.length
  const todayTransactions = transactions.filter(t => {
    const today = new Date().toISOString().split('T')[0]
    return t.data === today
  }).length

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-lg">
                <Wallet className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                BankView
              </span>
            </Link>
            <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
              Admin
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {userEmail}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contas Ativas</p>
                <p className="text-2xl font-bold">{activeAccounts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <ArrowLeftRight className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Transacoes</p>
                <p className="text-2xl font-bold">{totalTransactions}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Plus className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transacoes Hoje</p>
                <p className="text-2xl font-bold">{todayTransactions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="accounts" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Contas
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4" />
              Transacoes
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="accounts">
            <AccountsManager accounts={accounts} />
          </TabsContent>
          
          <TabsContent value="transactions">
            <TransactionsManager transactions={transactions} accounts={accounts} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
