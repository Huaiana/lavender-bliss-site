// Modelos portados do backend (api_projeto-integrador-gp12)
export interface Cliente {
  id: number;
  nome: string;
  email: string;
  senha?: string;
  data_nascimento?: string;
  endereco?: string;
  telefone?: string;
  cpf?: string;
}

export interface Desconto {
  id: number;
  codigo_cupom: string;
  tipo: "percentual" | "fixo";
  porcentagem_desconto: number;
  valor_fixo_desconto: number;
  data_validade: string;
  ativo: number;
}

export interface Frete {
  id: number;
  endereco_origem: string;
  endereco_destino: string;
  valor_por_km: number;
  distancia_maxima: number;
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

export interface Pedido {
  id: number;
  cliente_id: number;
  produto_id: number;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  status: string;
  data_criacao: string;
  data_atualizacao: string;
  desconto_id: number;
  data_venda: string;
  endereco_entrega: string;
  distancia_calculada: number;
  valor_frete: number;
  valor_desconto: number;
  total_final: number;
  metodo_pagamento: string;
}

export interface Suporte {
  id: number;
  cliente_id: number;
  assunto: string;
  mensagem: string;
  data_criacao: string;
  status: "Aberto" | "Fechado";
}
