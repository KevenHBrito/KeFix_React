import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Smartphone, Truck, RefreshCcw, Headphones, Package } from 'lucide-react';
import { Produto, Categoria } from '../types';
import { FirestoreService } from '../lib/services';
import ProdutoCard from '../components/ProdutoCard';

function CatIcon({ icone }: { icone: string }) {
  // Map simple string icons or just use common ones
  if (icone === 'smartphone') return <Smartphone size={28} />;
  if (icone === 'package') return <Package size={28} />;
  return <Smartphone size={28} />; // Default
}

export default function Home() {
  const [destaques, setDestaques] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      FirestoreService.getProdutos({ destaque: true, limitCount: 8 }),
      FirestoreService.getCategorias(),
    ]).then(([prods, cats]) => {
      setDestaques(prods);
      setCategorias(cats);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content container">
          <div className="hero-texto">
            <span className="hero-badge">
              <ShieldCheck size={16} /> Distribuidora Oficial em São Paulo
            </span>
            <h1>Qualidade que seu <br /><span className="destaque-texto">celular merece</span></h1>
            <p>A maior variedade de peças de reposição com garantia de procedência. Atacado e varejo com entrega expressa.</p>
            <div className="hero-botoes">
              <a href="#produtos" className="btn-primary">Explorar Catálogo <ArrowRight size={18} /></a>
              <Link to="/auth?tab=cadastro" className="btn-outline">Criar Conta Comercial</Link>
            </div>
            <div className="hero-stats">
              <div><strong>8k+</strong><span>Clientes Atendidos</span></div>
              <div><strong>15k+</strong><span>Itens em Estoque</span></div>
              <div><strong>100%</strong><span>Garantia de Teste</span></div>
            </div>
          </div>
          <div className="hero-img">
            <div className="hero-circle">
              <Smartphone size={120} strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="secao-categorias">
        <div className="container">
          <div className="secao-cabecalho">
            <h2 className="secao-titulo">Categorias</h2>
            <p className="secao-subtitulo">Navegue por tipo de peça e encontre o que precisa mais rápido.</p>
          </div>
          <div className="grid-categorias">
            {categorias.map(cat => (
              <Link key={cat.id} to={`/categoria/${cat.slug}`} className="card-categoria">
                <CatIcon icone={cat.icone} />
                <span>{cat.nome}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Produtos em Destaque */}
      <section className="secao-produtos" id="produtos">
        <div className="container">
          <div className="secao-header secao-header-produtos">
            <div>
              <h2 className="secao-titulo">Produtos em destaque</h2>
              <p className="secao-subtitulo secao-subtitulo-inline">Seleção com alta rotatividade e garantia KeFix.</p>
            </div>
            <Link to="/busca" className="ver-todos">
              Ver todos <ArrowRight size={16} />
            </Link>
          </div>
          {loading ? (
            <div className="loading-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card-skeleton" />
              ))}
            </div>
          ) : (
            <div className="grid-produtos">
              {destaques.map(p => <ProdutoCard key={p.id} produto={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Benefícios */}
      <section className="secao-beneficios">
        <div className="container grid-beneficios">
          {[
            { icon: <Truck />, titulo: 'Frete Rápido', desc: 'Enviamos para todo Brasil com rastreamento' },
            { icon: <ShieldCheck />, titulo: 'Garantia', desc: 'Todos os produtos com garantia de qualidade' },
            { icon: <RefreshCcw />, titulo: 'Trocas fáceis', desc: 'Política de troca simples e sem burocracia' },
            { icon: <Headphones />, titulo: 'Suporte', desc: 'Atendimento via WhatsApp e e-mail' },
          ].map((b, i) => (
            <div key={i} className="beneficio">
              {b.icon}
              <h4>{b.titulo}</h4>
              <p>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
