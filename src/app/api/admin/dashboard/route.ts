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

    const [
      totalUsers,
      totalContracts,
      activeContracts,
      totalDeposits,
      pendingDeposits,
      totalWithdraws,
      pendingWithdraws,
      platformBalance
    ] = await Promise.all([
      db.user.count(),
      db.contract.count(),
      db.contract.count({ where: { status: 'ACTIVE' } }),
      db.deposit.count(),
      db.deposit.count({ where: { status: 'PENDING' } }),
      db.withdraw.count(),
      db.withdraw.count({ where: { status: 'PENDING' } }),
      db.user.aggregate({
        _sum: {
          balance: true
        }
      })
    ])

    return NextResponse.json({
      totalUsers,
      totalContracts,
      activeContracts,
      totalDeposits,
      pendingDeposits,
      totalWithdraws,
      pendingWithdraws,
      platformBalance: Number(platformBalance._sum.balance || 0)
    })
  } catch (error) {
    console.error('Erro ao carregar dashboard admin:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}