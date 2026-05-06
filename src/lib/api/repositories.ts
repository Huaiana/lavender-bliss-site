// Repositórios em memória (portados do backend)
import type { Cliente, Desconto, Frete, Pedido, Produto, Suporte } from "./models";

class Repository<T> {
  protected items: T[] = [];
  save(item: T): void { this.items.push(item); }
  findAll(): T[] { return [...this.items]; }
}

export class ClienteRepository extends Repository<Cliente> {}
export class DescontoRepository extends Repository<Desconto> {}
export class FreteRepository extends Repository<Frete> {}
const PEDIDOS_KEY = "lavanda.pedidos";

export class PedidoRepository {
  private items: Pedido[] = [];
  constructor() {
    try {
      const raw = typeof localStorage !== "undefined" ? localStorage.getItem(PEDIDOS_KEY) : null;
      if (raw) this.items = JSON.parse(raw);
    } catch { /* ignore */ }
  }
  private persist() {
    try {
      if (typeof localStorage !== "undefined")
        localStorage.setItem(PEDIDOS_KEY, JSON.stringify(this.items));
    } catch { /* ignore */ }
  }
  save(p: Pedido) {
    // evita duplicar o seed em reloads
    if (!this.items.some(x => x.id === p.id)) this.items.push(p);
    this.persist();
  }
  findAll(): Pedido[] { return [...this.items]; }
}

export class SuporteRepository {
  private suportes: Suporte[] = [];
  save(s: Suporte) { this.suportes.push(s); }
  findAll() { return [...this.suportes]; }
  findById(id: number) { return this.suportes.find(s => s.id === id); }
  updateStatus(id: number, status: "Aberto" | "Fechado") {
    const s = this.findById(id);
    if (s) { s.status = status; return true; }
    return false;
  }
}

export class ProdutoRepository {
  private produtos: Produto[] = [];
  save(p: Produto) { this.produtos.push(p); }
  findAll() { return [...this.produtos]; }
  findById(id: number) { return this.produtos.find(p => p.id === id); }
  update(id: number, p: Produto) {
    const i = this.produtos.findIndex(x => x.id === id);
    if (i !== -1) this.produtos[i] = p;
  }
  remove(id: number) { this.produtos = this.produtos.filter(p => p.id !== id); }
}

// Singletons compartilhados
export const clienteRepo = new ClienteRepository();
export const descontoRepo = new DescontoRepository();
export const freteRepo = new FreteRepository();
export const pedidoRepo = new PedidoRepository();
export const produtoRepo = new ProdutoRepository();
export const suporteRepo = new SuporteRepository();

// ============================================================
// SEED — espelha o SQLite.sql do backend (api_projeto-integrador-gp12)
// ============================================================

// --- Produto ---
produtoRepo.save({
  id: 1,
  nome: "Óleo Bifásico de Lavanda",
  descricao: "Um óleo leve que hidrata, perfuma e deixa sua pele macia com aroma suave de lavanda",
  volume: "120 ml",
  preco_base: 49.9,
  beneficios: "Hidrata; Pele macia; Aroma calmante; Refrescante",
  modo_uso: "Agite antes de usar e aplique na pele",
  indicacao: "Todos os tipos de pele",
  estoque: 99, // 100 - 1 (UPDATE do seed)
});

// --- Frete ---
freteRepo.save({
  id: 1,
  endereco_origem: "Avenida Ademar de Barros, 576",
  endereco_destino: "",
  valor_por_km: 0.2,
  distancia_maxima: 0.5,
});

// --- Descontos / Cupons ---
descontoRepo.save({
  id: 1, codigo_cupom: "PROJETO20", tipo: "percentual",
  porcentagem_desconto: 20, valor_fixo_desconto: 0,
  data_validade: "2026-12-31", ativo: 1,
});
descontoRepo.save({
  id: 2, codigo_cupom: "LAVANDA10", tipo: "percentual",
  porcentagem_desconto: 10, valor_fixo_desconto: 0,
  data_validade: "2026-12-31", ativo: 1,
});
descontoRepo.save({
  id: 3, codigo_cupom: "BEMVINDO5", tipo: "fixo",
  porcentagem_desconto: 0, valor_fixo_desconto: 5,
  data_validade: "2026-12-31", ativo: 1,
});

// --- Clientes ---
const SEED_CLIENTES: Cliente[] = [
  { id: 1, nome: "vitoria", email: "vmelo3578@gmail.com", senha: "vitorialinda123", data_nascimento: "2006-07-17", endereco: "Rua Exemplo, 100", telefone: "13997558495" },
  { id: 2, nome: "Lucas Silva", email: "lucas.silva@outlook.com", senha: "lucas123456", data_nascimento: "1995-03-12", endereco: "Av. Central, 500", telefone: "11988776655" },
  { id: 3, nome: "Mariana Costa", email: "mari.costa22@gmail.com", senha: "maricosta@2024", data_nascimento: "1998-11-25", endereco: "Rua das Flores, 12", telefone: "21977665544" },
  { id: 4, nome: "Felipe Andrade", email: "felipe.andrade@yahoo.com", senha: "senhaforte99", data_nascimento: "2001-05-02", endereco: "Rua B, 250", telefone: "31966554433" },
  { id: 5, nome: "Juliana Lima", email: "ju_lima88@hotmail.com", senha: "july_1234", data_nascimento: "1988-08-15", endereco: "Av. Brasil, 1010", telefone: "41955443322" },
  { id: 6, nome: "Ricardo Santos", email: "ricardo.santos@gmail.com", senha: "ricardo@pass", data_nascimento: "1992-01-30", endereco: "Rua Chile, 55", telefone: "51944332211" },
  { id: 7, nome: "Beatriz Rocha", email: "bia_rocha99@live.com", senha: "bia998877", data_nascimento: "1999-07-07", endereco: "Rua 7 de Setembro, 7", telefone: "61933221100" },
  { id: 8, nome: "Gabriel Souza", email: "gabriel.souza@gmail.com", senha: "gabriel_0102", data_nascimento: "2003-12-10", endereco: "Al. Santos, 80", telefone: "71922110099" },
  { id: 9, nome: "Camila Oliveira", email: "camila.oliveira@me.com", senha: "cami_oliveira", data_nascimento: "1996-04-22", endereco: "Rua das Palmeiras, 99", telefone: "81911009988" },
  { id: 10, nome: "Tiago Mendes", email: "tiago.mendes@gmail.com", senha: "tiago_mendes1", data_nascimento: "1990-09-18", endereco: "Av. Paulista, 1500", telefone: "91900998877" },
];
SEED_CLIENTES.forEach(c => clienteRepo.save(c));

// --- Pedido inicial (do SQL) ---
pedidoRepo.save({
  id: 1,
  cliente_id: 1,
  produto_id: 1,
  quantidade: 1,
  valor_unitario: 49.9,
  valor_total: 49.9,
  status: "criado",
  data_criacao: "2025-10-01T12:00:00.000Z",
  data_atualizacao: "2025-10-01T12:00:00.000Z",
  desconto_id: 1,
  data_venda: "2025-10-01T12:00:00.000Z",
  endereco_entrega: "Rua das Flores, 123",
  distancia_calculada: 0.2,
  valor_frete: 0.04,
  valor_desconto: 9.98,
  total_final: 59.92,
  metodo_pagamento: "PIX",
});
