// Repositórios em memória (portados do backend)
import type { Cliente, Desconto, Frete, Pedido, Produto } from "./models";

class Repository<T> {
  protected items: T[] = [];
  save(item: T): void { this.items.push(item); }
  findAll(): T[] { return [...this.items]; }
}

export class ClienteRepository extends Repository<Cliente> {}
export class DescontoRepository extends Repository<Desconto> {}
export class FreteRepository extends Repository<Frete> {}
export class PedidoRepository extends Repository<Pedido> {}

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

// Seed: produto principal e cupons
produtoRepo.save({
  id: 1,
  nome: "Óleo Bifásico de Lavanda",
  descricao: "Esse óleo hidrata a pele, deixando ela macia e cheirosa. Leve, fácil de usar e perfeito pro dia a dia.",
  volume: "60ml",
  preco_base: 49.9,
  beneficios: "Hidrata a pele; Deixa macia; Aroma calmante; Sensação refrescante",
  modo_uso: "Agite antes de usar e aplique na pele espalhando bem.",
  indicacao: "Todos os tipos de pele",
  estoque: 100,
});

descontoRepo.save({
  id: 1, codigo_cupom: "LAVANDA10", tipo: "percentual",
  porcentagem_desconto: 10, valor_fixo_desconto: 0,
  data_validade: "2026-12-31", ativo: 1,
});
descontoRepo.save({
  id: 2, codigo_cupom: "BEMVINDO5", tipo: "fixo",
  porcentagem_desconto: 0, valor_fixo_desconto: 5,
  data_validade: "2026-12-31", ativo: 1,
});
