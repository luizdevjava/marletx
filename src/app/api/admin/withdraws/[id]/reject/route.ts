import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const withdraw = await db.withdraw.findUnique({
      where: { id: params.id }
    })

    if (!withdraw) {
      return NextResponse.json({ error: 'Saque não encontrado' }, { status: 404 })
    }

    if (withdraw.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Saque não está pendente' },
        { status: 400 }
      )
    }

    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: withdraw.userId },
        data: {
          balance: {
            increment: Number(withdraw.amount)
          }
        }
      })

      await tx.withdraw.update({
        where: { id: params.id },
        data: {
          status: 'REJECTED'
        }
      })
    })

    return NextResponse.json({
      message: 'Saque rejeitado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao rejeitar saque:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}