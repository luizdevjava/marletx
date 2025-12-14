'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

interface AdminDashboard {
  totalUsers: number
  totalContracts: number
  activeContracts: number
  totalDeposits: number
  pendingDeposits: number
  totalWithdraws: number
  pendingWithdraws: number
  platformBalance: number
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<AdminDashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData()
    }
  }, [status])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
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
            <Link href="/admin" className="text-xl font-bold">
              MarketX Lite Admin
            </Link>
            <nav className="hidden md:flex space-x-4">
              <Link href="/admin" className="text-foreground font-medium">
                Dashboard
              </Link>
              <Link href="/admin/contracts" className="text-muted-foreground hover:text-foreground">
                Contratos
              </Link>
              <Link href="/admin/deposits" className="text-muted-foreground hover:text-foreground">
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
          <h1 className="text-3xl font-bold">Dashboard Admin</h1>
          <p className="text-muted-foreground">
            Visão geral da plataforma
          </p>
        </div>

        {dashboardData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.totalUsers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.activeContracts}</div>
                  <p className="text-xs text-muted-foreground">
                    de {dashboardData.totalContracts} totais
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Depósitos Pendentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.pendingDeposits}</div>
                  <p className="text-xs text-muted-foreground">
                    de {dashboardData.totalDeposits} totais
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Saques Pendentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.pendingWithdraws}</div>
                  <p className="text-xs text-muted-foreground">
                    de {dashboardData.totalWithdraws} totais
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Saldo da Plataforma</CardTitle>
                <CardDescription>
                  Total de fundos dos usuários na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(dashboardData.platformBalance)}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href="/admin/contracts">
                    <Button className="w-full">
                      Gerenciar Contratos
                    </Button>
                  </Link>
                  <Link href="/admin/deposits">
                    <Button variant="outline" className="w-full">
                      Aprovar Depósitos ({dashboardData.pendingDeposits})
                    </Button>
                  </Link>
                  <Link href="/admin/withdraws">
                    <Button variant="outline" className="w-full">
                      Aprovar Saques ({dashboardData.pendingWithdraws})
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo Financeiro</CardTitle>
                  <CardDescription>
                    Estatísticas da plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Usuários na plataforma:</span>
                    <span className="font-medium">{dashboardData.totalUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contratos ativos:</span>
                    <span className="font-medium">{dashboardData.activeContracts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Depósitos pendentes:</span>
                    <span className="font-medium">{dashboardData.pendingDeposits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saques pendentes:</span>
                    <span className="font-medium">{dashboardData.pendingWithdraws}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  )
}