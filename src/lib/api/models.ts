// Modelos portados do backend (api_projeto-integrador-gp12 — src/SQLite.sql)
export interface Cliente {
  id: number;
  nome: string;
  email: string;
  senha?: string;
  data_nascimento?: string;
  endereco: string;
  telefone?: string;
  cep?: string;
}

export type DescontoTipo = "PORCENTAGEM" | "FIXO";

export interface Desconto {
  id: number;
  codigo_cupom: string;
  tipo: DescontoTipo;
  porcentagem_desconto: number | null;
  valor_fixo_desconto: number | null;
  data_validade: string | null;
  ativo: number;
}

export type FreteStatus = "ATIVO" | "INATIVO";

export interface Frete {
  id: number;
  endereco_origem: string;
  valor_por_km: number;
  distancia_maxima: number;
  status: FreteStatus;
}

export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  volume: string;
  preco_base: number;
  beneficios: string;
  modo_uso: string;
  indicacao: string;
  estoque: number;
}

export type StatusCompra = "PENDENTE" | "CONCLUIDO" | "CANCELADO";

export interface Pedido {
  id: number;
  cliente_id: number;
  produto_id: number;
  // mantidos no front para UX/relatórios (não existem no SQL puro do back)
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  // colunas espelhando o SQL
  desconto_id: number;
  data_venda: string;
  endereco_entrega: string;
  distancia_calculada: number;
  valor_frete: number;
  valor_desconto: number;
  total_final: number;
  metodo_pagamento: string;
  status_compra: StatusCompra;
  // alias de compatibilidade
  data_criacao: string;
  data_atualizacao: string;
  status: StatusCompra;
}

export interface Suporte {
  id: number;
  cliente_id: number;
  assunto: string;
  mensagem: string;
  data_contato: string;
  // mantidos para uso no front (não existem no SQL)
  status: "Aberto" | "Fechado";
  data_criacao: string;
}

export type StatusEntrega = "EM ROTA" | "ENTREGUE" | "ATRASADO";

export interface AcompanhamentoEntrega {
  id: number;
  pedido_id: number;
  status_entrega: StatusEntrega;
  previsao_entrega: string;
  cliente_id: number;
  frete_id: number;
}
