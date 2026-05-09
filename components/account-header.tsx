'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Copy, Check, BadgeCheck, XCircle } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { AccountWithBalance } from '@/lib/types'

interface AccountHeaderProps {
  initialAccount: AccountWithBalance
}

export function AccountHeader({ initialAccount }: AccountHeaderProps) {
  const [account, setAccount] = useState<AccountWithBalance>(initialAccount)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`account-${account.id}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'accounts',
          filter: `id=eq.${account.id}`
        },
        async () => {
          await refetchAccount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [account.id])

  const refetchAccount = async () => {
    const supabase = createClient()

    const { data: accountData } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', account.id)
      .single()

    if (accountData) {
      const { data: transactions } = await supabase
        .from('transactions')
        .select('valor, status')
        .eq('account_id', account.id)

      const paidTransactions = transactions?.filter(t => t.status === 'paid') || []
      const saldo = paidTransactions.reduce((sum, t) => sum + Number(t.valor), 0)

      setAccount({
        ...accountData,
        saldo,
        transactionCount: transactions?.length || 0,
      })
    }
  }

  const formatCPF = (doc: string) => {
    const numbers = doc.replace(/\D/g, '')
    return numbers.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
  }

  const formatCelular = (cel: string) => {
    const numbers = cel.replace(/\D/g, '')
    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)})${numbers.slice(2)}`
    }
    return cel
  }

  const getDisplayInfo = () => {
    if (account.tipo_exibicao === 'celular' && account.celular) {
      return {
        label: 'Celular',
        value: formatCelular(account.celular),
        rawValue: account.celular.replace(/\D/g, '')
      }
    }
    return {
      label: account.tipo_documento.toUpperCase(),
      value: account.tipo_documento === 'cpf' ? formatCPF(account.documento) : account.documento,
      rawValue: account.documento.replace(/\D/g, '')
    }
  }

  const displayInfo = getDisplayInfo()
  const isActive = account.status === 'active'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayInfo.rawValue)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  return (
    <div className="bg-card border-b">
      <div className="container mx-auto px-4 py-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>

        <div className="space-y-4">
          {/* Nome e Status */}
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground uppercase">
              {account.nome}
            </h1>
            <Badge 
              variant={isActive ? 'default' : 'secondary'}
              className={`shrink-0 ${
                isActive 
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {isActive ? (
                <><BadgeCheck className="h-3 w-3 mr-1" /> Ativa</>
              ) : (
                <><XCircle className="h-3 w-3 mr-1" /> Inativa</>
              )}
            </Badge>
          </div>

          {/* CPF ou Celular com botão copiar */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-muted-foreground">{displayInfo.label}:</span>
            <span className="font-mono text-foreground font-semibold text-lg">
              {displayInfo.value}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={handleCopy}
            >
              {copied ? (
                <><Check className="h-4 w-4 mr-1 text-emerald-600" /> Copiado</>
              ) : (
                <><Copy className="h-4 w-4 mr-1" /> Copiar</>
              )}
            </Button>
          </div>

          {/* Banco */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Banco:</span>
            <span className="text-foreground font-semibold uppercase">
              {account.banco}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
