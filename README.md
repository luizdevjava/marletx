# MarketX Lite

Plataforma simples de contratos binários com depósitos e saques via PIX.

## 🚀 Stack Tecnológica

- **Frontend**: Next.js 15 com App Router
- **Backend**: Next.js API Routes
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Autenticação**: NextAuth.js
- **Estilização**: Tailwind CSS + shadcn/ui
- **Linguagem**: TypeScript

## 📋 Funcionalidades

### Usuários
- ✅ Dashboard com saldo e posições
- ✅ Listagem de contratos disponíveis
- ✅ Compra e venda de contratos
- ✅ Solicitação de depósitos via PIX
- ✅ Solicitação de saques via PIX
- ✅ Histórico de transações

### Administradores
- ✅ Dashboard administrativo
- ✅ Criação de contratos
- ✅ Resolução de contratos (SIM/NÃO)
- ✅ Aprovação de depósitos
- ✅ Aprovação de saques
- ✅ Visualização de usuários e transações

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- PostgreSQL (ou use Neon)
- npm ou yarn

### 1. Clonar o projeto
```bash
git clone <repositório>
cd marketx-lite
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
Crie um arquivo `.env.local`:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/marketx"
NEXTAUTH_SECRET="seu-segredo-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Configurar o banco de dados
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 5. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```

## 👤 Usuários Padrão

### Administrador
- **Email**: admin@marketx.com
- **Senha**: admin123

### Usuário Teste
- **Email**: user@test.com
- **Senha**: user123

## 🏗️ Estrutura do Projeto

```
src/
├── app/                    # App Router
│   ├── (auth)/            # Rotas de autenticação
│   ├── admin/             # Painel administrativo
│   ├── api/               # API Routes
│   ├── contracts/         # Contratos
│   ├── dashboard/         # Dashboard usuário
│   ├── wallet/            # Carteira
│   └── globals.css        # Estilos globais
├── components/            # Componentes React
│   ├── ui/               # Componentes shadcn/ui
│   └── providers/        # Providers
├── lib/                  # Utilitários
│   ├── auth.ts          # Config NextAuth
│   ├── db.ts            # Cliente Prisma
│   └── utils.ts         # Funções utilitárias
└── hooks/               # Hooks personalizados
```

## 📊 Modelo de Dados

### Usuários
- Autenticação via email/senha
- Saldo em reais
- Papel (USER/ADMIN)

### Contratos
- Título e descrição
- Preço fixo
- Data de expiração
- Status (ACTIVE/RESOLVED)
- Resultado (SIM/NAO)

### Posições
- Contratos comprados/vendidos
- Quantidade e preço médio
- Tipo (BUY/SELL)

### Transações
- Depósitos (pendente/aprovado/rejeitado)
- Saques (pendente/aprovado/rejeitado)

## 💰 Fluxo Financeiro

1. **Depósito**: Usuário solicita → Admin aprova → Saldo atualizado
2. **Compra**: Saldo deduzido → Posição criada
3. **Venda**: Saldo creditado (com taxa) → Posição removida
4. **Resolução**: Admin define resultado → Ganhadores creditados
5. **Saque**: Saldo deduzido → Admin aprova → PIX enviado

## 🔐 Segurança

- Middleware de proteção de rotas
- Validação server-side
- Senhas hash com bcrypt
- Transações com Prisma transactions
- Proteção contra acesso não autorizado

## 🚀 Deploy

### Vercel (Recomendado)
1. Conectar repositório no Vercel
2. Configurar variáveis de ambiente
3. Fazer deploy automático

### Variáveis de Ambiente Necessárias
- `DATABASE_URL`: String de conexão PostgreSQL
- `NEXTAUTH_SECRET`: Segredo do NextAuth
- `NEXTAUTH_URL`: URL da aplicação

## 📝 Melhorias Futuras

- [ ] Notificações por email
- [ ] Histórico detalhado
- [ ] Gráficos e estatísticas
- [ ] API para integrações
- [ ] Mobile app
- [ ] Taxa dinâmica
- [ ] Múltiplos métodos de pagamento

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob licença MIT. Veja o arquivo `LICENSE` para detalhes.

## 📞 Suporte

Para suporte, envie um email para suporte@marketx.com ou abra uma issue no GitHub.