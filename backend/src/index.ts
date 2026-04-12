import "dotenv/config";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import session from "express-session";
import multer from "multer";
import bcrypt from "bcryptjs";
import { prisma } from "./db.js";

const PORT = Number(process.env.PORT) || 3001;
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-change-me";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const uploadsDir = path.join(root, "uploads", "produtos");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    name: "kefix.sid",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
    },
  }),
);
app.use("/uploads", express.static(path.join(root, "uploads")));

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || ".jpg";
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  }),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!/\.(jpe?g|png|webp)$/i.test(file.originalname)) {
      cb(new Error("Apenas JPG, PNG ou WebP"));
      return;
    }
    cb(null, true);
  },
});

function gerarSlug(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-|-$/g, "");
}

function erro(res: express.Response, status: number, msg: string) {
  return res.status(status).json({ erro: msg });
}

function montarEndereco(
  rua: string,
  numero: string,
  bairro: string,
  cidade: string,
  cep: string,
) {
  const linha1 = [rua, numero].filter(Boolean).join(', ');
  const linha2 = [bairro, cidade].filter(Boolean).join(' - ');
  const partes = [linha1, linha2, cep].filter(Boolean);
  return partes.length > 0 ? partes.join(' | ') : null;
}

function mapCategoria(c: { id: number; nome: string; slug: string; icone: string }) {
  return {
    id: c.id,
    nome: c.nome,
    slug: c.slug,
    icone: c.icone,
  };
}

function mapProduto(
  p: {
    id: number;
    categoriaId: number;
    nome: string;
    slug: string;
    descricao: string;
    preco: number;
    estoque: number;
    imagem: string;
    destaque: number;
    ativo: number;
    createdAt: Date;
    categoria: { nome: string };
  },
) {
  return {
    id: p.id,
    categoria_id: p.categoriaId,
    categoria_nome: p.categoria.nome,
    nome: p.nome,
    descricao: p.descricao,
    preco: p.preco,
    estoque: p.estoque,
    imagem: p.imagem,
    destaque: p.destaque,
    ativo: p.ativo,
    criado_em: p.createdAt.toISOString(),
  };
}

function mapCliente(
  u: {
    id: number;
    nome: string;
    email: string;
    telefone: string | null;
    endereco: string | null;
    rua: string | null;
    numero: string | null;
    bairro: string | null;
    cidade: string | null;
    cep: string | null;
    createdAt: Date;
  },
) {
  return {
    id: u.id,
    nome: u.nome,
    email: u.email,
    telefone: u.telefone,
    endereco: u.endereco,
    rua: u.rua,
    numero: u.numero,
    bairro: u.bairro,
    cidade: u.cidade,
    cep: u.cep,
    criado_em: u.createdAt.toISOString(),
  };
}

function carrinhoResumo(req: express.Request) {
  const car = req.session.carrinho ?? {};
  const items = Object.values(car);
  let total = 0;
  let total_itens = 0;
  for (const it of items) {
    total += it.preco * it.quantidade;
    total_itens += it.quantidade;
  }
  return {
    items,
    total: total.toFixed(2),
    total_itens,
  };
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.session.usuario?.tipo !== "admin") {
    return erro(res, 403, "Acesso negado.");
  }
  next();
}

// ——— Carrinho ———
app.get("/api/carrinho", (req, res) => {
  res.json(carrinhoResumo(req));
});

app.post("/api/carrinho/adicionar", async (req, res) => {
  const produto_id = Number(req.body.produto_id);
  const quantidade = Math.max(1, Number(req.body.quantidade) || 1);
  if (!produto_id) return erro(res, 400, "Dados inválidos.");

  const p = await prisma.product.findFirst({
    where: { id: produto_id, ativo: 1 },
    include: { categoria: true },
  });
  if (!p) return erro(res, 404, "Produto não encontrado.");

  if (!req.session.carrinho) req.session.carrinho = {};
  const key = String(produto_id);
  const atual = req.session.carrinho[key]?.quantidade ?? 0;
  const nova = atual + quantidade;
  if (nova > p.estoque) return erro(res, 400, "Estoque insuficiente.");

  req.session.carrinho[key] = {
    produto_id: p.id,
    nome: p.nome,
    preco: p.preco,
    imagem: p.imagem,
    quantidade: nova,
  };
  req.session.save(() => {
    res.json({
      sucesso: true,
      mensagem: "Produto adicionado ao carrinho!",
      total_itens: carrinhoResumo(req).total_itens,
    });
  });
});

