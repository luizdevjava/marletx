# 🚀 Deploy Guide - MarketX Lite

## 📋 Pré-requisitos

- Conta no [Neon](https://neon.tech) (PostgreSQL serverless)
- Conta no [Vercel](https://vercel.com)
- Repositório no [GitHub](https://github.com)

## 🔧 Passo 1 - Configurar Neon PostgreSQL

1. **Acessar Neon**: https://neon.tech
2. **Login com GitHub**
3. **Criar Novo Projeto**:
   - Clique em "New Project"
   - Escolha PostgreSQL
   - Nome: `marketx-lite`
   - Região: mais próxima dos seus usuários
4. **Copiar Connection String**:
   ```
   postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require
   ```

## 🔧 Passo 2 - Configurar Vercel

1. **Acessar Projeto**: https://vercel.com/dashboard
2. **Settings → Environment Variables**
3. **Adicionar variáveis**:

   ```
   DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require
   NEXTAUTH_SECRET=sucesso-secreto-unico-com-pelo-menos-32-caracteres
   NEXTAUTH_URL=https://kalshi10.vercel.app
   ```

## 🚀 Passo 3 - Deploy

1. **Fazer Push**:
   ```bash
   git add .
   git commit -m "Configure for Neon PostgreSQL deployment"
   git push origin master
   ```

2. **Deploy Automático**:
   - Vercel detectará o push
   - Build será executado
   - Database será criado automaticamente

## 🔐 Acesso Após Deploy

### Credenciais Padrão:
- **Admin**: `admin@marketx.com` / `admin123`
- **User**: `user@test.com` / `user123`

### URLs:
- **Login**: `https://kalshi10.vercel.app/login`
- **Admin**: `https://kalshi10.vercel.app/admin`
- **Dashboard**: `https://kalshi10.vercel.app/dashboard`
- **Contratos**: `https://kalshi10.vercel.app/contracts`
- **Carteira**: `https://kalshi10.vercel.app/wallet`

## 🗄️ Estrutura do Banco de Dados

O Prisma criará automaticamente estas tabelas no Neon:

- `users` - Usuários do sistema
- `accounts` - Contas OAuth (NextAuth)
- `sessions` - Sessões ativas
- `contracts` - Contratos binários
- `positions` - Posições dos usuários
- `deposits` - Solicitações de depósito
- `withdraws` - Solicitações de saque
- `settings` - Configurações da plataforma
- `verificationtokens` - Tokens de verificação

## ⚠️ Solução de Problemas

### Erro 500 no Login/Registro:
1. **Verificar Environment Variables** no Vercel
2. **Confirmar DATABASE_URL** está correta
3. **Verificar NEXTAUTH_SECRET** tem 32+ caracteres
4. **Confirmar NEXTAUTH_URL** está sem `/` no final

### Tabelas não aparecem no Neon:
1. **Verificar se DATABASE_URL** está correta
2. **Aguardar primeiro acesso** (cria tabelas automaticamente)
3. **Verificar logs do deploy** no Vercel

### Erro de Prisma:
1. **DATABASE_URL** deve terminar com `?sslmode=require`
2. **Usar a URL completa** do Neon dashboard
3. **Verificar se usuário tem permissões** no banco

## 🎯 Funcionalidades Após Deploy

### Para Usuários:
- ✅ Login e registro
- ✅ Dashboard com saldo
- ✅ Compra e venda de contratos
- ✅ Solicitação de depósitos e saques via PIX
- ✅ Histórico de transações

### Para Administradores:
- ✅ Dashboard administrativo
- ✅ Criação de contratos binários
- ✅ Resolução de contratos (SIM/NÃO)
- ✅ Aprovação de depósitos
- ✅ Aprovação de saques
- ✅ Gestão de usuários

## 📞 Suporte

Se encontrar problemas:

1. **Logs do Deploy**: Verifique no painel Vercel
2. **Environment Variables**: Confirme todas as variáveis
3. **Database**: Verifique conexão no painel Neon
4. **Re-deploy**: Faça push de pequenas mudanças para forçar novo deploy

## 🎉 Resultado Final

Após seguir esses passos, você terá:
- ✅ Aplicação 100% funcional na Vercel
- ✅ Banco PostgreSQL serverless no Neon
- ✅ Autenticação funcionando
- ✅ Sistema de contratos binários operacional
- ✅ Plataforma pronta para uso comercial