import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin - BankView',
  description: 'Painel administrativo do BankView',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