app.post("/api/carrinho/atualizar", async (req, res) => {
  const produto_id = Number(req.body.produto_id);
  const quantidade = Number(req.body.quantidade);
  if (!req.session.carrinho || !req.session.carrinho[String(produto_id)]) {
    return res.json({ sucesso: true, total: carrinhoResumo(req).total });
  }
  if (quantidade <= 0) {
    delete req.session.carrinho[String(produto_id)];
  } else {
    const p = await prisma.product.findFirst({
      where: { id: produto_id, ativo: 1 },
    });
    if (!p || quantidade > p.estoque) {
      return erro(res, 400, "Quantidade acima do estoque.");
    }
    req.session.carrinho[String(produto_id)].quantidade = quantidade;
  }
  req.session.save(() => {
    res.json({ sucesso: true, total: carrinhoResumo(req).total });
  });
});

app.post("/api/carrinho/remover", (req, res) => {
  const produto_id = String(req.body.produto_id);
  if (req.session.carrinho) delete req.session.carrinho[produto_id];
  req.session.save(() => {
    res.json({
      sucesso: true,
      total: carrinhoResumo(req).total,
      total_itens: carrinhoResumo(req).total_itens,
    });
  });
});

// ——— Auth ———
app.get("/api/auth/me", (req, res) => {
  res.json({ usuario: req.session.usuario ?? null });
});

app.post("/api/auth/cadastro", async (req, res) => {
  const nome = String(req.body.nome ?? "").trim();
  const email = String(req.body.email ?? "").trim().toLowerCase();
  const telefone = String(req.body.telefone ?? "").trim();
  const senha = String(req.body.senha ?? "");
  const confirma = String(req.body.confirma_senha ?? "");

  if (!nome || !email || !senha) return erro(res, 400, "Preencha os campos obrigatórios.");
  if (senha.length < 6) return erro(res, 400, "A senha deve ter pelo menos 6 caracteres.");
  if (senha !== confirma) return erro(res, 400, "As senhas não coincidem.");

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return erro(res, 400, "Este e-mail já está cadastrado.");

  const hash = await bcrypt.hash(senha, 10);
  await prisma.user.create({
    data: { nome, email, telefone: telefone || null, senha: hash, tipo: "cliente" },
  });
  res.json({ ok: true });
});

