import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, RefreshCcw, Headphones, ArrowRight, Smartphone } from 'lucide-react';
import { Produto, Categoria } from '../types';
import { api } from '../utils/api';
import ProdutoCard from '../components/ProdutoCard';
import * as Icons from 'lucide-react';

function CatIcon({ nome }: { nome: string }) {
  const Icon = (Icons as any)[nome.split('-').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join('')];
  return Icon ? <Icon size={28} /> : <Smartphone size={28} />;
}

export default function Home() {
  const [destaques, setDestaques] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<Produto[]>('/produtos?destaque=1&limit=8'),
      api.get<Categoria[]>('/categorias'),
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
            <span className="hero-badge">🔧 Distribuidora Oficial</span>
            <h1>Peças originais para <span className="destaque-texto">qualquer celular</span></h1>
            <p>Telas, baterias, conectores e muito mais. Entrega rápida para todo o Brasil com garantia de qualidade.</p>
            <div className="hero-botoes">
              <a href="#produtos" className="btn-primary">Ver produtos</a>
              <Link to="/auth?tab=cadastro" className="btn-outline">Criar conta grátis</Link>
            </div>
            <div className="hero-stats">
              <div><strong>500+</strong><span>Produtos</span></div>
              <div><strong>99%</strong><span>Satisfação</span></div>
              <div><strong>24h</strong><span>Entrega SP</span></div>
            </div>
          </div>
          <div className="hero-img">
            <div className="hero-circle">
              <Smartphone size={80} color="#007BFF" />
            </div>
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="secao-categorias">
        <div className="container">
          <h2 className="secao-titulo">Categorias</h2>
          <div className="grid-categorias">
            {categorias.map(cat => (
              <Link key={cat.id} to={`/categoria/${cat.slug}`} className="card-categoria">
                <CatIcon nome={cat.icone} />
                <span>{cat.nome}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Produtos em Destaque */}
      <section className="secao-produtos" id="produtos">
        <div className="container">
          <div className="secao-header">
            <h2 className="secao-titulo">Produtos em Destaque</h2>
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
