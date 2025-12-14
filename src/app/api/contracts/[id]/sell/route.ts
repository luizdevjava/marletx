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
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { quantity } = await request.json()

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { error: 'Quantidade inválida' },
        { status: 400 }
      )
    }

    const contract = await db.contract.findUnique({
      where: { id: params.id }
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

    const position = await db.position.findUnique({
      where: {
        userId_contractId: {
          userId: session.user.id,
          contractId: params.id
        }
      }
    })

    if (!position || position.quantity < quantity) {
      return NextResponse.json(
        { error: 'Posição insuficiente para venda' },
        { status: 400 }
      )
    }

    const totalRevenue = Number(contract.price) * quantity
    const fee = totalRevenue * 0.01
    const netRevenue = totalRevenue - fee

    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          balance: {
            increment: netRevenue
          }
        }
      })

      if (position.quantity === quantity) {
        await tx.position.delete({
          where: {
            userId_contractId: {
              userId: session.user.id,
              contractId: params.id
            }
          }
        })
      } else {
        await tx.position.update({
          where: {
            userId_contractId: {
              userId: session.user.id,
              contractId: params.id
            }
          },
          data: {
            quantity: {
              decrement: quantity
            }
          }
        })
      }
    })

    return NextResponse.json({
      message: 'Venda realizada com sucesso',
      totalRevenue: netRevenue,
      fee
    })
  } catch (error) {
    console.error('Erro na venda:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}