app.post("/api/auth/login", async (req, res) => {
  const email = String(req.body.email ?? "").trim().toLowerCase();
  const senha = String(req.body.senha ?? "");
  if (!email || !senha) return erro(res, 400, "Preencha e-mail e senha.");

  const u = await prisma.user.findUnique({ where: { email } });
  if (!u || !(await bcrypt.compare(senha, u.senha))) {
    return erro(res, 401, "E-mail ou senha incorretos.");
  }

  req.session.usuario = {
    id: u.id,
    nome: u.nome,
    email: u.email,
    tipo: u.tipo === "admin" ? "admin" : "cliente",
    telefone: u.telefone,
    rua: u.rua,
    numero: u.numero,
    bairro: u.bairro,
    cidade: u.cidade,
    cep: u.cep,
  };
  req.session.save(() => {
    res.json({ usuario: req.session.usuario });
  });
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

// ——— Clientes (Admin) ———
app.get("/api/clientes", requireAdmin, async (_req, res) => {
  const list = await prisma.user.findMany({
    where: { tipo: "cliente" },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      endereco: true,
      rua: true,
      numero: true,
      bairro: true,
      cidade: true,
      cep: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(list.map(mapCliente));
});

app.post("/api/clientes", requireAdmin, async (req, res) => {
  const nome = String(req.body.nome ?? "").trim();
  const email = String(req.body.email ?? "").trim().toLowerCase();
  const telefone = String(req.body.telefone ?? "").trim();
  const rua = String(req.body.rua ?? "").trim();
  const numero = String(req.body.numero ?? "").trim();
  const bairro = String(req.body.bairro ?? "").trim();
  const cidade = String(req.body.cidade ?? "").trim();
  const cep = String(req.body.cep ?? "").trim();
  const senha = String(req.body.senha ?? "");

  if (!nome || !email || !senha) {
    return erro(res, 400, "Preencha nome, e-mail e senha.");
  }
  if (senha.length < 6) {
    return erro(res, 400, "A senha deve ter pelo menos 6 caracteres.");
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return erro(res, 400, "Este e-mail já está cadastrado.");

  const hash = await bcrypt.hash(senha, 10);
  const cliente = await prisma.user.create({
    data: {
      nome,
      email,
      telefone: telefone || null,
      endereco: montarEndereco(rua, numero, bairro, cidade, cep),
      rua: rua || null,
      numero: numero || null,
      bairro: bairro || null,
      cidade: cidade || null,
      cep: cep || null,
      senha: hash,
      tipo: "cliente",
    },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      endereco: true,
      rua: true,
      numero: true,
      bairro: true,
      cidade: true,
      cep: true,
      createdAt: true,
    },
  });
  res.json(mapCliente(cliente));
});

app.put("/api/clientes/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const nome = String(req.body.nome ?? "").trim();
  const email = String(req.body.email ?? "").trim().toLowerCase();
  const telefone = String(req.body.telefone ?? "").trim();
  const rua = String(req.body.rua ?? "").trim();
  const numero = String(req.body.numero ?? "").trim();
  const bairro = String(req.body.bairro ?? "").trim();
  const cidade = String(req.body.cidade ?? "").trim();
  const cep = String(req.body.cep ?? "").trim();
  const senha = String(req.body.senha ?? "");

  if (!id || !nome || !email) {
    return erro(res, 400, "Preencha nome e e-mail.");
  }

  const clienteAtual = await prisma.user.findFirst({ where: { id, tipo: "cliente" } });
  if (!clienteAtual) return erro(res, 404, "Cliente não encontrado.");

  const emailEmUso = await prisma.user.findFirst({ where: { email, NOT: { id } } });
  if (emailEmUso) return erro(res, 400, "Este e-mail já está cadastrado.");

  const data: {
    nome: string;
    email: string;
    telefone: string | null;
    endereco: string | null;
    rua: string | null;
    numero: string | null;
    bairro: string | null;
    cidade: string | null;
    cep: string | null;
    senha?: string;
  } = {
    nome,
    email,
    telefone: telefone || null,
    endereco: montarEndereco(rua, numero, bairro, cidade, cep),
    rua: rua || null,
    numero: numero || null,
    bairro: bairro || null,
    cidade: cidade || null,
    cep: cep || null,
  };

  if (senha) {
    if (senha.length < 6) {
      return erro(res, 400, "A senha deve ter pelo menos 6 caracteres.");
    }
    data.senha = await bcrypt.hash(senha, 10);
  }

  const cliente = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      endereco: true,
      rua: true,
      numero: true,
      bairro: true,
      cidade: true,
      cep: true,
      createdAt: true,
    },
  });
  res.json(mapCliente(cliente));
});

app.delete("/api/clientes/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return erro(res, 400, "ID inválido.");

  const cliente = await prisma.user.findFirst({ where: { id, tipo: "cliente" } });
  if (!cliente) return erro(res, 404, "Cliente não encontrado.");

  await prisma.$transaction(async (tx) => {
    await tx.order.updateMany({ where: { usuarioId: id }, data: { usuarioId: null } });
    await tx.user.delete({ where: { id } });
  });

  res.json({ ok: true });
});

// ——— Categorias ———
app.get("/api/categorias", async (_req, res) => {
  const list = await prisma.category.findMany({ orderBy: { nome: "asc" } });
  res.json(list.map(mapCategoria));
});

