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

export default function ContractDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [contract, setContract] = useState<Contract | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated' && params.id) {
      fetchContract()
    }
  }, [status, params.id])

  const fetchContract = async () => {
    try {
      const response = await fetch(`/api/contracts/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setContract(data)
      } else {
        toast({
          title: 'Erro',
          description: 'Contrato não encontrado',
          variant: 'destructive'
        })
        router.push('/contracts')
      }
    } catch (error) {
      console.error('Erro ao carregar contrato:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar contrato',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBuy = async () => {
    if (!contract || quantity < 1) return

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/contracts/${contract.id}/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Compra realizada!',
          description: `Você comprou ${quantity} contratos por ${formatCurrency(data.totalCost)}`
        })
        fetchContract()
      } else {
        toast({
          title: 'Erro na compra',
          description: data.error || 'Não foi possível realizar a compra',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Erro na compra',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSell = async () => {
    if (!contract || quantity < 1) return

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/contracts/${contract.id}/sell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Venda realizada!',
          description: `Você vendeu ${quantity} contratos por ${formatCurrency(data.totalRevenue)}`
        })
        fetchContract()
      } else {
        toast({
          title: 'Erro na venda',
          description: data.error || 'Não foi possível realizar a venda',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Erro na venda',
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

  if (!session || !contract) {
    return null
  }

  const totalCost = contract.price * quantity
  const canSell = contract.userPosition && contract.userPosition.quantity >= quantity

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
        <div className="mb-6">
          <Link href="/contracts" className="text-muted-foreground hover:text-foreground">
            ← Voltar para contratos
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">{contract.title}</CardTitle>
                    <CardDescription className="text-base">
                      {contract.description}
                    </CardDescription>
                  </div>
                  {getStatusBadge(contract.status, contract.result)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Preço por contrato</Label>
                    <div className="text-2xl font-bold">{formatCurrency(contract.price)}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Expira em</Label>
                    <div className="text-lg">{formatDateTime(contract.expiresAt)}</div>
                  </div>
                </div>

                {contract.userPosition && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-medium mb-2">Sua posição atual</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Quantidade:</span>
                        <span className="ml-2 font-medium">{contract.userPosition.quantity}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tipo:</span>
                        <span className="ml-2 font-medium">
                          {contract.userPosition.type === 'BUY' ? 'Compra' : 'Venda'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Preço médio:</span>
                        <span className="ml-2 font-medium">
                          {formatCurrency(contract.userPosition.averagePrice)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total investido:</span>
                        <span className="ml-2 font-medium">
                          {formatCurrency(contract.userPosition.quantity * contract.userPosition.averagePrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {contract.status === 'RESOLVED' && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-medium mb-2">Resultado</h3>
                    <p className="text-sm">
                      Este contrato foi resolvido como <strong>{contract.result}</strong>.
                    </p>
                    {contract.userPosition && (
                      <p className="text-sm mt-2">
                        {contract.result === 'SIM' && contract.userPosition.type === 'BUY' && (
                          <span className="text-green-600">
                            Você recebeu {formatCurrency(contract.userPosition.quantity * 1.00)}
                          </span>
                        )}
                        {contract.result === 'NAO' && contract.userPosition.type === 'BUY' && (
                          <span className="text-red-600">
                            Você perdeu {formatCurrency(contract.userPosition.quantity * contract.userPosition.averagePrice)}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {contract.status === 'ACTIVE' && (
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Negociar</CardTitle>
                  <CardDescription>
                    Compre ou venda contratos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="quantity">Quantidade</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Total:</span>
                      <span className="font-bold">{formatCurrency(totalCost)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      className="w-full" 
                      onClick={handleBuy}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processando...' : `Comprar ${quantity} contrato(s)`}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleSell}
                      disabled={isProcessing || !canSell}
                    >
                      {isProcessing ? 'Processando...' : `Vender ${quantity} contrato(s)`}
                    </Button>
                  </div>

                  {!canSell && contract.userPosition && (
                    <p className="text-xs text-muted-foreground text-center">
                      Você não possui contratos suficientes para vender
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}