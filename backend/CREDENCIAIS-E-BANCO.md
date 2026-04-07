# Credenciais de administrador e banco de dados

## Painel admin (tela)

- No **frontend**, a área administrativa já está em **`/admin`** (rotas em `frontend/src/pages/admin/`).
- Acesse **http://localhost:5173/admin** depois de fazer login.
- No cabeçalho da loja, com usuário admin logado: menu do usuário → **Painel Admin**.

## Credenciais padrão (ambiente de desenvolvimento)

Criadas pelo **seed** do Prisma (`npm run db:seed` na pasta `backend`):

| Campo    | Valor              |
|----------|--------------------|
| E-mail   | `admin@kefix.com`  |
| Senha    | `admin123`         |

**Importante:** troque a senha em produção e não use estas credenciais em ambiente público.

## Onde fica o banco de dados

- **Motor:** MySQL (XAMPP).
- **Banco de dados:** `kefix`.
- **String de conexão** (definida em `backend/.env`):  
  `DATABASE_URL="mysql://root:@127.0.0.1:3306/kefix"`

> Se o MySQL usar senha para o usuário `root`, substitua por `mysql://root:senha@127.0.0.1:3306/kefix`.

O banco de dados deve ser criado no XAMPP (phpMyAdmin ou linha de comando) antes de rodar o Prisma.

O esquema e as tabelas são gerados com:

```bash
npx prisma db push
npm run db:seed
```

## Se o admin não existir

Na pasta `backend`:

```bash
npx prisma db push
npm run db:seed
```
