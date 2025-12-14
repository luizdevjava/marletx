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

    const deposits = await db.deposit.findMany({
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

    const depositsWithUser = deposits.map(deposit => ({
      id: deposit.id,
      amount: Number(deposit.amount),
      status: deposit.status,
      pixKey: deposit.pixKey,
      proofUrl: deposit.proofUrl,
      createdAt: deposit.createdAt.toISOString(),
      user: deposit.user
    }))

    return NextResponse.json(depositsWithUser)
  } catch (error) {
    console.error('Erro ao carregar depósitos admin:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}