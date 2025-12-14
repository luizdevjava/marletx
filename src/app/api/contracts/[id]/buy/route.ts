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

    if (new Date() > contract.expiresAt) {
      return NextResponse.json(
        { error: 'Contrato expirado' },
        { status: 400 }
      )
    }

    const totalCost = Number(contract.price) * quantity

    const user = await db.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || Number(user.balance) < totalCost) {
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
            decrement: totalCost
          }
        }
      })

      const existingPosition = await tx.position.findUnique({
        where: {
          userId_contractId: {
            userId: session.user.id,
            contractId: params.id
          }
        }
      })

      if (existingPosition) {
        const newQuantity = existingPosition.quantity + quantity
        const newAveragePrice = (
          (existingPosition.averagePrice * existingPosition.quantity + Number(contract.price) * quantity) /
          newQuantity
        )

        await tx.position.update({
          where: {
            userId_contractId: {
              userId: session.user.id,
              contractId: params.id
            }
          },
          data: {
            quantity: newQuantity,
            averagePrice: newAveragePrice
          }
        })
      } else {
        await tx.position.create({
          data: {
            userId: session.user.id,
            contractId: params.id,
            quantity,
            averagePrice: contract.price,
            type: 'BUY'
          }
        })
      }
    })

    return NextResponse.json({
      message: 'Compra realizada com sucesso',
      totalCost
    })
  } catch (error) {
    console.error('Erro na compra:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}