// Serviços/controllers portados do backend Express para funções puras no frontend
import type { Cliente, Pedido, Suporte } from "./models";
import { clienteRepo, descontoRepo, pedidoRepo, produtoRepo, suporteRepo } from "./repositories";

// ---------- Cliente ----------
export function criarCliente(input: { nome: string; email: string; endereco?: string; telefone?: string; cpf?: string }): Cliente {
  if (typeof input.nome !== "string" || typeof input.email !== "string") {
    throw new Error("Nome e email devem ser strings.");
  }
  const novo: Cliente = { id: Date.now(), ...input };
  clienteRepo.save(novo);
  return novo;
}

// ---------- Desconto ----------
export interface DescontoResultado {
  valorOriginal: number;
  percentualDesconto: number;
  valorDesconto: number;
  valorFinal: number;
}

export function calcularDesconto(valorOriginal: number, percentualDesconto: number): DescontoResultado {
  if (typeof valorOriginal !== "number" || typeof percentualDesconto !== "number") {
    throw new Error("Valor original e percentual de desconto devem ser números.");
  }
  const valorDesconto = (valorOriginal * percentualDesconto) / 100;
  return { valorOriginal, percentualDesconto, valorDesconto, valorFinal: valorOriginal - valorDesconto };
}

export function aplicarCupom(codigo: string, valorOriginal: number): DescontoResultado & { codigo: string } {
  const cupom = descontoRepo.findAll().find(c => c.codigo_cupom.toUpperCase() === codigo.trim().toUpperCase() && c.ativo === 1);
  if (!cupom) throw new Error("Cupom inválido ou expirado.");
  if (cupom.tipo === "percentual") {
    return { codigo: cupom.codigo_cupom, ...calcularDesconto(valorOriginal, cupom.porcentagem_desconto) };
  }
  const valorDesconto = Math.min(cupom.valor_fixo_desconto, valorOriginal);
  return {
    codigo: cupom.codigo_cupom,
    valorOriginal,
    percentualDesconto: 0,
    valorDesconto,
    valorFinal: valorOriginal - valorDesconto,
  };
}

// ---------- Frete ----------
export function calcularFrete(distancia: number, valorPorKm = 2.5): { valorFrete: number; distancia: number } {
  if (typeof distancia !== "number" || distancia <= 0) {
    throw new Error("Distância deve ser um número positivo.");
  }
  return { valorFrete: +(distancia * valorPorKm).toFixed(2), distancia };
}

// Estima distância (km) a partir do CEP — heurística simples baseada no prefixo
export function estimarDistanciaPorCep(cep: string): number {
  const digits = cep.replace(/\D/g, "");
  if (digits.length < 5) throw new Error("CEP inválido.");
  const prefixo = parseInt(digits.slice(0, 5), 10);
  const origem = 1310; // origem fictícia em SP
  const diff = Math.abs(prefixo - origem);
  return Math.max(2, Math.min(1500, Math.round(diff / 50)));
}

// ---------- Produto ----------
export function listarProdutos() { return produtoRepo.findAll(); }
export function buscarProdutoPorId(id: number) { return produtoRepo.findById(id); }

// ---------- Pedido ----------
export interface NovoPedidoInput {
  cliente_id: number;
  produto_id: number;
  quantidade: number;
  endereco_entrega: string;
  distancia_calculada: number;
  cupom?: string;
  metodo_pagamento: string;
}

export function criarPedido(input: NovoPedidoInput): Pedido {
  const produto = produtoRepo.findById(input.produto_id);
  if (!produto) throw new Error("Produto não encontrado.");
  if (input.quantidade <= 0) throw new Error("Quantidade inválida.");

  const valor_unitario = produto.preco_base;
  const valor_total = +(valor_unitario * input.quantidade).toFixed(2);
  const { valorFrete } = calcularFrete(input.distancia_calculada);

  let valor_desconto = 0;
  let desconto_id = 0;
  if (input.cupom) {
    const r = aplicarCupom(input.cupom, valor_total);
    valor_desconto = r.valorDesconto;
    desconto_id = descontoRepo.findAll().find(c => c.codigo_cupom === r.codigo)?.id ?? 0;
  }

  const total_final = +(valor_total + valorFrete - valor_desconto).toFixed(2);
  const agora = new Date().toISOString();

  const pedido: Pedido = {
    id: Date.now(),
    cliente_id: input.cliente_id,
    produto_id: input.produto_id,
    quantidade: input.quantidade,
    valor_unitario,
    valor_total,
    status: "criado",
    data_criacao: agora,
    data_atualizacao: agora,
    desconto_id,
    data_venda: agora,
    endereco_entrega: input.endereco_entrega,
    distancia_calculada: input.distancia_calculada,
    valor_frete: valorFrete,
    valor_desconto,
    total_final,
    metodo_pagamento: input.metodo_pagamento,
  };
  pedidoRepo.save(pedido);
  return pedido;
}

export function obterPedidos() { return pedidoRepo.findAll(); }
