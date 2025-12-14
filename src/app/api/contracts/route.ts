import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const contracts = await db.contract.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        positions: {
          where: {
            userId: session.user.id
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const contractsWithUserPosition = contracts.map(contract => ({
      id: contract.id,
      title: contract.title,
      description: contract.description,
      price: Number(contract.price),
      expiresAt: contract.expiresAt.toISOString(),
      status: contract.status,
      result: contract.result,
      userPosition: contract.positions.length > 0 ? {
        quantity: contract.positions[0].quantity,
        type: contract.positions[0].type,
        averagePrice: Number(contract.positions[0].averagePrice)
      } : undefined
    }))

    return NextResponse.json(contractsWithUserPosition)
  } catch (error) {
    console.error('Erro ao carregar contratos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}