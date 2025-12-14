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
        deposits: {
          orderBy: { createdAt: 'desc' }
        },
        withdraws: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      balance: Number(user.balance),
      deposits: user.deposits.map(deposit => ({
        id: deposit.id,
        amount: Number(deposit.amount),
        status: deposit.status,
        pixKey: deposit.pixKey,
        proofUrl: deposit.proofUrl,
        createdAt: deposit.createdAt.toISOString()
      })),
      withdraws: user.withdraws.map(withdraw => ({
        id: withdraw.id,
        amount: Number(withdraw.amount),
        status: withdraw.status,
        pixKey: withdraw.pixKey,
        createdAt: withdraw.createdAt.toISOString()
      }))
    })
  } catch (error) {
    console.error('Erro ao carregar carteira:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}