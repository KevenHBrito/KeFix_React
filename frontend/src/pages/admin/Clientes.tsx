import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { api } from '../../utils/api';
import type { ClienteAdmin } from '../../types';

const FORM_INIT = {
  nome: '',
  email: '',
  telefone: '',
  rua: '',
  numero: '',
  bairro: '',
  cidade: '',
  cep: '',
  senha: '',
  confirmar_senha: '',
};

export default function AdminClientes() {
  const [clientes, setClientes] = useState<ClienteAdmin[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(FORM_INIT);
  const [editId, setEditId] = useState<number | null>(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function carregar() {
    const data = await api.get<ClienteAdmin[]>('/clientes');
    setClientes(data);
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrirNovo() {
    setForm(FORM_INIT);
    setEditId(null);
    setErro('');
    setModal(true);
  }

  function abrirEditar(cliente: ClienteAdmin) {
    setForm({
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone ?? '',
      rua: cliente.rua ?? '',
      numero: cliente.numero ?? '',
      bairro: cliente.bairro ?? '',
      cidade: cliente.cidade ?? '',
      cep: cliente.cep ?? '',
      senha: '',
      confirmar_senha: '',
    });
    setEditId(cliente.id);
    setErro('');
    setModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');

    const payload = {
      nome: form.nome.trim(),
      email: form.email.trim(),
      telefone: form.telefone.trim(),
      rua: form.rua.trim(),
      numero: form.numero.trim(),
      bairro: form.bairro.trim(),
      cidade: form.cidade.trim(),
      cep: form.cep.trim(),
      senha: form.senha,
    };

    if (!payload.nome || !payload.email) {
      setErro('Preencha nome e e-mail.');
      return;
    }

    if (!editId && !payload.senha) {
      setErro('Informe uma senha para o cliente.');
      return;
    }

    if (payload.senha && payload.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (payload.senha !== form.confirmar_senha) {
      setErro('As senhas não coincidem.');
      return;
    }

    try {
      if (editId) {
        await api.put(`/clientes/${editId}`, payload);
        setSucesso('Cliente atualizado com sucesso.');
      } else {
        await api.post('/clientes', payload);
        setSucesso('Cliente cadastrado com sucesso.');
      }
      setModal(false);
      carregar();
    } catch (err: any) {
      setErro(err.message);
    }
  }

  async function handleDeletar(id: number) {
    if (!confirm('Excluir cliente? Os pedidos existentes permanecerão sem vínculo de usuário.')) {
      return;
    }
    try {
      await api.delete(`/clientes/${id}`);
      setSucesso('Cliente excluído com sucesso.');
      carregar();
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Gerenciamento de clientes</h1>
        <button className="btn-primary" onClick={abrirNovo}>
          <Plus size={16} /> Cadastrar cliente
        </button>
      </div>

      {sucesso && <div className="alerta alerta-sucesso">{sucesso}</div>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Cadastro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.nome}</td>
                <td>{c.email}</td>
                <td>{c.telefone || '—'}</td>
                <td>{new Date(c.criado_em).toLocaleDateString('pt-BR')}</td>
                <td className="acoes-td">
                  <button className="btn-icon-sm" onClick={() => abrirEditar(c)}>
                    <Pencil size={15} />
                  </button>
                  <button className="btn-icon-sm danger" onClick={() => handleDeletar(c.id)}>
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editId ? 'Editar cliente' : 'Cadastrar cliente'}</h2>
              <button onClick={() => setModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="campo">
                <label>Nome</label>
                <input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  required
                />
              </div>

              <div className="campo">
                <label>E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="campo">
                <label>Telefone</label>
                <input
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                />
              </div>

              <div className="campos-2col">
                <div className="campo">
                  <label>Rua</label>
                  <input
                    value={form.rua}
                    onChange={(e) => setForm({ ...form, rua: e.target.value })}
                  />
                </div>
                <div className="campo">
                  <label>Número</label>
                  <input
                    value={form.numero}
                    onChange={(e) => setForm({ ...form, numero: e.target.value })}
                  />
                </div>
              </div>

              <div className="campos-2col">
                <div className="campo">
                  <label>Bairro</label>
                  <input
                    value={form.bairro}
                    onChange={(e) => setForm({ ...form, bairro: e.target.value })}
                  />
                </div>
                <div className="campo">
                  <label>Cidade</label>
                  <input
                    value={form.cidade}
                    onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                  />
                </div>
              </div>

              <div className="campo">
                <label>CEP</label>
                <input
                  value={form.cep}
                  onChange={(e) => setForm({ ...form, cep: e.target.value })}
                />
              </div>

              <div className="campos-2col">
                <div className="campo">
                  <label>{editId ? 'Nova senha (opcional)' : 'Senha'}</label>
                  <input
                    type="password"
                    value={form.senha}
                    onChange={(e) => setForm({ ...form, senha: e.target.value })}
                    required={!editId}
                  />
                </div>
                <div className="campo">
                  <label>{editId ? 'Confirmar nova senha' : 'Confirmar senha'}</label>
                  <input
                    type="password"
                    value={form.confirmar_senha}
                    onChange={(e) => setForm({ ...form, confirmar_senha: e.target.value })}
                    required={!editId}
                  />
                </div>
              </div>

              {erro && <div className="alerta alerta-erro">{erro}</div>}

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
    </div>
  );
}