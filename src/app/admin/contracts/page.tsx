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
import { Textarea } from '@/components/ui/textarea'
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
  positionsCount: number
}

export default function AdminContractsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    expiresAt: ''
  })
  const [isCreating, setIsCreating] = useState(false)

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
      const response = await fetch('/api/admin/contracts')
      if (response.ok) {
        const data = await response.json()
        setContracts(data)
      } else {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Erro ao carregar contratos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.price || !formData.expiresAt) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos',
        variant: 'destructive'
      })
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/admin/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          expiresAt: new Date(formData.expiresAt).toISOString()
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Contrato criado!',
          description: 'Contrato criado com sucesso'
        })
        setFormData({ title: '', description: '', price: '', expiresAt: '' })
        setShowCreateForm(false)
        fetchContracts()
      } else {
        toast({
          title: 'Erro ao criar contrato',
          description: data.error || 'Não foi possível criar o contrato',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Erro ao criar contrato',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive'
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleResolveContract = async (contractId: string, result: 'SIM' | 'NAO') => {
    try {
      const response = await fetch(`/api/admin/contracts/${contractId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ result })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Contrato resolvido!',
          description: `Contrato resolvido como ${result}`
        })
        fetchContracts()
      } else {
        toast({
          title: 'Erro ao resolver contrato',
          description: data.error || 'Não foi possível resolver o contrato',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Erro ao resolver contrato',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive'
      })
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
            <Link href="/admin" className="text-xl font-bold">
              MarketX Lite Admin
            </Link>
            <nav className="hidden md:flex space-x-4">
              <Link href="/admin" className="text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
              <Link href="/admin/contracts" className="text-foreground font-medium">
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Contratos</h1>
            <p className="text-muted-foreground">
              Crie e resolva contratos binários
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancelar' : 'Criar Contrato'}
          </Button>
        </div>

        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Novo Contrato</CardTitle>
              <CardDescription>
                Crie um novo contrato binário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateContract} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: O dólar vai fechar acima de R$5,50?"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição detalhada do contrato..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="10.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiresAt">Data de Expiração</Label>
                    <Input
                      id="expiresAt"
                      type="datetime-local"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Criando...' : 'Criar Contrato'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contracts.map((contract) => (
            <Card key={contract.id}>
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

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Posições</span>
                  <span className="text-sm">{contract.positionsCount}</span>
                </div>

                {contract.status === 'ACTIVE' && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleResolveContract(contract.id, 'SIM')}
                    >
                      Resolver SIM
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleResolveContract(contract.id, 'NAO')}
                    >
                      Resolver NÃO
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {contracts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhum contrato encontrado. Crie seu primeiro contrato!
            </p>
          </div>
        )}
      </main>
    </div>
  )
}