app.post("/api/categorias", requireAdmin, async (req, res) => {
  const nome = String(req.body.nome ?? "").trim();
  let slug = String(req.body.slug ?? "").trim();
  const icone = String(req.body.icone ?? "package").trim() || "package";
  if (!nome) return erro(res, 400, "Nome obrigatório.");
  if (!slug) slug = gerarSlug(nome);
  try {
    const c = await prisma.category.create({ data: { nome, slug, icone } });
    res.json(mapCategoria(c));
  } catch {
    erro(res, 400, "Slug já existe ou dados inválidos.");
  }
});

app.put("/api/categorias/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const nome = String(req.body.nome ?? "").trim();
  let slug = String(req.body.slug ?? "").trim();
  const icone = String(req.body.icone ?? "package").trim();
  if (!nome) return erro(res, 400, "Nome obrigatório.");
  if (!slug) slug = gerarSlug(nome);
  try {
    const c = await prisma.category.update({
      where: { id },
      data: { nome, slug, icone },
    });
    res.json(mapCategoria(c));
  } catch {
    erro(res, 400, "Não foi possível atualizar.");
  }
});

app.delete("/api/categorias/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const count = await prisma.product.count({ where: { categoriaId: id } });
  if (count > 0) return erro(res, 400, "Existem produtos nesta categoria.");
  await prisma.category.delete({ where: { id } }).catch(() => null);
  res.json({ ok: true });
});

