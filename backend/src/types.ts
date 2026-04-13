// Dados essenciais do usuario mantidos na sessao autenticada.
export type SessionUser = {
  id: number;
  nome: string;
  email: string;
  tipo: "cliente" | "admin";
  // Campos opcionais de contato/endereco para checkout e perfil.
  telefone?: string | null;
  rua?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  cep?: string | null;
};
