'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      if (session.user?.role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4 bg-gradient-to-br from-background to-muted">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground">
          MarketX <span className="text-primary">Lite</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          Plataforma simples de contratos binários
        </p>
        <div className="space-y-4 text-muted-foreground">
          <p>✓ Compra e venda de contratos</p>
          <p>✓ Depósitos e saques via PIX</p>
          <p>✓ Interface simples e intuitiva</p>
          <p>✓ Taxas fixas e transparentes</p>
        </div>
        <div className="flex gap-4 justify-center pt-4">
          <Link href="/login">
            <Button size="lg" className="px-8">
              Entrar
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg" className="px-8">
              Criar Conta
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}