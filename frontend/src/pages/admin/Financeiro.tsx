import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { FirestoreService } from '../../lib/services';
import type { Despesa, DespesaCategoria, RelatorioFinanceiro } from '../../types';
import { formatarPreco } from '../../utils/api';

const hojeISO = new Date().toISOString().slice(0, 10);

function inicioMesISO() {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

export default function AdminFinanceiro() {
  const [inicio, setInicio] = useState(inicioMesISO());
  const [fim, setFim] = useState(hojeISO);
  const [q, setQ] = useState('');

  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [despesaCategorias, setDespesaCategorias] = useState<DespesaCategoria[]>([]);
  const [relatorio, setRelatorio] = useState<RelatorioFinanceiro | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    descricao: '',
    categoria: 'geral',
    valor: '',
    data_competencia: hojeISO,
  });
  const [categoriaModal, setCategoriaModal] = useState(false);
  const [categoriaErro, setCategoriaErro] = useState('');
  const [categoriaEditId, setCategoriaEditId] = useState<number | null>(null);
  const [categoriaNome, setCategoriaNome] = useState('');

  const categorias = useMemo(() => {
    const set = new Set<string>(['geral']);
    for (const c of despesaCategorias) set.add(c.nome);
    for (const d of despesas) set.add(d.categoria);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [despesaCategorias, despesas]);

  const categoriasNoPeriodo = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const despesa of despesas) {
      mapa.set(despesa.categoria, (mapa.get(despesa.categoria) ?? 0) + 1);
    }
    return mapa;
  }, [despesas]);

  async function carregar() {
    setLoading(true);
    setErro('');
    try {
      // Carrega despesas e resumo financeiro do mesmo período para manter a tela sincronizada.
      const [list, resumo, categoriasList] = await Promise.all([
        FirestoreService.getDespesas({ inicio, fim, q }),
        FirestoreService.getRelatorioFinanceiro(inicio, fim),
        FirestoreService.getDespesaCategorias(),
      ]);
      setDespesas(list);
      setRelatorio(resumo);
      setDespesaCategorias(categoriasList);
    } catch (err: any) {
      setErro(err.message || 'Erro ao carregar financeiro.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  useEffect(() => {
    if (categorias.length === 0) return;
    setForm((estadoAtual) => {
      if (estadoAtual.categoria && categorias.includes(estadoAtual.categoria)) {
        return estadoAtual;
      }
      return { ...estadoAtual, categoria: categorias[0] };
    });
  }, [categorias]);

  function abrirNovo() {
    setEditId(null);
    setForm({
      descricao: '',
      categoria: categorias[0] ?? 'geral',
      valor: '',
      data_competencia: hojeISO,
    });
    setModal(true);
  }

  function abrirNovaCategoria() {
    setCategoriaEditId(null);
    setCategoriaNome('');
    setCategoriaErro('');
    setCategoriaModal(true);
  }

  function abrirEditarCategoria(categoria: DespesaCategoria) {
    setCategoriaEditId(categoria.id);
    setCategoriaNome(categoria.nome);
    setCategoriaErro('');
    setCategoriaModal(true);
  }

  function abrirEditar(d: Despesa) {
    setEditId(d.id);
    setForm({
      descricao: d.descricao,
      categoria: d.categoria,
      valor: String(d.valor),
      data_competencia: d.data_competencia.slice(0, 10),
    });
    setModal(true);
  }

  async function salvarDespesa(e: React.FormEvent) {
    e.preventDefault();
    setErro('');

    const valor = Number(form.valor);
    if (!form.descricao.trim() || Number.isNaN(valor) || valor <= 0) {
      setErro('Preencha descrição e valor válido para a despesa.');
      return;
    }

    const payload = {
      descricao: form.descricao.trim(),
      categoria: form.categoria.trim() || 'geral',
      valor,
      data_competencia: form.data_competencia,
    };

    try {
      if (editId) {
        await FirestoreService.atualizarDespesa(editId, payload);
      } else {
        await FirestoreService.criarDespesa(payload);
      }
      setModal(false);
      await carregar();
    } catch (err: any) {
      setErro(err.message || 'Erro ao salvar despesa.');
    }
  }

  async function salvarCategoria(e: React.FormEvent) {
    e.preventDefault();
    setCategoriaErro('');

    const nome = categoriaNome.trim();
    const nomeAnterior = categoriaEditId
      ? despesaCategorias.find((item) => item.id === categoriaEditId)?.nome ?? ''
      : '';
    if (!nome) {
      setCategoriaErro('Informe o nome da categoria.');
      return;
    }

    try {
      if (categoriaEditId) {
        await FirestoreService.atualizarDespesaCategoria(categoriaEditId, { nome });
      } else {
        await FirestoreService.criarDespesaCategoria({ nome });
      }
      setCategoriaModal(false);
      await carregar();
      setForm((estadoAtual) => {
        if (categoriaEditId && estadoAtual.categoria === nomeAnterior) {
          return { ...estadoAtual, categoria: nome };
        }
        if (!categoriaEditId) {
          return { ...estadoAtual, categoria: nome };
        }
        return estadoAtual;
      });
    } catch (err: any) {
      setCategoriaErro(err.message || 'Erro ao salvar categoria.');
    }
  }

  async function excluirCategoria(id: number) {
    if (!confirm('Excluir esta categoria de despesa?')) return;
    try {
      await FirestoreService.excluirDespesaCategoria(id);
      await carregar();
    } catch (err: any) {
      setErro(err.message || 'Erro ao excluir categoria.');
    }
  }

  async function excluirDespesa(id: number) {
    if (!confirm('Excluir esta despesa?')) return;
    try {
      await FirestoreService.excluirDespesa(id);
      await carregar();
    } catch (err: any) {
      setErro(err.message || 'Erro ao excluir despesa.');
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Financeiro</h1>
        <button className="btn-primary" onClick={abrirNovo}>
          <Plus size={16} /> Nova despesa
        </button>
      </div>

      <section className="financeiro-cadastro-categorias">
        <div className="financeiro-section-header">
          <div>
            <h2>Categorias de despesa</h2>
            <p>Cadastre categorias para reutilizar no lançamento e manter o financeiro padronizado.</p>
          </div>
          <button className="btn-outline-sm" onClick={abrirNovaCategoria}>
            <Plus size={16} /> Nova categoria
          </button>
        </div>

        <div className="financeiro-categorias-grid financeiro-categorias-grid-admin">
          {despesaCategorias.length === 0 && <p>Nenhuma categoria cadastrada.</p>}
          {despesaCategorias.map((categoria) => (
            <div key={categoria.id} className="financeiro-categoria-item financeiro-categoria-admin-item">
              <div>
                <strong>{categoria.nome}</strong>
                <span>{categoriasNoPeriodo.get(categoria.nome) ?? 0} lançamento(s) no período</span>
              </div>
              <div className="financeiro-categoria-acoes">
                <button className="btn-icon-sm" onClick={() => abrirEditarCategoria(categoria)}>
                  <Pencil size={15} />
                </button>
                <button className="btn-icon-sm danger" onClick={() => excluirCategoria(categoria.id)}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="financeiro-filtros">
        <div className="campo">
          <label>Início</label>
          <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
        </div>
        <div className="campo">
          <label>Fim</label>
          <input type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
        </div>
        <div className="campo financeiro-busca">
          <label>Buscar</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Descrição ou categoria"
          />
        </div>
        <button className="btn-outline-sm" onClick={carregar} disabled={loading}>
          {loading ? 'Carregando...' : 'Atualizar relatório'}
        </button>
      </div>

      {erro && <div className="alerta alerta-erro">{erro}</div>}

      {relatorio && (
        <div className="financeiro-cards">
          <article className="stat-card stat-card-compact">
            <div>
              <div className="stat-label">Vendas (período)</div>
              <div className="stat-valor stat-valor-sm">{formatarPreco(relatorio.total_vendas)}</div>
            </div>
          </article>
          <article className="stat-card stat-card-compact">
            <div>
              <div className="stat-label">Despesas (período)</div>
              <div className="stat-valor stat-valor-sm">{formatarPreco(relatorio.total_despesas)}</div>
            </div>
          </article>
          <article className="stat-card stat-card-compact">
            <div>
              <div className="stat-label">Saldo</div>
              <div className={`stat-valor stat-valor-sm ${relatorio.saldo < 0 ? 'text-danger' : ''}`}>
                {formatarPreco(relatorio.saldo)}
              </div>
            </div>
          </article>
          <article className="stat-card stat-card-compact">
            <div>
              <div className="stat-label">Ticket médio</div>
              <div className="stat-valor stat-valor-sm">{formatarPreco(relatorio.ticket_medio)}</div>
            </div>
          </article>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Valor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {despesas.map((d) => (
              <tr key={d.id}>
                <td>{new Date(d.data_competencia).toLocaleDateString('pt-BR')}</td>
                <td>{d.descricao}</td>
                <td>{d.categoria}</td>
                <td>{formatarPreco(d.valor)}</td>
                <td className="acoes-td">
                  <button className="btn-icon-sm" onClick={() => abrirEditar(d)}>
                    <Pencil size={15} />
                  </button>
                  <button className="btn-icon-sm danger" onClick={() => excluirDespesa(d.id)}>
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {despesas.length === 0 && (
              <tr>
                <td colSpan={5}>Nenhuma despesa no período informado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {relatorio && (
        <section className="financeiro-categorias">
          <h2>Despesas por categoria</h2>
          <div className="financeiro-categorias-grid">
            {relatorio.despesas_por_categoria.length === 0 && <p>Sem despesas categorizadas no período.</p>}
            {relatorio.despesas_por_categoria.map((c) => (
              <div key={c.categoria} className="financeiro-categoria-item">
                <strong>{c.categoria}</strong>
                <span>{formatarPreco(c.total)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editId ? 'Editar despesa' : 'Nova despesa'}</h2>
              <button onClick={() => setModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form className="modal-form" onSubmit={salvarDespesa}>
              <div className="campo">
                <label>Descrição</label>
                <input
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  required
                />
              </div>
              <div className="campos-2col">
                <div className="campo">
                  <label>Categoria</label>
                  <div className="financeiro-categoria-campo">
                    <select
                      value={form.categoria}
                      onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    >
                      {categorias.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <button type="button" className="btn-outline-sm" onClick={abrirNovaCategoria}>
                      Cadastrar
                    </button>
                  </div>
                </div>
                <div className="campo">
                  <label>Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={form.valor}
                    onChange={(e) => setForm({ ...form, valor: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="campo">
                <label>Data de competência</label>
                <input
                  type="date"
                  value={form.data_competencia}
                  onChange={(e) => setForm({ ...form, data_competencia: e.target.value })}
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-outline-sm" onClick={() => setModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {categoriaModal && (
        <div className="modal-overlay" onClick={() => setCategoriaModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{categoriaEditId ? 'Editar categoria financeira' : 'Nova categoria financeira'}</h2>
              <button onClick={() => setCategoriaModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form className="modal-form" onSubmit={salvarCategoria}>
              <div className="campo">
                <label>Nome</label>
                <input
                  value={categoriaNome}
                  onChange={(e) => setCategoriaNome(e.target.value)}
                  placeholder="Ex.: fornecedores"
                  required
                />
              </div>

              {categoriaErro && <div className="alerta alerta-erro">{categoriaErro}</div>}

              <div className="modal-footer">
                <button type="button" className="btn-outline-sm" onClick={() => setCategoriaModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Salvar categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
