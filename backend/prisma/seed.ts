import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Cliente Prisma usado para popular dados iniciais.
const prisma = new PrismaClient();

// Seed principal: garante admin padrao e categorias base.
async function main() {
  // Cria hash da senha inicial do admin.
  const hash = await bcrypt.hash("admin123", 10);
  // Upsert evita duplicacao e assegura que o admin exista.
  await prisma.user.upsert({
    where: { email: "admin@kefix.com" },
    create: {
      nome: "Administrador",
      email: "admin@kefix.com",
      senha: hash,
      tipo: "admin",
    },
    update: {},
  });

  // Categorias padrao usadas pelo catalogo.
  const cats = {
    telas: await prisma.category.upsert({
      where: { slug: "telas" },
      create: { nome: "Telas", slug: "telas", icone: "smartphone" },
      update: {},
    }),
    baterias: await prisma.category.upsert({
      where: { slug: "baterias" },
      create: { nome: "Baterias", slug: "baterias", icone: "package" },
      update: {},
    }),
    carregadores: await prisma.category.upsert({
      where: { slug: "carregadores" },
      create: { nome: "Carregadores e fontes", slug: "carregadores", icone: "package" },
      update: {},
    }),
    cabos: await prisma.category.upsert({
      where: { slug: "cabos" },
      create: { nome: "Cabos e adaptadores", slug: "cabos", icone: "package" },
      update: {},
    }),
    audio: await prisma.category.upsert({
      where: { slug: "audio" },
      create: { nome: "Áudio e alto-falantes", slug: "audio", icone: "package" },
      update: {},
    }),
    ferramentas: await prisma.category.upsert({
      where: { slug: "ferramentas" },
      create: { nome: "Ferramentas", slug: "ferramentas", icone: "package" },
      update: {},
    }),
    acessorios: await prisma.category.upsert({
      where: { slug: "acessorios" },
      create: { nome: "Acessórios", slug: "acessorios", icone: "package" },
      update: {},
    }),
  };

  console.log(
    `Seed OK — ${Object.keys(cats).length} categorias — admin: admin@kefix.com / admin123`,
  );
}

main()
  // Sempre encerra conexao com o banco ao finalizar com sucesso.
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    // Tambem encerra conexao em caso de erro antes de propagar excecao.
    prisma.$disconnect();
    throw e;
  });
