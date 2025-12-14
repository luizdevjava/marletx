import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { amount, pixKey } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valor inválido' },
        { status: 400 }
      )
    }

    if (!pixKey) {
      return NextResponse.json(
        { error: 'Chave PIX obrigatória' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || Number(user.balance) < amount) {
      return NextResponse.json(
        { error: 'Saldo insuficiente' },
        { status: 400 }
      )
    }

    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          balance: {
            decrement: amount
          }
        }
      })

      await tx.withdraw.create({
        data: {
          userId: session.user.id,
          amount,
          pixKey,
          status: 'PENDING'
        }
      })
    })

    return NextResponse.json({
      message: 'Solicitação de saque criada com sucesso'
    })
  } catch (error) {
    console.error('Erro ao criar saque:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}