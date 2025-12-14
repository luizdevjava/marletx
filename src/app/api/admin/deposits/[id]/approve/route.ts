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

    const deposit = await db.deposit.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!deposit) {
      return NextResponse.json({ error: 'Depósito não encontrado' }, { status: 404 })
    }

    if (deposit.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Depósito não está pendente' },
        { status: 400 }
      )
    }

    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: deposit.userId },
        data: {
          balance: {
            increment: Number(deposit.amount)
          }
        }
      })

      await tx.deposit.update({
        where: { id: params.id },
        data: {
          status: 'APPROVED'
        }
      })
    })

    return NextResponse.json({
      message: 'Depósito aprovado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao aprovar depósito:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}