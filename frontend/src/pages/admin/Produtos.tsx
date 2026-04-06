import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { Produto, Categoria } from '../../types';
import { FirestoreService } from '../../lib/services';
import { api, imgUrl, formatarPreco } from '../../utils/api';

const FORM_INIT = { nome: '', descricao: '', preco: '', estoque: '', categoria_id: '', destaque: '0', imagem_atual: '' };

export default function AdminProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(FORM_INIT);
  const [editId, setEditId] = useState<number | null>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function carregar() {
    const [prods, cats] = await Promise.all([
      FirestoreService.getProdutos({ adminTodos: true }),
      FirestoreService.getCategorias(),
    ]);
    setProdutos(prods);
    setCategorias(cats);
  }

  useEffect(() => { carregar(); }, []);

  function abrirNovo() {
    setForm(FORM_INIT);
    setEditId(null);
    setArquivo(null);
    setErro('');
    setModal(true);
  }

  function abrirEditar(p: Produto) {
    setForm({
      nome: p.nome, descricao: p.descricao, preco: String(p.preco),
      estoque: String(p.estoque), categoria_id: String(p.categoria_id),
      destaque: String(p.destaque), imagem_atual: p.imagem,
    });
    setEditId(p.id);
    setArquivo(null);
    setErro('');
    setModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (arquivo) fd.append('imagem', arquivo);

    try {
      if (editId) {
        await api.upload(`/produtos/${editId}`, fd, 'PUT');
        setSucesso('Produto atualizado!');
      } else {
        await api.upload('/produtos', fd);
        setSucesso('Produto cadastrado!');
      }
      setModal(false);
      carregar();
    } catch (err: any) {
      setErro(err.message);
    }
  }

  async function handleDeletar(id: number) {
    if (!confirm('Remover este produto?')) return;
    await api.delete(`/produtos/${id}`);
    carregar();
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Produtos</h1>
        <button className="btn-primary" onClick={abrirNovo}><Plus size={16} /> Novo Produto</button>
      </div>

      {sucesso && <div className="alerta alerta-sucesso">{sucesso}</div>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Imagem</th><th>Nome</th><th>Categoria</th>
              <th>Preço</th><th>Estoque</th><th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map(p => (
              <tr key={p.id}>
                <td><img src={imgUrl(p.imagem)} alt={p.nome} className="admin-thumb" onError={e => { (e.target as HTMLImageElement).src = '/placeholder.png'; }} /></td>
                <td>{p.nome}{p.destaque ? ' ⭐' : ''}</td>
                <td>{p.categoria_nome}</td>
                <td>{formatarPreco(p.preco)}</td>
                <td><span className={p.estoque === 0 ? 'badge-erro' : 'badge-ok'}>{p.estoque}</span></td>
                <td className="acoes-td">
                  <button className="btn-icon-sm" onClick={() => abrirEditar(p)}><Pencil size={15} /></button>
                  <button className="btn-icon-sm danger" onClick={() => handleDeletar(p.id)}><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editId ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button onClick={() => setModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="campo"><label>Nome *</label><input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required /></div>
              <div className="campo"><label>Descrição</label><textarea value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} rows={3} /></div>
              <div className="campos-2col">
                <div className="campo"><label>Preço *</label><input type="number" step="0.01" value={form.preco} onChange={e => setForm({ ...form, preco: e.target.value })} required /></div>
                <div className="campo"><label>Estoque</label><input type="number" value={form.estoque} onChange={e => setForm({ ...form, estoque: e.target.value })} /></div>
              </div>
              <div className="campo">
                <label>Categoria *</label>
                <select value={form.categoria_id} onChange={e => setForm({ ...form, categoria_id: e.target.value })} required>
                  <option value="">Selecione...</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div className="campo">
                <label>Imagem</label>
                <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={e => setArquivo(e.target.files?.[0] || null)} />
              </div>
              <div className="campo-check">
                <label>
                  <input type="checkbox" checked={form.destaque === '1'} onChange={e => setForm({ ...form, destaque: e.target.checked ? '1' : '0' })} />
                  Produto em destaque
                </label>
              </div>
              {erro && <div className="alerta alerta-erro">{erro}</div>}
              <div className="modal-footer">
                <button type="button" className="btn-outline-sm" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
