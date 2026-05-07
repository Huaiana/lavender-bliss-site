// Serviços/controllers portados do backend Express para funções puras no frontend
import type { Cliente, Pedido, Suporte } from "./models";
import { clienteRepo, descontoRepo, pedidoRepo, produtoRepo, suporteRepo } from "./repositories";

// ---------- Cliente ----------
export function criarCliente(input: {
  nome: string;
  email: string;
  endereco?: string;
  telefone?: string;
}): Cliente {
  if (typeof input.nome !== "string" || typeof input.email !== "string") {
    throw new Error("Nome e email devem ser strings.");
  }
  const novo: Cliente = {
    id: Date.now(),
    nome: input.nome,
    email: input.email,
    endereco: input.endereco ?? "",
    telefone: input.telefone,
  };
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
  const cupom = descontoRepo
    .findAll()
    .find((c) => c.codigo_cupom.toUpperCase() === codigo.trim().toUpperCase() && c.ativo === 1);
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
// Atualizado conforme backend: R$ 0,20 por km
export function calcularFrete(distancia: number, valorPorKm = 0.2): { valorFrete: number; distancia: number } {
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
  // Origem: Avenida Ademar de Barros, 576 - Guarujá/SP (CEP 11430-005)
  const origem = 11420;
  const diff = Math.abs(prefixo - origem);
  return Math.max(2, Math.min(1500, Math.round(diff / 50)));
}

// ---------- Produto ----------
export function listarProdutos() {
  return produtoRepo.findAll();
}
export function buscarProdutoPorId(id: number) {
  return produtoRepo.findById(id);
}

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
    desconto_id = descontoRepo.findAll().find((c) => c.codigo_cupom === r.codigo)?.id ?? 0;
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

export function obterPedidos() {
  return pedidoRepo.findAll();
}

// ---------- Suporte ----------
export interface NovoSuporteInput {
  cliente_id: number;
  assunto: string;
  mensagem: string;
}

export function criarSuporte(input: NovoSuporteInput): Suporte {
  if (typeof input.cliente_id !== "number" || typeof input.assunto !== "string" || typeof input.mensagem !== "string") {
    throw new Error("Cliente ID deve ser um número, assunto e mensagem devem ser strings.");
  }
  if (!input.assunto.trim() || !input.mensagem.trim()) {
    throw new Error("Assunto e mensagem são obrigatórios.");
  }
  const novo: Suporte = {
    id: Date.now(),
    cliente_id: input.cliente_id,
    assunto: input.assunto.trim(),
    mensagem: input.mensagem.trim(),
    data_criacao: new Date().toISOString(),
    status: "Aberto",
  };
  suporteRepo.save(novo);
  return novo;
}

export function listarSuportes(): Suporte[] {
  return suporteRepo.findAll();
}

export function atualizarStatusSuporte(id: number, status: "Aberto" | "Fechado"): boolean {
  return suporteRepo.updateStatus(id, status);
}
