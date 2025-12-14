import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed do banco de dados...')

  const hashedPassword = await bcrypt.hash('admin123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@marketx.com' },
    update: {},
    create: {
      email: 'admin@marketx.com',
      password: hashedPassword,
      name: 'Admin MarketX',
      role: 'ADMIN',
      balance: 1000.00
    }
  })

  console.log('Usuário admin criado:', admin)

  const testUser = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      password: hashedPassword,
      name: 'Usuário Teste',
      role: 'USER',
      balance: 100.00
    }
  })

  console.log('Usuário teste criado:', testUser)

  const settings = await prisma.settings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteName: 'MarketX Lite',
      pixKey: 'admin@marketx.com',
      feeAmount: 0.01
    }
  })

  console.log('Configurações criadas:', settings)

  const testContract = await prisma.contract.create({
    data: {
      title: 'O dólar vai fechar acima de R$5,50?',
      description: 'Contrato binário sobre o fechamento do dólar comercial no final do dia.',
      price: 10.00,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      status: 'ACTIVE'
    }
  })

  console.log('Contrato teste criado:', testContract)

  console.log('Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })