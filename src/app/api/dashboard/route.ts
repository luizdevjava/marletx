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

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        positions: {
          include: {
            contract: true
          }
        },
        deposits: {
          where: { status: 'APPROVED' }
        },
        withdraws: {
          where: { status: 'APPROVED' }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const totalInvested = user.positions.reduce((sum, position) => {
      return sum + (position.quantity * Number(position.averagePrice))
    }, 0)

    const recentContracts = user.positions
      .sort((a, b) => b.contract.createdAt.getTime() - a.contract.createdAt.getTime())
      .slice(0, 5)
      .map(position => ({
        id: position.id,
        title: position.contract.title,
        quantity: position.quantity,
        averagePrice: Number(position.averagePrice),
        type: position.type,
        status: position.contract.status,
        result: position.contract.result
      }))

    return NextResponse.json({
      balance: Number(user.balance),
      positionsCount: user.positions.length,
      totalInvested,
      recentContracts
    })
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}