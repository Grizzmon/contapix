export interface Account {
  id: string
  nome: string
  banco: string
  documento: string
  tipo_documento: 'cpf' | 'cnpj'
  celular: string | null
  tipo_exibicao: 'cpf' | 'celular'
  agencia: string | null
  conta: string | null
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  account_id: string
  valor: number
  descricao: string
  horario: string
  data: string
  status: 'paid' | 'pending' | 'cancelled'
  pagador: string | null
  created_at: string
}

export interface AccountWithBalance extends Account {
  saldo: number
  transactionCount: number
}
