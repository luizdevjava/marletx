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

    const { amount } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valor inválido' },
        { status: 400 }
      )
    }

    const deposit = await db.deposit.create({
      data: {
        userId: session.user.id,
        amount,
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      message: 'Solicitação de depósito criada com sucesso',
      depositId: deposit.id
    })
  } catch (error) {
    console.error('Erro ao criar depósito:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}