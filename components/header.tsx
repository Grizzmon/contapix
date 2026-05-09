'use client'

import { Wallet, Settings } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="p-2 bg-primary rounded-lg">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">
            BankView
          </span>
        </Link>
        
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Settings className="h-4 w-4 mr-2" />
            Admin
          </Button>
        </Link>
      </div>
    </header>
  )
}
