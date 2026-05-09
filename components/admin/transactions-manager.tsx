'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Account, Transaction } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2,
  ArrowDownRight
} from 'lucide-react'

interface TransactionsManagerProps {
  transactions: Transaction[]
  accounts: Account[]
}

export function TransactionsManager({ transactions, accounts }: TransactionsManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const [form, setForm] = useState({
    account_id: '',
    valor: '',
    pagador: '',
    horario: '',
    data: new Date().toISOString().split('T')[0],
  })

  const resetForm = () => {
    setForm({
      account_id: '',
      valor: '',
      pagador: '',
      horario: '',
      data: new Date().toISOString().split('T')[0],
    })
  }

  const handleCreate = async () => {
    setLoading(true)
    await supabase.from('transactions').insert({
      account_id: form.account_id,
      valor: Math.abs(parseFloat(form.valor)), // Sempre positivo (entrada)
      descricao: 'PIX recebido',
      pagador: form.pagador,
      horario: form.horario,
      data: form.data,
      status: 'paid'
    })
    setLoading(false)
    setIsCreateOpen(false)
    resetForm()
  }

  const handleUpdate = async () => {
    if (!editingTransaction) return
    setLoading(true)
    await supabase.from('transactions').update({
      account_id: form.account_id,
      valor: Math.abs(parseFloat(form.valor)), // Sempre positivo (entrada)
      descricao: 'PIX recebido',
      pagador: form.pagador,
      horario: form.horario,
      data: form.data,
      status: 'paid'
    }).eq('id', editingTransaction.id)
    setLoading(false)
    setEditingTransaction(null)
    resetForm()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transacao?')) return
    await supabase.from('transactions').delete().eq('id', id)
  }

  const openEdit = (transaction: Transaction) => {
    setForm({
      account_id: transaction.account_id,
      valor: transaction.valor.toString(),
      pagador: transaction.pagador || '',
      horario: transaction.horario,
      data: transaction.data,
    })
    setEditingTransaction(transaction)
  }

  const getAccountName = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId)
    return account?.nome || 'Conta removida'
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('pt-BR')
  }

  const TransactionForm = () => (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="account">Conta</Label>
        <Select 
          value={form.account_id} 
          onValueChange={(v) => setForm({ ...form, account_id: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma conta" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.nome} - {account.banco}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="valor">Valor do PIX</Label>
          <Input
            id="valor"
            type="number"
            step="0.01"
            min="0"
            value={form.valor}
            onChange={(e) => setForm({ ...form, valor: e.target.value })}
            placeholder="150.00"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pagador">Nome do Pagador</Label>
          <Input
            id="pagador"
            value={form.pagador}
            onChange={(e) => setForm({ ...form, pagador: e.target.value })}
            placeholder="Joao Silva"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="data">Data</Label>
          <Input
            id="data"
            type="date"
            value={form.data}
            onChange={(e) => setForm({ ...form, data: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="horario">Horario</Label>
          <Input
            id="horario"
            type="time"
            value={form.horario}
            onChange={(e) => setForm({ ...form, horario: e.target.value })}
          />
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground">
        O nome do pagador aparece como ********* para os usuarios.
      </p>
    </div>
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gerenciar PIX Recebidos</CardTitle>
          <CardDescription>
            Adicione, edite ou remova transacoes de PIX recebido
          </CardDescription>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo PIX Recebido
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Novo PIX Recebido</DialogTitle>
              <DialogDescription>
                Adicione um novo PIX recebido em uma conta
              </DialogDescription>
            </DialogHeader>
            <TransactionForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreate} 
                disabled={loading || !form.account_id || !form.valor || !form.horario}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Adicionar PIX'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Conta</TableHead>
                <TableHead>Pagador</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhum PIX cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {getAccountName(transaction.account_id)}
                    </TableCell>
                    <TableCell>{transaction.pagador || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <ArrowDownRight className="h-4 w-4 text-green-500" />
                        <span className="text-green-600">
                          {formatCurrency(transaction.valor)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDate(transaction.data)} {transaction.horario.slice(0, 5)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(transaction)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(transaction.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={!!editingTransaction} onOpenChange={(open) => {
        if (!open) {
          setEditingTransaction(null)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar PIX Recebido</DialogTitle>
            <DialogDescription>
              Atualize os dados do PIX
            </DialogDescription>
          </DialogHeader>
          <TransactionForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTransaction(null)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdate} 
              disabled={loading || !form.account_id || !form.valor || !form.horario}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
