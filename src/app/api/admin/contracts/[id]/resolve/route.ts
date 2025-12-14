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

    const { result } = await request.json()

    if (!result || !['SIM', 'NAO'].includes(result)) {
      return NextResponse.json(
        { error: 'Resultado inválido' },
        { status: 400 }
      )
    }

    const contract = await db.contract.findUnique({
      where: { id: params.id },
      include: {
        positions: {
          include: {
            user: true
          }
        }
      }
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contrato não encontrado' }, { status: 404 })
    }

    if (contract.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Contrato não está mais ativo' },
        { status: 400 }
      )
    }

    await db.$transaction(async (tx) => {
      await tx.contract.update({
        where: { id: params.id },
        data: {
          status: 'RESOLVED',
          result
        }
      })

      for (const position of contract.positions) {
        if (position.type === 'BUY' && result === 'SIM') {
          await tx.user.update({
            where: { id: position.userId },
            data: {
              balance: {
                increment: position.quantity * 1.00
              }
            }
          })
        }
      }
    })

    return NextResponse.json({
      message: 'Contrato resolvido com sucesso',
      result
    })
  } catch (error) {
    console.error('Erro ao resolver contrato:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}