// ——— Produtos ———
app.get("/api/produtos", async (req, res) => {
  const admin = req.session.usuario?.tipo === "admin";
  const todos = admin && req.query.todos === "1";

  const categoriaSlug = req.query.categoria ? String(req.query.categoria) : "";
  const destaque = req.query.destaque === "1" || req.query.destaque === "true";
  const q = req.query.q ? String(req.query.q).trim() : "";
  const limit = req.query.limit ? Math.min(100, Number(req.query.limit)) : undefined;

  const where: Record<string, unknown> = {};
  if (!todos) where.ativo = 1;
  if (categoriaSlug) {
    where.categoria = { slug: categoriaSlug };
  }
  if (destaque) where.destaque = 1;

  let list = await prisma.product.findMany({
    where,
    include: { categoria: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  if (q) {
    const ql = q.toLowerCase();
    list = list.filter(
      (p) =>
        p.nome.toLowerCase().includes(ql) || p.descricao.toLowerCase().includes(ql),
    );
  }

  res.json(list.map(mapProduto));
});

app.get("/api/produtos/:id", async (req, res) => {
  const id = Number(req.params.id);
  const p = await prisma.product.findFirst({
    where: { id, ativo: 1 },
    include: { categoria: true },
  });
  if (!p) return erro(res, 404, "Produto não encontrado.");
  res.json(mapProduto(p));
});

app.post("/api/produtos", requireAdmin, upload.single("imagem"), async (req, res) => {
  const nome = String(req.body.nome ?? "").trim();
  const descricao = String(req.body.descricao ?? "");
  const preco = Number(req.body.preco);
  const estoque = Number(req.body.estoque) || 0;
  const categoria_id = Number(req.body.categoria_id);
  const destaque = req.body.destaque === "1" || req.body.destaque === "true" ? 1 : 0;
  if (!nome || !categoria_id || Number.isNaN(preco)) {
    return erro(res, 400, "Dados inválidos.");
  }
  let slug = gerarSlug(nome);
  const exists = await prisma.product.findUnique({ where: { slug } });
  if (exists) slug = `${slug}-${Date.now()}`;

  const imagem = req.file?.filename ?? "sem-imagem.png";
  const p = await prisma.product.create({
    data: {
      nome,
      slug,
      descricao,
      preco,
      estoque,
      categoriaId: categoria_id,
      destaque,
      imagem,
      ativo: 1,
    },
    include: { categoria: true },
  });
  res.json(mapProduto(p));
});

app.put("/api/produtos/:id", requireAdmin, upload.single("imagem"), async (req, res) => {
  const id = Number(req.params.id);
  const nome = String(req.body.nome ?? "").trim();
  const descricao = String(req.body.descricao ?? "");
  const preco = Number(req.body.preco);
  const estoque = Number(req.body.estoque) || 0;
  const categoria_id = Number(req.body.categoria_id);
  const destaque = req.body.destaque === "1" || req.body.destaque === "true" ? 1 : 0;
  if (!nome || !categoria_id || Number.isNaN(preco)) {
    return erro(res, 400, "Dados inválidos.");
  }

  const data: Record<string, unknown> = {
    nome,
    descricao,
    preco,
    estoque,
    categoriaId: categoria_id,
    destaque,
    slug: `${gerarSlug(nome)}-${id}`,
  };
  if (req.file?.filename) data.imagem = req.file.filename;

  try {
    const p = await prisma.product.update({
      where: { id },
      data: data as never,
      include: { categoria: true },
    });
    res.json(mapProduto(p));
  } catch {
    erro(res, 400, "Não foi possível atualizar.");
  }
});

app.delete("/api/produtos/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await prisma.product.update({ where: { id }, data: { ativo: 0 } }).catch(() => null);
  res.json({ ok: true });
});

// ——— Pedidos ———
const FORMAS = ["pix", "cartao", "dinheiro"] as const;

app.post("/api/pedidos", async (req, res) => {
  const nome_cliente = String(req.body.nome ?? req.body.nome_cliente ?? "").trim();
  const telefone = String(req.body.telefone ?? "").trim();
  const endereco = String(req.body.endereco ?? "").trim();
  const rua = String(req.body.rua ?? "").trim();
  const numero = String(req.body.numero ?? "").trim();
  const bairro = String(req.body.bairro ?? "").trim();
  const cidade = String(req.body.cidade ?? "").trim();
  const cep = String(req.body.cep ?? "").trim();
  const salvar_endereco = !!req.body.salvar_endereco;
  const forma_pagamento = String(req.body.pagamento ?? req.body.forma_pagamento ?? "").trim();
  const observacoes = String(req.body.observacoes ?? "").trim();
  const frete_valor = parseFloat(req.body.frete_valor) || 0;
  const frete_tipo = String(req.body.frete_tipo ?? "").trim();

  if (!nome_cliente || (!endereco && !rua)) return erro(res, 400, "Preencha os campos obrigatórios.");
  if (!FORMAS.includes(forma_pagamento as (typeof FORMAS)[number])) {
    return erro(res, 400, "Forma de pagamento inválida.");
  }

  const itemsBody = Array.isArray(req.body.items) ? req.body.items : [];
  let lines: { produto_id: number; quantidade: number }[] = [];

  if (itemsBody.length > 0) {
    lines = itemsBody.map((it: { produto_id?: number; quantidade?: number }) => ({
      produto_id: Number(it.produto_id),
      quantidade: Math.max(1, Number(it.quantidade) || 1),
    }));
  } else if (req.session.carrinho) {
    lines = Object.values(req.session.carrinho).map((c) => ({
      produto_id: c.produto_id,
      quantidade: c.quantidade,
    }));
  }

  if (lines.length === 0) return erro(res, 400, "Carrinho vazio.");

  const usuarioId = req.session.usuario?.id ?? null;

  try {
    const pedido = await prisma.$transaction(async (tx) => {
      let total = 0;
      const resolved: {
        produtoId: number;
        quantidade: number;
        precoUnitario: number;
        nome: string;
        imagem: string;
      }[] = [];

      for (const line of lines) {
        const p = await tx.product.findFirst({
          where: { id: line.produto_id, ativo: 1 },
        });
        if (!p) throw new Error("Produto inválido.");
        if (line.quantidade > p.estoque) throw new Error(`Estoque insuficiente: ${p.nome}`);
        total += p.preco * line.quantidade;
        resolved.push({
          produtoId: p.id,
          quantidade: line.quantidade,
          precoUnitario: p.preco,
          nome: p.nome,
          imagem: p.imagem,
        });
      }

      const ped = await tx.order.create({
        data: {
          usuarioId,
          nomeCliente: nome_cliente,
          telefone,
          endereco: endereco || `${rua}, ${numero} - ${bairro}, ${cidade} - ${cep}`,
          rua,
          numero,
          bairro,
          cidade,
          cep,
          formaPagamento: forma_pagamento,
          total: total + frete_valor,
          observacoes: [
            frete_tipo ? `[Frete: ${frete_tipo} - R$ ${frete_valor.toFixed(2).replace(".", ",")}]` : "",
            observacoes,
          ].filter(Boolean).join(" | ") || null,
          status: "pendente",
          items: {
            create: resolved.map((r) => ({
              produtoId: r.produtoId,
              quantidade: r.quantidade,
              precoUnitario: r.precoUnitario,
            })),
          },
        },
      });

      if (usuarioId && salvar_endereco) {
        await tx.user.update({
          where: { id: usuarioId },
          data: {
            telefone,
            rua,
            numero,
            bairro,
            cidade,
            cep,
            endereco: endereco || `${rua}, ${numero} - ${bairro}, ${cidade} - ${cep}`
          },
        });
        // Atualiza a sessão
        if (req.session.usuario) {
          req.session.usuario.telefone = telefone;
          req.session.usuario.rua = rua;
          req.session.usuario.numero = numero;
          req.session.usuario.bairro = bairro;
          req.session.usuario.cidade = cidade;
          req.session.usuario.cep = cep;
        }
      }

      for (const r of resolved) {
        await tx.product.update({
          where: { id: r.produtoId },
          data: { estoque: { decrement: r.quantidade } },
        });
      }

      return ped;
    });

    req.session.carrinho = {};
    req.session.ultimoPedidoId = pedido.id;
    req.session.save(() => {
      res.json({ id: pedido.id });
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao processar pedido.";
    erro(res, 400, msg);
  }
});

function mapPedidoCompleto(p: {
  id: number;
  usuarioId: number | null;
  nomeCliente: string;
  telefone: string;
  endereco: string;
  rua: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  cep: string | null;
  formaPagamento: string;
  status: string;
  total: number;
  observacoes: string | null;
  createdAt: Date;
  items: {
    id: number;
    pedidoId: number;
    produtoId: number;
    quantidade: number;
    precoUnitario: number;
    produto: { nome: string; imagem: string };
  }[];
}) {
  return {
    id: p.id,
    usuario_id: p.usuarioId,
    nome_cliente: p.nomeCliente,
    telefone: p.telefone,
    endereco: p.endereco,
    rua: p.rua,
    numero: p.numero,
    bairro: p.bairro,
    cidade: p.cidade,
    cep: p.cep,
    forma_pagamento: p.formaPagamento as "pix" | "cartao" | "dinheiro",
    status: p.status as "pendente" | "confirmado" | "enviado" | "entregue" | "cancelado",
    total: p.total,
    observacoes: p.observacoes ?? undefined,
    criado_em: p.createdAt.toISOString(),
    itens: p.items.map((i) => ({
      id: i.id,
      pedido_id: i.pedidoId,
      produto_id: i.produtoId,
      nome: i.produto.nome,
      imagem: i.produto.imagem,
      quantidade: i.quantidade,
      preco_unitario: i.precoUnitario,
    })),
  };
}

app.get("/api/pedidos/meus", async (req, res) => {
  if (!req.session.usuario) return erro(res, 401, "Não autenticado.");
  const list = await prisma.order.findMany({
    where: { usuarioId: req.session.usuario.id },
    include: { items: { include: { produto: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(list.map(mapPedidoCompleto));
});

app.get("/api/pedidos/confirmacao/:id", async (req, res) => {
  const id = Number(req.params.id);
  const p = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { produto: true } } },
  });
  if (!p) return erro(res, 404, "Pedido não encontrado.");

  const okGuest = req.session.ultimoPedidoId === id;
  const okUser = req.session.usuario?.id && p.usuarioId === req.session.usuario.id;
  const okAdmin = req.session.usuario?.tipo === "admin";
  if (!okGuest && !okUser && !okAdmin) return erro(res, 403, "Acesso negado.");

  res.json(mapPedidoCompleto(p));
});

app.get("/api/pedidos", requireAdmin, async (req, res) => {
  const status = req.query.status ? String(req.query.status) : undefined;
  const list = await prisma.order.findMany({
    where: status ? { status } : undefined,
    include: { items: { include: { produto: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(list.map(mapPedidoCompleto));
});

app.get("/api/pedidos/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const p = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { produto: true } } },
  });
  if (!p) return erro(res, 404, "Pedido não encontrado.");
  res.json(mapPedidoCompleto(p));
});

app.put("/api/pedidos/:id/status", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const status = String(req.body.status ?? "");
  const valid = ["pendente", "confirmado", "enviado", "entregue", "cancelado"];
  if (!valid.includes(status)) return erro(res, 400, "Status inválido.");
  await prisma.order.update({ where: { id }, data: { status } });
  res.json({ ok: true });
});

// ——— Admin stats ———
app.get("/api/admin/stats", requireAdmin, async (_req, res) => {
  const ago7 = new Date();
  ago7.setDate(ago7.getDate() - 7);
  const ago30 = new Date();
  ago30.setDate(ago30.getDate() - 30);

  const [
    total_pedidos,
    produtos_ativos,
    pedidos_pendentes,
    receita_agg,
    total_categorias,
    total_clientes,
    pedidos_7d,
    receita_30d_agg,
    estoque_baixo,
    esgotados,
    por_status,
    ultimos,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.product.count({ where: { ativo: 1 } }),
    prisma.order.count({ where: { status: "pendente" } }),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.category.count(),
    prisma.user.count({ where: { tipo: "cliente" } }),
    prisma.order.count({ where: { createdAt: { gte: ago7 } } }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: ago30 },
        status: { not: "cancelado" },
      },
      _sum: { total: true },
    }),
    prisma.product.count({
      where: { ativo: 1, estoque: { gt: 0, lte: 5 } },
    }),
    prisma.product.count({ where: { ativo: 1, estoque: 0 } }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { items: { include: { produto: true } } },
    }),
  ]);

  const pedidos_por_status: Record<string, number> = {};
  for (const row of por_status) {
    pedidos_por_status[row.status] = row._count._all;
  }

  res.json({
    total_pedidos,
    total_receita: receita_agg._sum.total ?? 0,
    total_produtos: produtos_ativos,
    pedidos_pendentes,
    total_categorias,
    total_clientes,
    pedidos_ultimos_7_dias: pedidos_7d,
    receita_ultimos_30_dias: receita_30d_agg._sum.total ?? 0,
    produtos_estoque_baixo: estoque_baixo,
    produtos_esgotados: esgotados,
    pedidos_por_status,
    ultimos_pedidos: ultimos.map((p) => ({
      id: p.id,
      nome_cliente: p.nomeCliente,
      total: p.total,
      status: p.status,
      criado_em: p.createdAt.toISOString(),
      itens_count: p.items.length,
    })),
  });
});

// ——— Frete ———
const CEP_ORIGEM = (process.env.CEP_ORIGEM ?? "87501000").replace(/\D/g, "");

function getZonaFrete(cepOrigem: string, cepDestino: string): 1 | 2 | 3 | 4 {
  const o = parseInt(cepOrigem.substring(0, 2), 10);
  const d = parseInt(cepDestino.substring(0, 2), 10);

  function regiao(p: number): string {
    if (p >= 1 && p <= 9) return "SP_CAP";
    if (p >= 10 && p <= 19) return "SP_INT";
    if (p >= 20 && p <= 28) return "RJ";
    if (p === 29) return "ES";
    if (p >= 30 && p <= 39) return "MG";
    if (p >= 40 && p <= 48) return "BA";
    if (p === 49) return "SE";
    if (p >= 50 && p <= 56) return "PE";
    if (p === 57) return "AL";
    if (p === 58) return "PB";
    if (p === 59) return "RN";
    if (p >= 60 && p <= 63) return "CE";
    if (p === 64) return "PI";
    if (p === 65) return "MA";
    if (p >= 66 && p <= 68) return "PA";
    if (p === 69) return "AM";
    if (p >= 70 && p <= 72) return "DF";
    if (p >= 73 && p <= 76) return "GO";
    if (p === 77) return "TO";
    if (p === 78) return "MT";
    if (p === 79) return "MS";
    if (p >= 80 && p <= 87) return "PR";
    if (p >= 88 && p <= 89) return "SC";
    if (p >= 90 && p <= 99) return "RS";
    return "?";
  }

  const ro = regiao(o);
  const rd = regiao(d);

  if (ro === rd) return 1;

  const sul = new Set(["PR", "SC", "RS"]);
  const sudeste = new Set(["SP_CAP", "SP_INT", "RJ", "ES", "MG"]);
  const centroOeste = new Set(["MS", "MT", "GO", "DF", "TO"]);

  function grupo(r: string): string {
    if (sul.has(r)) return "sul";
    if (sudeste.has(r)) return "sudeste";
    if (centroOeste.has(r)) return "centro";
    return "outro";
  }

  const go = grupo(ro);
  const gd = grupo(rd);

  if (
    (go === "sul" && (gd === "sudeste" || gd === "centro")) ||
    (gd === "sul" && (go === "sudeste" || go === "centro")) ||
    (go === "sudeste" && gd === "centro") ||
    (gd === "sudeste" && go === "centro")
  ) return 2;

  if (go !== "outro" && gd !== "outro") return 3;

  return 4;
}

function calcularOpcoesFrete(zona: 1 | 2 | 3 | 4, pesoKg: number): {
  pac: { preco: number; prazo: string };
  sedex: { preco: number; prazo: string };
} {
  const pesoFaturado = Math.max(0.3, Math.ceil(pesoKg / 0.3) * 0.3);
  const tabela = {
    1: { pacBase: 11.00, pacKg: 2.20, sedexBase: 20.00, sedexKg: 4.50, pacDias: "4 a 6 dias úteis", sedexDias: "1 a 2 dias úteis" },
    2: { pacBase: 14.50, pacKg: 2.80, sedexBase: 27.00, sedexKg: 5.80, pacDias: "6 a 9 dias úteis", sedexDias: "2 a 3 dias úteis" },
    3: { pacBase: 18.00, pacKg: 3.60, sedexBase: 34.00, sedexKg: 7.50, pacDias: "8 a 12 dias úteis", sedexDias: "3 a 5 dias úteis" },
    4: { pacBase: 22.50, pacKg: 4.80, sedexBase: 43.00, sedexKg: 10.00, pacDias: "10 a 15 dias úteis", sedexDias: "5 a 7 dias úteis" },
  } as const;
  const t = tabela[zona];
  return {
    pac: { preco: Math.round((t.pacBase + t.pacKg * pesoFaturado) * 100) / 100, prazo: t.pacDias },
    sedex: { preco: Math.round((t.sedexBase + t.sedexKg * pesoFaturado) * 100) / 100, prazo: t.sedexDias },
  };
}

app.get("/api/frete/calcular", async (req, res) => {
  try {
    const cep = String(req.query.cep ?? "").replace(/\D/g, "");
    const peso = Math.max(0.3, parseFloat(String(req.query.peso ?? "1")) || 1);

    if (cep.length !== 8) return erro(res, 400, "CEP inválido. Informe 8 dígitos.");

    const viaCepRes = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!viaCepRes.ok) return erro(res, 502, "Erro ao consultar o CEP.");

    const dados = await viaCepRes.json() as { erro?: boolean; localidade?: string; uf?: string };
    if (dados.erro) return erro(res, 400, "CEP não encontrado.");

    const zona = getZonaFrete(CEP_ORIGEM, cep);
    const opcoes = calcularOpcoesFrete(zona, peso);

    res.json({
      destino: { localidade: dados.localidade ?? "", uf: dados.uf ?? "" },
      ...opcoes,
    });
  } catch {
    erro(res, 500, "Erro ao calcular frete.");
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ erro: err.message || "Erro interno" });
});

app.listen(PORT, () => {
  console.log(`KeFix API http://localhost:${PORT}`);
});
