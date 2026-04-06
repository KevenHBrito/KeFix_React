export type SessionUser = {
  id: number;
  nome: string;
  email: string;
  tipo: "cliente" | "admin";
  telefone?: string | null;
  rua?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  cep?: string | null;
};
