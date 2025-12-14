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

    const withdraws = await db.withdraw.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const withdrawsWithUser = withdraws.map(withdraw => ({
      id: withdraw.id,
      amount: Number(withdraw.amount),
      status: withdraw.status,
      pixKey: withdraw.pixKey,
      createdAt: withdraw.createdAt.toISOString(),
      user: withdraw.user
    }))

    return NextResponse.json(withdrawsWithUser)
  } catch (error) {
    console.error('Erro ao carregar saques admin:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}