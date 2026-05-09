'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Transaction } from '@/lib/types'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface TransactionListProps {
  accountId: string
  initialTransactions: Transaction[]
}

export function TransactionList({ accountId, initialTransactions }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`transactions-${accountId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'transactions',
          filter: `account_id=eq.${accountId}`
        },
        async (payload: RealtimePostgresChangesPayload<Transaction>) => {
          // Buscar apenas transações de hoje
          const today = new Date().toISOString().split('T')[0]
          const { data } = await supabase
            .from('transactions')
            .select('*')
            .eq('account_id', accountId)
            .eq('data', today)
            .gt('valor', 0) // Apenas entradas
            .order('horario', { ascending: false })

          if (data) {
            setTransactions(data)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [accountId])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5)
  }

  // Ocultar parte do nome do pagador (mostrar apenas asteriscos)
  const maskName = (name: string | null) => {
    if (!name) return '*********'
    return '*********'
  }

  // Filtrar apenas transações de hoje e entradas (valor positivo)
  const today = new Date().toISOString().split('T')[0]
  const todayTransactions = transactions.filter(
    t => t.data === today && t.valor > 0
  )

  if (todayTransactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma transação hoje.
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {todayTransactions.map((transaction) => (
        <div
          key={transaction.id}
          className="py-3 border-b border-border last:border-b-0"
        >
          <p className="text-foreground">
            PIX recebido de {formatCurrency(transaction.valor)} de {maskName(transaction.pagador)} às {formatTime(transaction.horario)}
          </p>
        </div>
      ))}
    </div>
  )
}
