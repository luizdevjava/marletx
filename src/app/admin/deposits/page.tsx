'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

interface Deposit {
  id: string
  amount: number
  status: string
  pixKey?: string
  proofUrl?: string
  createdAt: string
  user: {
    id: string
    name?: string
    email: string
  }
}

export default function AdminDepositsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDeposits()
    }
  }, [status])

  const fetchDeposits = async () => {
    try {
      const response = await fetch('/api/admin/deposits')
      if (response.ok) {
        const data = await response.json()
        setDeposits(data)
      } else {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Erro ao carregar depósitos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveDeposit = async (depositId: string) => {
    try {
      const response = await fetch(`/api/admin/deposits/${depositId}/approve`, {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Depósito aprovado!',
          description: 'Depósito aprovado com sucesso'
        })
        fetchDeposits()
      } else {
        toast({
          title: 'Erro ao aprovar depósito',
          description: data.error || 'Não foi possível aprovar o depósito',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Erro ao aprovar depósito',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive'
      })
    }
  }

  const handleRejectDeposit = async (depositId: string) => {
    try {
      const response = await fetch(`/api/admin/deposits/${depositId}/reject`, {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Depósito rejeitado!',
          description: 'Depósito rejeitado com sucesso'
        })
        fetchDeposits()
      } else {
        toast({
          title: 'Erro ao rejeitar depósito',
          description: data.error || 'Não foi possível rejeitar o depósito',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Erro ao rejeitar depósito',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive'
      })
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-500">Aprovado</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">Rejeitado</Badge>
      default:
        return <Badge variant="secondary">Pendente</Badge>
    }
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

  const pendingDeposits = deposits.filter(d => d.status === 'PENDING')

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="text-xl font-bold">
              MarketX Lite Admin
            </Link>
            <nav className="hidden md:flex space-x-4">
              <Link href="/admin" className="text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
              <Link href="/admin/contracts" className="text-muted-foreground hover:text-foreground">
                Contratos
              </Link>
              <Link href="/admin/deposits" className="text-foreground font-medium">
                Depósitos
              </Link>
              <Link href="/admin/withdraws" className="text-muted-foreground hover:text-foreground">
                Saques
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary">Admin</Badge>
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
          <h1 className="text-3xl font-bold">Gerenciar Depósitos</h1>
          <p className="text-muted-foreground">
            Aprove ou rejeite solicitações de depósito
          </p>
        </div>

        {pendingDeposits.length > 0 && (
          <Card className="mb-8 border-orange-200">
            <CardHeader>
              <CardTitle className="text-orange-600">
                Depósitos Pendentes ({pendingDeposits.length})
              </CardTitle>
              <CardDescription>
                Depósitos aguardando aprovação
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <div className="space-y-6">
          {deposits.map((deposit) => (
            <Card key={deposit.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {formatCurrency(deposit.amount)}
                    </CardTitle>
                    <CardDescription>
                      {deposit.user.name || deposit.user.email}
                    </CardDescription>
                  </div>
                  {getStatusBadge(deposit.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Usuário:</span>
                    <div className="font-medium">{deposit.user.email}</div>
                    {deposit.user.name && (
                      <div className="text-muted-foreground">{deposit.user.name}</div>
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Data:</span>
                    <div className="font-medium">{formatDateTime(deposit.createdAt)}</div>
                  </div>
                </div>

                {deposit.pixKey && (
                  <div>
                    <span className="text-muted-foreground">Chave PIX:</span>
                    <div className="font-medium">{deposit.pixKey}</div>
                  </div>
                )}

                {deposit.proofUrl && (
                  <div>
                    <span className="text-muted-foreground">Comprovante:</span>
                    <div>
                      <a 
                        href={deposit.proofUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Ver comprovante
                      </a>
                    </div>
                  </div>
                )}

                {deposit.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => handleApproveDeposit(deposit.id)}
                    >
                      Aprovar
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => handleRejectDeposit(deposit.id)}
                    >
                      Rejeitar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {deposits.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhum depósito encontrado.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}