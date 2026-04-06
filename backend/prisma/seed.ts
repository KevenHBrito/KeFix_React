import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("admin123", 10);
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

  const produtos: {
    nome: string;
    slug: string;
    descricao: string;
    preco: number;
    estoque: number;
    destaque: number;
    categoriaId: number;
  }[] = [
    {
      nome: "Tela LCD iPhone 11 Original",
      slug: "tela-lcd-iphone-11-original",
      descricao: "Tela completa com touch, cores fiéis e instalação assistida.",
      preco: 389.9,
      estoque: 25,
      destaque: 1,
      categoriaId: cats.telas.id,
    },
    {
      nome: "Bateria Samsung A54 5000mAh",
      slug: "bateria-samsung-a54-5000mah",
      descricao: "Bateria nova com garantia de 6 meses.",
      preco: 129.9,
      estoque: 40,
      destaque: 1,
      categoriaId: cats.baterias.id,
    },
    {
      nome: "Tela Xiaomi Redmi Note 10",
      slug: "tela-xiaomi-redmi-note-10",
      descricao: "Display IPS com moldura.",
      preco: 249.0,
      estoque: 12,
      destaque: 0,
      categoriaId: cats.telas.id,
    },
    {
      nome: "Tela OLED iPhone 12 / 12 Pro",
      slug: "tela-oled-iphone-12-12-pro",
      descricao: "Painel OLED compatível, brilho e True Tone quando aplicável.",
      preco: 549.0,
      estoque: 18,
      destaque: 1,
      categoriaId: cats.telas.id,
    },
    {
      nome: "Tela LCD iPhone 13",
      slug: "tela-lcd-iphone-13",
      descricao: "Conjunto display + touch, testado antes do envio.",
      preco: 479.5,
      estoque: 14,
      destaque: 1,
      categoriaId: cats.telas.id,
    },
    {
      nome: "Tela Samsung Galaxy A32 4G",
      slug: "tela-samsung-galaxy-a32-4g",
      descricao: "Tela completa com aro, encaixe original.",
      preco: 298.0,
      estoque: 9,
      destaque: 0,
      categoriaId: cats.telas.id,
    },
    {
      nome: "Tela Motorola Moto G52",
      slug: "tela-motorola-moto-g52",
      descricao: "Display IPS 6,6 polegadas com digitalizador.",
      preco: 265.0,
      estoque: 7,
      destaque: 0,
      categoriaId: cats.telas.id,
    },
    {
      nome: "Tela iPhone XR",
      slug: "tela-iphone-xr",
      descricao: "LCD Retina com frame, qualidade premium.",
      preco: 329.9,
      estoque: 22,
      destaque: 0,
      categoriaId: cats.telas.id,
    },
    {
      nome: "Bateria iPhone 12 / 12 Pro",
      slug: "bateria-iphone-12-12-pro",
      descricao: "2815 mAh, certificação e cola dupla face inclusa.",
      preco: 159.0,
      estoque: 35,
      destaque: 1,
      categoriaId: cats.baterias.id,
    },
    {
      nome: "Bateria iPhone 11",
      slug: "bateria-iphone-11",
      descricao: "3110 mAh — substituição com autonomia de fábrica.",
      preco: 139.9,
      estoque: 28,
      destaque: 0,
      categoriaId: cats.baterias.id,
    },
    {
      nome: "Bateria Xiaomi Redmi Note 11",
      slug: "bateria-xiaomi-redmi-note-11",
      descricao: "5000 mAh original service pack.",
      preco: 119.5,
      estoque: 20,
      destaque: 0,
      categoriaId: cats.baterias.id,
    },
    {
      nome: "Bateria Motorola Edge 30 Neo",
      slug: "bateria-motorola-edge-30-neo",
      descricao: "4020 mAh, lacrada.",
      preco: 144.0,
      estoque: 6,
      destaque: 0,
      categoriaId: cats.baterias.id,
    },
    {
      nome: "Fonte turbo Samsung USB-C 25W",
      slug: "fonte-turbo-samsung-usb-c-25w",
      descricao: "Carregamento rápido PPS, cabo vendido separadamente.",
      preco: 89.9,
      estoque: 55,
      destaque: 1,
      categoriaId: cats.carregadores.id,
    },
    {
      nome: "Fonte USB-C 20W compatível iPhone",
      slug: "fonte-usb-c-20w-compativel-iphone",
      descricao: "PD 20W, ideal para iPhone 12 em diante.",
      preco: 59.0,
      estoque: 60,
      destaque: 0,
      categoriaId: cats.carregadores.id,
    },
    {
      nome: "Carregador veicular USB-C + USB-A 38W",
      slug: "carregador-veicular-usb-c-usb-a-38w",
      descricao: "Duas portas, LED indicador, proteção contra surtos.",
      preco: 72.5,
      estoque: 30,
      destaque: 0,
      categoriaId: cats.carregadores.id,
    },
    {
      nome: "Cabo USB-C para Lightning 1m nylon",
      slug: "cabo-usb-c-lightning-1m-nylon",
      descricao: "Trançado, suporta carga rápida em iPhones compatíveis.",
      preco: 34.9,
      estoque: 80,
      destaque: 0,
      categoriaId: cats.cabos.id,
    },
    {
      nome: "Cabo USB-C para USB-C 2m 60W",
      slug: "cabo-usb-c-usb-c-2m-60w",
      descricao: "EPT chip, transferência de dados 480 Mbps.",
      preco: 42.0,
      estoque: 45,
      destaque: 0,
      categoriaId: cats.cabos.id,
    },
    {
      nome: "Cabo Micro USB reforçado 1,5m",
      slug: "cabo-micro-usb-reforcado-1-5m",
      descricao: "Pontas metálicas, para aparelhos legados.",
      preco: 19.9,
      estoque: 100,
      destaque: 0,
      categoriaId: cats.cabos.id,
    },
    {
      nome: "Alto-falante auricular iPhone 11",
      slug: "alto-falante-auricular-iphone-11",
      descricao: "Speaker superior de chamadas, plug and play.",
      preco: 45.0,
      estoque: 15,
      destaque: 0,
      categoriaId: cats.audio.id,
    },
    {
      nome: "Alto-falante buzzer Samsung A54",
      slug: "alto-falante-buzzer-samsung-a54",
      descricao: "Campainha principal com adesivo.",
      preco: 38.5,
      estoque: 11,
      destaque: 0,
      categoriaId: cats.audio.id,
    },
    {
      nome: "Conector de carga Xiaomi Redmi Note 10",
      slug: "conector-carga-xiaomi-redmi-note-10",
      descricao: "Placa USB-C com microfone auxiliar.",
      preco: 52.0,
      estoque: 8,
      destaque: 0,
      categoriaId: cats.audio.id,
    },
    {
      nome: "Kit chaves Y tri-wing 6 peças",
      slug: "kit-chaves-y-triwing-6-pecas",
      descricao: "Aço S2, cabo antiderrapante — iPhone e consoles.",
      preco: 28.0,
      estoque: 40,
      destaque: 0,
      categoriaId: cats.ferramentas.id,
    },
    {
      nome: "Ventosa remoção de tela + espátulas",
      slug: "ventosa-remocao-tela-espatulas",
      descricao: "Ventosa forte + 2 espátulas plásticas.",
      preco: 24.5,
      estoque: 33,
      destaque: 0,
      categoriaId: cats.ferramentas.id,
    },
    {
      nome: "Estação ar quente 858D (uso assistido)",
      slug: "estacao-ar-quente-858d",
      descricao: "Para retrabalho SMD — uso profissional.",
      preco: 289.0,
      estoque: 4,
      destaque: 1,
      categoriaId: cats.ferramentas.id,
    },
    {
      nome: "Película de vidro 3D iPhone 13",
      slug: "pelicula-vidro-3d-iphone-13",
      descricao: "Cobertura bordas arredondadas, kit limpeza.",
      preco: 22.0,
      estoque: 120,
      destaque: 0,
      categoriaId: cats.acessorios.id,
    },
    {
      nome: "Capa anti-impacto Samsung A54",
      slug: "capa-anti-impacto-samsung-a54",
      descricao: "Bordas reforçadas, transparente fosca.",
      preco: 35.9,
      estoque: 50,
      destaque: 0,
      categoriaId: cats.acessorios.id,
    },
    {
      nome: "Película privacidade iPhone 12/12 Pro",
      slug: "pelicula-privacidade-iphone-12-12-pro",
      descricao: "Bloqueia visão lateral, instalação seca.",
      preco: 48.0,
      estoque: 25,
      destaque: 0,
      categoriaId: cats.acessorios.id,
    },
  ];

  for (const p of produtos) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      create: { ...p, imagem: "sem-imagem.png", ativo: 1 },
      update: {
        nome: p.nome,
        descricao: p.descricao,
        preco: p.preco,
        estoque: p.estoque,
        destaque: p.destaque,
        categoriaId: p.categoriaId,
      },
    });
  }

  console.log(
    `Seed OK — ${produtos.length} produtos, ${Object.keys(cats).length} categorias — admin: admin@kefix.com / admin123`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
