'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Account } from '@/lib/types'
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
  ToggleLeft,
  ToggleRight
} from 'lucide-react'

interface AccountsManagerProps {
  accounts: Account[]
}

export function AccountsManager({ accounts }: AccountsManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const [form, setForm] = useState({
    nome: '',
    banco: '',
    documento: '',
    tipo_documento: 'cpf',
    celular: '',
    tipo_exibicao: 'cpf',
    agencia: '',
    conta: '',
    status: 'active'
  })

  const resetForm = () => {
    setForm({
      nome: '',
      banco: '',
      documento: '',
      tipo_documento: 'cpf',
      celular: '',
      tipo_exibicao: 'cpf',
      agencia: '',
      conta: '',
      status: 'active'
    })
  }

  const handleCreate = async () => {
    setLoading(true)
    await supabase.from('accounts').insert({
      nome: form.nome,
      banco: form.banco,
      documento: form.documento,
      tipo_documento: form.tipo_documento,
      celular: form.celular || null,
      tipo_exibicao: form.tipo_exibicao,
      agencia: form.agencia || null,
      conta: form.conta || null,
      status: form.status
    })
    setLoading(false)
    setIsCreateOpen(false)
    resetForm()
  }

  const handleUpdate = async () => {
    if (!editingAccount) return
    setLoading(true)
    await supabase.from('accounts').update({
      nome: form.nome,
      banco: form.banco,
      documento: form.documento,
      tipo_documento: form.tipo_documento,
      celular: form.celular || null,
      tipo_exibicao: form.tipo_exibicao,
      agencia: form.agencia || null,
      conta: form.conta || null,
      status: form.status
    }).eq('id', editingAccount.id)
    setLoading(false)
    setEditingAccount(null)
    resetForm()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta? Todas as transacoes serao excluidas tambem.')) return
    await supabase.from('accounts').delete().eq('id', id)
  }

  const handleToggleStatus = async (account: Account) => {
    const newStatus = account.status === 'active' ? 'inactive' : 'active'
    await supabase.from('accounts').update({ status: newStatus }).eq('id', account.id)
  }

  const openEdit = (account: Account) => {
    setForm({
      nome: account.nome,
      banco: account.banco,
      documento: account.documento,
      tipo_documento: account.tipo_documento,
      celular: account.celular || '',
      tipo_exibicao: account.tipo_exibicao || 'cpf',
      agencia: account.agencia || '',
      conta: account.conta || '',
      status: account.status
    })
    setEditingAccount(account)
  }

  const AccountForm = () => (
    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome Completo *</Label>
          <Input
            id="nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            placeholder="CAMILA GIMO MENDES"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="banco">Banco *</Label>
          <Input
            id="banco"
            value={form.banco}
            onChange={(e) => setForm({ ...form, banco: e.target.value })}
            placeholder="Itau Unibanco"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tipo_documento">Tipo Documento</Label>
          <Select 
            value={form.tipo_documento} 
            onValueChange={(v) => setForm({ ...form, tipo_documento: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cpf">CPF</SelectItem>
              <SelectItem value="cnpj">CNPJ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="documento">CPF/CNPJ *</Label>
          <Input
            id="documento"
            value={form.documento}
            onChange={(e) => setForm({ ...form, documento: e.target.value })}
            placeholder={form.tipo_documento === 'cpf' ? '719.425.871-47' : '12.345.678/0001-90'}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="celular">Celular</Label>
          <Input
            id="celular"
            value={form.celular}
            onChange={(e) => setForm({ ...form, celular: e.target.value })}
            placeholder="(11)987654321"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tipo_exibicao">Exibir para usuarios</Label>
          <Select 
            value={form.tipo_exibicao} 
            onValueChange={(v) => setForm({ ...form, tipo_exibicao: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cpf">CPF/CNPJ</SelectItem>
              <SelectItem value="celular">Celular</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Escolha o que aparece para os usuarios copiarem
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="agencia">Agencia (opcional)</Label>
          <Input
            id="agencia"
            value={form.agencia}
            onChange={(e) => setForm({ ...form, agencia: e.target.value })}
            placeholder="1234-5"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="conta">Conta (opcional)</Label>
          <Input
            id="conta"
            value={form.conta}
            onChange={(e) => setForm({ ...form, conta: e.target.value })}
            placeholder="12345-6"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select 
          value={form.status} 
          onValueChange={(v) => setForm({ ...form, status: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gerenciar Contas</CardTitle>
          <CardDescription>
            Adicione, edite ou remova contas bancarias
          </CardDescription>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nova Conta</DialogTitle>
              <DialogDescription>
                Preencha os dados da nova conta bancaria
              </DialogDescription>
            </DialogHeader>
            <AccountForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={loading || !form.nome || !form.banco || !form.documento}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar Conta'}
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
                <TableHead>Nome</TableHead>
                <TableHead>Banco</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Exibicao</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhuma conta cadastrada
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.nome}</TableCell>
                    <TableCell>{account.banco}</TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground uppercase mr-1">
                        {account.tipo_documento}
                      </span>
                      {account.documento}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {account.tipo_exibicao === 'celular' ? 'Celular' : 'CPF/CNPJ'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={account.status === 'active' ? 'default' : 'secondary'}>
                        {account.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(account)}
                          title={account.status === 'active' ? 'Desativar' : 'Ativar'}
                        >
                          {account.status === 'active' ? (
                            <ToggleRight className="h-4 w-4 text-green-500" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(account)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(account.id)}
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
      <Dialog open={!!editingAccount} onOpenChange={(open) => {
        if (!open) {
          setEditingAccount(null)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Conta</DialogTitle>
            <DialogDescription>
              Atualize os dados da conta bancaria
            </DialogDescription>
          </DialogHeader>
          <AccountForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAccount(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={loading || !form.nome || !form.banco || !form.documento}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
