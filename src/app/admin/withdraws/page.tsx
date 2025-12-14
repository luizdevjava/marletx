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

interface Withdraw {
  id: string
  amount: number
  status: string
  pixKey: string
  createdAt: string
  user: {
    id: string
    name?: string
    email: string
  }
}

export default function AdminWithdrawsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [withdraws, setWithdraws] = useState<Withdraw[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchWithdraws()
    }
  }, [status])

  const fetchWithdraws = async () => {
    try {
      const response = await fetch('/api/admin/withdraws')
      if (response.ok) {
        const data = await response.json()
        setWithdraws(data)
      } else {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Erro ao carregar saques:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveWithdraw = async (withdrawId: string) => {
    try {
      const response = await fetch(`/api/admin/withdraws/${withdrawId}/approve`, {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Saque aprovado!',
          description: 'Saque aprovado com sucesso'
        })
        fetchWithdraws()
      } else {
        toast({
          title: 'Erro ao aprovar saque',
          description: data.error || 'Não foi possível aprovar o saque',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Erro ao aprovar saque',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive'
      })
    }
  }

  const handleRejectWithdraw = async (withdrawId: string) => {
    try {
      const response = await fetch(`/api/admin/withdraws/${withdrawId}/reject`, {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Saque rejeitado!',
          description: 'Saque rejeitado com sucesso'
        })
        fetchWithdraws()
      } else {
        toast({
          title: 'Erro ao rejeitar saque',
          description: data.error || 'Não foi possível rejeitar o saque',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Erro ao rejeitar saque',
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

  const pendingWithdraws = withdraws.filter(w => w.status === 'PENDING')

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
              <Link href="/admin/deposits" className="text-muted-foreground hover:text-foreground">
                Depósitos
              </Link>
              <Link href="/admin/withdraws" className="text-foreground font-medium">
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
          <h1 className="text-3xl font-bold">Gerenciar Saques</h1>
          <p className="text-muted-foreground">
            Aprove ou rejeite solicitações de saque
          </p>
        </div>

        {pendingWithdraws.length > 0 && (
          <Card className="mb-8 border-orange-200">
            <CardHeader>
              <CardTitle className="text-orange-600">
                Saques Pendentes ({pendingWithdraws.length})
              </CardTitle>
              <CardDescription>
                Saques aguardando aprovação
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <div className="space-y-6">
          {withdraws.map((withdraw) => (
            <Card key={withdraw.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {formatCurrency(withdraw.amount)}
                    </CardTitle>
                    <CardDescription>
                      {withdraw.user.name || withdraw.user.email}
                    </CardDescription>
                  </div>
                  {getStatusBadge(withdraw.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Usuário:</span>
                    <div className="font-medium">{withdraw.user.email}</div>
                    {withdraw.user.name && (
                      <div className="text-muted-foreground">{withdraw.user.name}</div>
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Data:</span>
                    <div className="font-medium">{formatDateTime(withdraw.createdAt)}</div>
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground">Chave PIX:</span>
                  <div className="font-medium">{withdraw.pixKey}</div>
                </div>

                {withdraw.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => handleApproveWithdraw(withdraw.id)}
                    >
                      Aprovar
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => handleRejectWithdraw(withdraw.id)}
                    >
                      Rejeitar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {withdraws.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhum saque encontrado.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}