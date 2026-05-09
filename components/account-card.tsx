'use client'

import Link from 'next/link'
import { Copy, Check, BadgeCheck, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { AccountWithBalance } from '@/lib/types'
import { useState } from 'react'

interface AccountCardProps {
  account: AccountWithBalance
}

export function AccountCard({ account }: AccountCardProps) {
  const [copied, setCopied] = useState(false)

  const formatCPF = (doc: string) => {
    // Remove tudo que não é número
    const numbers = doc.replace(/\D/g, '')
    // Formata como XXX.XXX.XXX-XX
    return numbers.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
  }

  const formatCelular = (cel: string) => {
    // Remove tudo que não é número
    const numbers = cel.replace(/\D/g, '')
    // Formata como (XX)XXXXXXXXX
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

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      await navigator.clipboard.writeText(displayInfo.rawValue)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  return (
    <Link href={`/conta/${account.id}`}>
      <Card className={`transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer border-l-4 ${
        isActive ? 'border-l-emerald-500' : 'border-l-slate-400'
      }`}>
        <CardContent className="pt-5">
          <div className="space-y-3">
            {/* Nome e Status */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-lg text-foreground leading-tight uppercase">
                {account.nome}
              </h3>
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{displayInfo.label}:</span>
              <span className="font-mono text-foreground font-medium">
                {displayInfo.value}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>

            {/* Banco */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Banco:</span>
              <span className="text-foreground font-medium uppercase">
                {account.banco}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
