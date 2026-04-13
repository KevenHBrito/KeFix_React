import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FirestoreService } from '../lib/services';
import type { ComprovanteVenda } from '../types';
import { formatarPreco } from '../utils/api';

export default function ComprovantePage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ComprovanteVenda | null>(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!id) return;

    // Busca os dados consolidados para permitir impressão do comprovante.
    FirestoreService.getComprovantePedido(Number(id))
      .then(setData)
      .catch((e: any) => setErro(e.message || 'Não foi possível carregar o comprovante.'));
  }, [id]);

  if (erro) {
    return (
      <main className="container" style={{ paddingTop: 24 }}>
        <div className="alerta alerta-erro">{erro}</div>
        <Link to="/">Voltar</Link>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="container" style={{ paddingTop: 24 }}>
        <div className="loading-page">
          <div className="spinner" />
        </div>
      </main>
    );
  }

  const { pedido, loja, emitido_em } = data;

  return (
    <main className="container comprovante-page">
      <div className="comprovante-actions no-print">
        <button className="btn-primary" onClick={() => window.print()}>
          Imprimir comprovante
        </button>
        <Link className="btn-outline" to="/">
          Voltar à loja
        </Link>
      </div>

      <section className="comprovante-card">
        <header className="comprovante-header">
          <h1>{loja.nome}</h1>
          <p>{loja.cidade}</p>
          <p>{loja.telefone}</p>
          <strong>Comprovante de venda</strong>
        </header>

        <div className="comprovante-meta">
          <span>Pedido #{pedido.id}</span>
          <span>Emitido em {new Date(emitido_em).toLocaleString('pt-BR')}</span>
        </div>

        <div className="comprovante-bloco">
          <h2>Cliente</h2>
          <p>{pedido.nome_cliente}</p>
          <p>{pedido.telefone || 'Sem telefone informado'}</p>
          <p>{pedido.endereco}</p>
        </div>

        <div className="comprovante-bloco">
          <h2>Itens</h2>
          <table className="comprovante-tabela">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Qtd</th>
                <th>Unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {pedido.itens?.map((item) => (
                <tr key={item.id}>
                  <td>{item.nome}</td>
                  <td>{item.quantidade}</td>
                  <td>{formatarPreco(item.preco_unitario)}</td>
                  <td>{formatarPreco(item.preco_unitario * item.quantidade)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="comprovante-rodape">
          <p>Forma de pagamento: {pedido.forma_pagamento.toUpperCase()}</p>
          <strong>Total: {formatarPreco(pedido.total)}</strong>
        </div>
      </section>
    </main>
  );
}
