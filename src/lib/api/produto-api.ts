import type { Produto } from './models';

const BASE = '/api';

export async function fetchProdutos(): Promise<Produto[]> {
  const res = await fetch(`${BASE}/produtos`);
  if (!res.ok) throw new Error('Erro ao buscar produtos');
  return res.json();
}

export async function fetchProdutoPorId(id: number): Promise<Produto> {
  const res = await fetch(`${BASE}/produtos/${id}`);
  if (!res.ok) throw new Error('Produto não encontrado');
  return res.json();
}
