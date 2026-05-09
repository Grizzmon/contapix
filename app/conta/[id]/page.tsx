import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { AccountHeader } from '@/components/account-header'
import { TransactionList } from '@/components/transaction-list'
import type { AccountWithBalance } from '@/lib/types'

export const revalidate = 0

interface AccountPageProps {
  params: Promise<{ id: string }>
}

export default async function AccountPage({ params }: AccountPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Se Supabase não está configurado
  if (!supabase) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Configuração Necessária
            </h1>
            <p className="text-muted-foreground">
              Configure as variáveis de ambiente do Supabase.
            </p>
          </div>
        </main>
      </div>
    )
  }

  const { data: account, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !account) {
    notFound()
  }

  // Get only today's income transactions (PIX recebido)
  const today = new Date().toISOString().split('T')[0]
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('account_id', id)
    .eq('data', today)
    .gt('valor', 0) // Apenas entradas
    .order('horario', { ascending: false })

  // Calculate balance
  const paidTransactions = transactions?.filter(t => t.status === 'paid') || []
  const saldo = paidTransactions.reduce((sum, t) => sum + Number(t.valor), 0)

  const accountWithBalance: AccountWithBalance = {
    ...account,
    saldo,
    transactionCount: transactions?.length || 0,
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AccountHeader initialAccount={accountWithBalance} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Movimentações
          </h2>
        </div>
        <TransactionList 
          accountId={id} 
          initialTransactions={transactions || []} 
        />
      </main>
    </div>
  )
}
