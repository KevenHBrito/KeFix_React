export type SessionUser = {
  id: number;
  nome: string;
  email: string;
  tipo: "cliente" | "admin";
};
