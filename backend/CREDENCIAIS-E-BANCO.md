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

- **Motor:** SQLite (arquivo local).
- **Caminho relativo** (definido em `backend/.env`):  
  `DATABASE_URL="file:./dev.db"`
- **Arquivo físico:** pasta **`backend`**, arquivo **`dev.db`**.

Exemplo de caminho absoluto no seu Mac:

` /Users/mazinijoaomarcelo/Desktop/kefix/backend/dev.db `

(Se o projeto estiver em outro lugar, será `.../seu-projeto/backend/dev.db`.)

O arquivo só é criado após `npx prisma db push` (ou migrate) com esse `DATABASE_URL`.

## Se o admin não existir

Na pasta `backend`:

```bash
npx prisma db push
npm run db:seed
```
