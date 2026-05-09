import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { AccountsGrid } from '@/components/accounts-grid'
import type { AccountWithBalance } from '@/lib/types'

export const revalidate = 0

export default async function HomePage() {
  const supabase = await createClient()

  // Se Supabase não está configurado, mostra mensagem
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
              Configure as variáveis de ambiente do Supabase para visualizar as contas.
            </p>
          </div>
        </main>
      </div>
    )
  }

  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: false })

  // Calculate balance for each account
  const accountsWithBalance: AccountWithBalance[] = await Promise.all(
    (accounts || []).map(async (account) => {
      const { data: transactions } = await supabase
        .from('transactions')
        .select('valor, status')
        .eq('account_id', account.id)

      const paidTransactions = transactions?.filter(t => t.status === 'paid') || []
      const saldo = paidTransactions.reduce((sum, t) => sum + Number(t.valor), 0)

      return {
        ...account,
        saldo,
        transactionCount: transactions?.length || 0,
      }
    })
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Contas Bancárias
          </h1>
          <p className="text-muted-foreground">
            Visualize todas as contas demonstrativas e suas movimentações em tempo real.
          </p>
        </div>
        <AccountsGrid initialAccounts={accountsWithBalance} />
      </main>
    </div>
  )
}
