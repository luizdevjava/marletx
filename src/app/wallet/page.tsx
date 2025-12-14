'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

interface WalletData {
  balance: number
  deposits: Deposit[]
  withdraws: Withdraw[]
}

interface Deposit {
  id: string
  amount: number
  status: string
  pixKey?: string
  proofUrl?: string
  createdAt: string
}

interface Withdraw {
  id: string
  amount: number
  status: string
  pixKey: string
  createdAt: string
}

export default function WalletPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [pixKey, setPixKey] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchWalletData()
    }
  }, [status])

  const fetchWalletData = async () => {
    try {
      const response = await fetch('/api/wallet')
      if (response.ok) {
        const data = await response.json()
        setWalletData(data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados da carteira:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: 'Valor inválido',
        description: 'Digite um valor válido para depósito',
        variant: 'destructive'
      })
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: parseFloat(depositAmount) })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Solicitação de depósito criada!',
          description: 'Envie o comprovante para aprovação'
        })
        setDepositAmount('')
        fetchWalletData()
      } else {
        toast({
          title: 'Erro no depósito',
          description: data.error || 'Não foi possível criar a solicitação',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Erro no depósito',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: 'Valor inválido',
        description: 'Digite um valor válido para saque',
        variant: 'destructive'
      })
      return
    }

    if (!pixKey) {
      toast({
        title: 'Chave PIX obrigatória',
        description: 'Digite sua chave PIX para saque',
        variant: 'destructive'
      })
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          amount: parseFloat(withdrawAmount),
          pixKey 
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Solicitação de saque criada!',
          description: 'Aguarde a aprovação'
        })
        setWithdrawAmount('')
        setPixKey('')
        fetchWalletData()
      } else {
        toast({
          title: 'Erro no saque',
          description: data.error || 'Não foi possível criar a solicitação',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Erro no saque',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
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
              <Link href="/contracts" className="text-muted-foreground hover:text-foreground">
                Contratos
              </Link>
              <Link href="/wallet" className="text-foreground font-medium">
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
          <h1 className="text-3xl font-bold">Carteira</h1>
          <p className="text-muted-foreground">
            Gerencie seus depósitos e saques
          </p>
        </div>

        {walletData && (
          <>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Saldo Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(walletData.balance)}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Depósito</CardTitle>
                  <CardDescription>
                    Solicite um depósito via PIX
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="depositAmount">Valor</Label>
                    <Input
                      id="depositAmount"
                      type="number"
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleDeposit}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processando...' : 'Solicitar Depósito'}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Após a solicitação, envie o comprovante para aprovação
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Saque</CardTitle>
                  <CardDescription>
                    Solicite um saque via PIX
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="withdrawAmount">Valor</Label>
                    <Input
                      id="withdrawAmount"
                      type="number"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pixKey">Chave PIX</Label>
                    <Input
                      id="pixKey"
                      placeholder="CPF, CNPJ, Email ou Telefone"
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleWithdraw}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processando...' : 'Solicitar Saque'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Depósitos</CardTitle>
                </CardHeader>
                <CardContent>
                  {walletData.deposits.length > 0 ? (
                    <div className="space-y-4">
                      {walletData.deposits.map((deposit) => (
                        <div key={deposit.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">{formatCurrency(deposit.amount)}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatDateTime(deposit.createdAt)}
                            </div>
                          </div>
                          {getStatusBadge(deposit.status)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhum depósito encontrado
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Saques</CardTitle>
                </CardHeader>
                <CardContent>
                  {walletData.withdraws.length > 0 ? (
                    <div className="space-y-4">
                      {walletData.withdraws.map((withdraw) => (
                        <div key={withdraw.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">{formatCurrency(withdraw.amount)}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatDateTime(withdraw.createdAt)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              PIX: {withdraw.pixKey}
                            </div>
                          </div>
                          {getStatusBadge(withdraw.status)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhum saque encontrado
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  )
}