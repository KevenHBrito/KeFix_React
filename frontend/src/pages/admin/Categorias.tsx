import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { Categoria } from '../../types';
import { api, gerarSlug } from '../../utils/api';

const FORM_INIT = { nome: '', slug: '', icone: 'box' };

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(FORM_INIT);
  const [editId, setEditId] = useState<number | null>(null);
  const [erro, setErro] = useState('');

  async function carregar() {
    const data = await api.get<Categoria[]>('/categorias');
    setCategorias(data);
  }

  useEffect(() => { carregar(); }, []);

  function abrirNovo() {
    setForm(FORM_INIT); setEditId(null); setErro(''); setModal(true);
  }

  function abrirEditar(c: Categoria) {
    setForm({ nome: c.nome, slug: c.slug, icone: c.icone });
    setEditId(c.id); setErro(''); setModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setErro('');
    try {
      if (editId) {
        await api.put(`/categorias/${editId}`, form);
      } else {
        await api.post('/categorias', form);
      }
      setModal(false); carregar();
    } catch (err: any) {
      setErro(err.message);
    }
  }

  async function handleDeletar(id: number) {
    if (!confirm('Excluir categoria? Isso pode afetar produtos vinculados.')) return;
    try {
      await api.delete(`/categorias/${id}`);
      carregar();
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Categorias</h1>
        <button className="btn-primary" onClick={abrirNovo}><Plus size={16} /> Nova Categoria</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>ID</th><th>Nome</th><th>Slug</th><th>Ícone</th><th>Ações</th></tr></thead>
          <tbody>
            {categorias.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.nome}</td>
                <td><code>{c.slug}</code></td>
                <td><code>{c.icone}</code></td>
                <td className="acoes-td">
                  <button className="btn-icon-sm" onClick={() => abrirEditar(c)}><Pencil size={15} /></button>
                  <button className="btn-icon-sm danger" onClick={() => handleDeletar(c.id)}><Trash2 size={15} /></button>
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
              <h2>{editId ? 'Editar Categoria' : 'Nova Categoria'}</h2>
              <button onClick={() => setModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="campo">
                <label>Nome</label>
                <input
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value, slug: gerarSlug(e.target.value) })}
                  required
                />
              </div>
              <div className="campo">
                <label>Slug</label>
                <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required />
              </div>
              <div className="campo">
                <label>Ícone (Lucide)</label>
                <input value={form.icone} onChange={e => setForm({ ...form, icone: e.target.value })} placeholder="ex: battery-charging" />
                <small>Veja ícones em <a href="https://lucide.dev/icons" target="_blank" rel="noreferrer">lucide.dev/icons</a></small>
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
