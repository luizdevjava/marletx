import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const contracts = await db.contract.findMany({
      include: {
        _count: {
          select: {
            positions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const contractsWithCounts = contracts.map(contract => ({
      id: contract.id,
      title: contract.title,
      description: contract.description,
      price: Number(contract.price),
      expiresAt: contract.expiresAt.toISOString(),
      status: contract.status,
      result: contract.result,
      positionsCount: contract._count.positions
    }))

    return NextResponse.json(contractsWithCounts)
  } catch (error) {
    console.error('Erro ao carregar contratos admin:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { title, description, price, expiresAt } = await request.json()

    if (!title || !description || !price || !expiresAt) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    const contract = await db.contract.create({
      data: {
        title,
        description,
        price,
        expiresAt: new Date(expiresAt),
        status: 'ACTIVE'
      }
    })

    return NextResponse.json({
      message: 'Contrato criado com sucesso',
      contract
    })
  } catch (error) {
    console.error('Erro ao criar contrato:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}