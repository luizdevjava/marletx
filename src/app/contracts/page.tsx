'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDateTime } from '@/lib/utils'

interface Contract {
  id: string
  title: string
  description: string
  price: number
  expiresAt: string
  status: string
  result?: string
  userPosition?: {
    quantity: number
    type: string
    averagePrice: number
  }
}

export default function ContractsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchContracts()
    }
  }, [status])

  const fetchContracts = async () => {
    try {
      const response = await fetch('/api/contracts')
      if (response.ok) {
        const data = await response.json()
        setContracts(data)
      }
    } catch (error) {
      console.error('Erro ao carregar contratos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const getStatusBadge = (status: string, result?: string) => {
    if (status === 'RESOLVED') {
      return result === 'SIM' ? (
        <Badge className="bg-green-500">Sim ✅</Badge>
      ) : (
        <Badge variant="destructive">Não ❌</Badge>
      )
    }
    return <Badge variant="secondary">Ativo</Badge>
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-xl font-bold">
              MarketX Lite
            </Link>
            <nav className="hidden md:flex space-x-4">
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
              <Link href="/contracts" className="text-foreground font-medium">
                Contratos
              </Link>
              <Link href="/wallet" className="text-muted-foreground hover:text-foreground">
                Carteira
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {session.user?.email}
            </span>
            <Button variant="outline" onClick={handleSignOut}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Contratos</h1>
          <p className="text-muted-foreground">
            Contratos binários disponíveis para negociação
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contracts.map((contract) => (
            <Card key={contract.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{contract.title}</CardTitle>
                  {getStatusBadge(contract.status, contract.result)}
                </div>
                <CardDescription className="line-clamp-2">
                  {contract.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Preço</span>
                  <span className="font-bold">{formatCurrency(contract.price)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Expira em</span>
                  <span className="text-sm">{formatDateTime(contract.expiresAt)}</span>
                </div>

                {contract.userPosition && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium mb-1">Sua posição</div>
                    <div className="flex justify-between text-sm">
                      <span>{contract.userPosition.quantity} contratos</span>
                      <span>{formatCurrency(contract.userPosition.averagePrice)}</span>
                    </div>
                  </div>
                )}

                {contract.status === 'ACTIVE' && (
                  <div className="flex gap-2">
                    <Link href={`/contracts/${contract.id}`} className="flex-1">
                      <Button className="w-full">
                        {contract.userPosition ? 'Gerenciar' : 'Negociar'}
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {contracts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhum contrato disponível no momento.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}