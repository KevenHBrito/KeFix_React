export function formatarTelefone(valor: string): string {
  let apenas_numeros = valor.replace(/\D/g, '');
  apenas_numeros = apenas_numeros.substring(0, 11); // Limita a máximo 11 dígitos
  if (apenas_numeros.length === 0) return '';
  if (apenas_numeros.length <= 2) return `(${apenas_numeros}`;
  if (apenas_numeros.length <= 7) return `(${apenas_numeros.slice(0, 2)}) ${apenas_numeros.slice(2)}`;
  return `(${apenas_numeros.slice(0, 2)}) ${apenas_numeros.slice(2, 7)}-${apenas_numeros.slice(7)}`;
}
