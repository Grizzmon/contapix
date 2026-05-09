'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AccountCard } from './account-card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Account, AccountWithBalance, Transaction } from '@/lib/types'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface AccountsGridProps {
  initialAccounts: AccountWithBalance[]
}

export function AccountsGrid({ initialAccounts }: AccountsGridProps) {
  const [accounts, setAccounts] = useState<AccountWithBalance[]>(initialAccounts)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return

    // Subscribe to realtime changes
    const accountsChannel = supabase
      .channel('accounts-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'accounts' },
        async (payload: RealtimePostgresChangesPayload<Account>) => {
          await refetchAccounts()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        async (payload: RealtimePostgresChangesPayload<Transaction>) => {
          await refetchAccounts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(accountsChannel)
    }
  }, [])

  const refetchAccounts = async () => {
    const supabase = createClient()
    if (!supabase) return

    setLoading(true)

    const { data: accountsData } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false })

    if (accountsData) {
      const accountsWithBalance = await Promise.all(
        accountsData.map(async (account) => {
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
          } as AccountWithBalance
        })
      )

      setAccounts(accountsWithBalance)
    }

    setLoading(false)
  }

  if (loading && accounts.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhuma conta cadastrada ainda.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {accounts.map((account) => (
        <AccountCard key={account.id} account={account} />
      ))}
    </div>
  )
}
