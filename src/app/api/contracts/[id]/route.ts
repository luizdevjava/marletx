import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const contract = await db.contract.findFirst({
      where: {
        id: params.id
      },
      include: {
        positions: {
          where: {
            userId: session.user.id
          }
        }
      }
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contrato não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      id: contract.id,
      title: contract.title,
      description: contract.description,
      price: Number(contract.price),
      expiresAt: contract.expiresAt.toISOString(),
      status: contract.status,
      result: contract.result,
      userPosition: contract.positions.length > 0 ? {
        quantity: contract.positions[0].quantity,
        type: contract.positions[0].type,
        averagePrice: Number(contract.positions[0].averagePrice)
      } : undefined
    })
  } catch (error) {
    console.error('Erro ao carregar contrato:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}