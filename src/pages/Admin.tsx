import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, RefreshCw } from "lucide-react";
import {
  aplicarCupom,
  atualizarStatusSuporte,
  buscarProdutoPorId,
  calcularDesconto,
  calcularFrete,
  criarCliente,
  criarPedido,
  criarSuporte,
  estimarDistanciaPorCep,
  listarProdutos,
  listarSuportes,
  obterPedidos,
} from "@/lib/api/services";
import { produtoRepo, clienteRepo } from "@/lib/api/repositories";
import type { Produto } from "@/lib/api/models";

const Admin = () => {
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-gradient-soft">
        <div className="container flex items-center justify-between py-6">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-smooth">
              <ArrowLeft className="w-4 h-4" /> Voltar à loja
            </Link>
            <h1 className="font-display text-3xl mt-2">Painel Administrativo</h1>
            <p className="text-sm text-muted-foreground font-light">Acesso a todas as operações da API</p>
          </div>
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="w-4 h-4 mr-2" /> Atualizar
          </Button>
        </div>
      </header>

      <main className="container py-10">
        <Tabs defaultValue="clientes" className="w-full">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
            <TabsTrigger value="descontos">Descontos</TabsTrigger>
            <TabsTrigger value="frete">Frete</TabsTrigger>
            <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
            <TabsTrigger value="suporte">Suporte</TabsTrigger>
          </TabsList>

          <TabsContent value="clientes"><ClientesPanel key={`c${tick}`} onChange={refresh} /></TabsContent>
          <TabsContent value="produtos"><ProdutosPanel key={`p${tick}`} onChange={refresh} /></TabsContent>
          <TabsContent value="descontos"><DescontosPanel /></TabsContent>
          <TabsContent value="frete"><FretePanel /></TabsContent>
          <TabsContent value="pedidos"><PedidosPanel key={`pd${tick}`} onChange={refresh} /></TabsContent>
          <TabsContent value="suporte"><SuportePanel key={`s${tick}`} onChange={refresh} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

// ---------- Clientes ----------
const ClientesPanel = ({ onChange }: { onChange: () => void }) => {
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", endereco: "", cpf: "" });
  const clientes = clienteRepo.findAll();
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const c = criarCliente(form);
      toast.success(`Cliente #${c.id} criado`);
      setForm({ nome: "", email: "", telefone: "", endereco: "", cpf: "" });
      onChange();
    } catch (err: any) { toast.error(err.message); }
  };
  return (
    <div className="grid md:grid-cols-2 gap-6 mt-6">
      <Card>
        <CardHeader><CardTitle>POST /clientes</CardTitle><CardDescription>Criar novo cliente</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div><Label>Nome *</Label><Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required /></div>
            <div><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
            <div><Label>Telefone</Label><Input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} /></div>
            <div><Label>Endereço</Label><Input value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} /></div>
            <div><Label>CPF</Label><Input value={form.cpf} onChange={e => setForm({ ...form, cpf: e.target.value })} /></div>
            <Button type="submit" className="w-full"><Plus className="w-4 h-4 mr-2" /> Criar Cliente</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Clientes cadastrados ({clientes.length})</CardTitle></CardHeader>
        <CardContent>
          {clientes.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum cliente.</p> : (
            <Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Nome</TableHead><TableHead>Email</TableHead></TableRow></TableHeader>
              <TableBody>{clientes.map(c => <TableRow key={c.id}><TableCell className="text-xs">{c.id}</TableCell><TableCell>{c.nome}</TableCell><TableCell className="text-xs">{c.email}</TableCell></TableRow>)}</TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ---------- Produtos ----------
const ProdutosPanel = ({ onChange }: { onChange: () => void }) => {
  const [form, setForm] = useState<Partial<Produto>>({ nome: "", descricao: "", volume: "", preco_base: 0, beneficios: "", modo_uso: "", indicacao: "", estoque: 0 });
  const [buscaId, setBuscaId] = useState("");
  const [encontrado, setEncontrado] = useState<Produto | null>(null);
  const produtos = listarProdutos();

  const adicionar = (e: React.FormEvent) => {
    e.preventDefault();
    const novo: Produto = { id: Date.now(), nome: form.nome!, descricao: form.descricao!, volume: form.volume || "", preco_base: Number(form.preco_base), beneficios: form.beneficios || "", modo_uso: form.modo_uso || "", indicacao: form.indicacao || "", estoque: Number(form.estoque) };
    produtoRepo.save(novo);
    toast.success(`Produto #${novo.id} adicionado`);
    setForm({ nome: "", descricao: "", volume: "", preco_base: 0, beneficios: "", modo_uso: "", indicacao: "", estoque: 0 });
    onChange();
  };
  const remover = (id: number) => { produtoRepo.remove(id); toast.success("Produto removido"); onChange(); };
  const buscar = () => { const p = buscarProdutoPorId(Number(buscaId)); setEncontrado(p ?? null); if (!p) toast.error("Não encontrado"); };

  return (
    <div className="grid lg:grid-cols-2 gap-6 mt-6">
      <Card>
        <CardHeader><CardTitle>POST /produtos</CardTitle><CardDescription>Adicionar produto</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={adicionar} className="space-y-3">
            <div><Label>Nome *</Label><Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required /></div>
            <div><Label>Descrição</Label><Textarea value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label>Volume</Label><Input value={form.volume} onChange={e => setForm({ ...form, volume: e.target.value })} /></div>
              <div><Label>Preço *</Label><Input type="number" step="0.01" value={form.preco_base} onChange={e => setForm({ ...form, preco_base: Number(e.target.value) })} required /></div>
              <div><Label>Estoque</Label><Input type="number" value={form.estoque} onChange={e => setForm({ ...form, estoque: Number(e.target.value) })} /></div>
            </div>
            <div><Label>Benefícios</Label><Input value={form.beneficios} onChange={e => setForm({ ...form, beneficios: e.target.value })} /></div>
            <div><Label>Modo de uso</Label><Input value={form.modo_uso} onChange={e => setForm({ ...form, modo_uso: e.target.value })} /></div>
            <div><Label>Indicação</Label><Input value={form.indicacao} onChange={e => setForm({ ...form, indicacao: e.target.value })} /></div>
            <Button type="submit" className="w-full"><Plus className="w-4 h-4 mr-2" /> Adicionar</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>GET /produtos/:id</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2"><Input placeholder="ID do produto" value={buscaId} onChange={e => setBuscaId(e.target.value)} /><Button onClick={buscar} variant="outline">Buscar</Button></div>
            {encontrado && <pre className="text-xs bg-muted p-3 rounded overflow-auto">{JSON.stringify(encontrado, null, 2)}</pre>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>GET /produtos ({produtos.length})</CardTitle></CardHeader>
          <CardContent>
            <Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Nome</TableHead><TableHead>Preço</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>{produtos.map(p => <TableRow key={p.id}><TableCell className="text-xs">{p.id}</TableCell><TableCell>{p.nome}</TableCell><TableCell>R$ {p.preco_base.toFixed(2)}</TableCell><TableCell><Button size="icon" variant="ghost" onClick={() => remover(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell></TableRow>)}</TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ---------- Descontos ----------
const DescontosPanel = () => {
  const [valor, setValor] = useState(100);
  const [perc, setPerc] = useState(10);
  const [cupom, setCupom] = useState("LAVANDA10");
  const [valor2, setValor2] = useState(100);
  const [r1, setR1] = useState<any>(null);
  const [r2, setR2] = useState<any>(null);
  return (
    <div className="grid md:grid-cols-2 gap-6 mt-6">
      <Card>
        <CardHeader><CardTitle>POST /descontos/calcular</CardTitle><CardDescription>Por percentual</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Valor original</Label><Input type="number" value={valor} onChange={e => setValor(+e.target.value)} /></div>
          <div><Label>Percentual (%)</Label><Input type="number" value={perc} onChange={e => setPerc(+e.target.value)} /></div>
          <Button className="w-full" onClick={() => { try { setR1(calcularDesconto(valor, perc)); } catch (e: any) { toast.error(e.message); } }}>Calcular</Button>
          {r1 && <pre className="text-xs bg-muted p-3 rounded">{JSON.stringify(r1, null, 2)}</pre>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>POST /descontos/cupom</CardTitle><CardDescription>Cupons: LAVANDA10, BEMVINDO5</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Código</Label><Input value={cupom} onChange={e => setCupom(e.target.value)} /></div>
          <div><Label>Valor</Label><Input type="number" value={valor2} onChange={e => setValor2(+e.target.value)} /></div>
          <Button className="w-full" onClick={() => { try { setR2(aplicarCupom(cupom, valor2)); } catch (e: any) { toast.error(e.message); } }}>Aplicar</Button>
          {r2 && <pre className="text-xs bg-muted p-3 rounded">{JSON.stringify(r2, null, 2)}</pre>}
        </CardContent>
      </Card>
    </div>
  );
};

// ---------- Frete ----------
const FretePanel = () => {
  const [dist, setDist] = useState(10);
  const [cep, setCep] = useState("01310-000");
  const [r1, setR1] = useState<any>(null);
  const [r2, setR2] = useState<any>(null);
  return (
    <div className="grid md:grid-cols-2 gap-6 mt-6">
      <Card>
        <CardHeader><CardTitle>POST /frete/calcular</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Distância (km)</Label><Input type="number" value={dist} onChange={e => setDist(+e.target.value)} /></div>
          <Button className="w-full" onClick={() => { try { setR1(calcularFrete(dist)); } catch (e: any) { toast.error(e.message); } }}>Calcular Frete</Button>
          {r1 && <pre className="text-xs bg-muted p-3 rounded">{JSON.stringify(r1, null, 2)}</pre>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Estimar distância por CEP</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>CEP</Label><Input value={cep} onChange={e => setCep(e.target.value)} /></div>
          <Button className="w-full" onClick={() => { try { const d = estimarDistanciaPorCep(cep); setR2({ cep, distancia: d, ...calcularFrete(d) }); } catch (e: any) { toast.error(e.message); } }}>Estimar</Button>
          {r2 && <pre className="text-xs bg-muted p-3 rounded">{JSON.stringify(r2, null, 2)}</pre>}
        </CardContent>
      </Card>
    </div>
  );
};

// ---------- Pedidos ----------
const PedidosPanel = ({ onChange }: { onChange: () => void }) => {
  const pedidos = obterPedidos();
  const produtos = listarProdutos();
  const clientes = clienteRepo.findAll();
  const [f, setF] = useState({ cliente_id: 0, produto_id: produtos[0]?.id ?? 1, quantidade: 1, endereco_entrega: "", distancia_calculada: 10, cupom: "", metodo_pagamento: "Pix" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const p = criarPedido({ ...f, cupom: f.cupom || undefined });
      toast.success(`Pedido #${p.id} criado — Total R$ ${p.total_final.toFixed(2)}`);
      onChange();
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 mt-6">
      <Card>
        <CardHeader><CardTitle>POST /pedidos</CardTitle><CardDescription>Criar novo pedido</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div><Label>Cliente ID</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3" value={f.cliente_id} onChange={e => setF({ ...f, cliente_id: +e.target.value })}>
                <option value={0}>-- selecione --</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome} (#{c.id})</option>)}
              </select>
            </div>
            <div><Label>Produto</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3" value={f.produto_id} onChange={e => setF({ ...f, produto_id: +e.target.value })}>
                {produtos.map(p => <option key={p.id} value={p.id}>{p.nome} — R$ {p.preco_base}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Quantidade</Label><Input type="number" min={1} value={f.quantidade} onChange={e => setF({ ...f, quantidade: +e.target.value })} /></div>
              <div><Label>Distância (km)</Label><Input type="number" value={f.distancia_calculada} onChange={e => setF({ ...f, distancia_calculada: +e.target.value })} /></div>
            </div>
            <div><Label>Endereço entrega</Label><Input value={f.endereco_entrega} onChange={e => setF({ ...f, endereco_entrega: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Cupom</Label><Input value={f.cupom} onChange={e => setF({ ...f, cupom: e.target.value })} /></div>
              <div><Label>Pagamento</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3" value={f.metodo_pagamento} onChange={e => setF({ ...f, metodo_pagamento: e.target.value })}>
                  <option>Pix</option><option>Crédito</option><option>Débito</option>
                </select>
              </div>
            </div>
            <Button type="submit" className="w-full">Criar Pedido</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>GET /pedidos ({pedidos.length})</CardTitle></CardHeader>
        <CardContent>
          {pedidos.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum pedido.</p> : (
            <div className="space-y-2 max-h-[500px] overflow-auto">
              {pedidos.map(p => (
                <div key={p.id} className="border rounded p-3 text-xs">
                  <div className="flex justify-between"><strong>#{p.id}</strong><Badge>{p.status}</Badge></div>
                  <div>Produto: {p.produto_id} · Qtd: {p.quantidade}</div>
                  <div>Subtotal: R$ {p.valor_total.toFixed(2)} · Frete: R$ {p.valor_frete.toFixed(2)} · Desc: R$ {p.valor_desconto.toFixed(2)}</div>
                  <div className="font-semibold">Total: R$ {p.total_final.toFixed(2)} ({p.metodo_pagamento})</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ---------- Suporte ----------
const SuportePanel = ({ onChange }: { onChange: () => void }) => {
  const [f, setF] = useState({ cliente_id: 0, assunto: "", mensagem: "" });
  const suportes = listarSuportes();
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    try { criarSuporte(f); toast.success("Chamado criado"); setF({ cliente_id: 0, assunto: "", mensagem: "" }); onChange(); }
    catch (err: any) { toast.error(err.message); }
  };
  const toggle = (id: number, atual: "Aberto" | "Fechado") => {
    atualizarStatusSuporte(id, atual === "Aberto" ? "Fechado" : "Aberto");
    toast.success("Status atualizado"); onChange();
  };
  return (
    <div className="grid lg:grid-cols-2 gap-6 mt-6">
      <Card>
        <CardHeader><CardTitle>POST /suporte</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div><Label>Cliente ID *</Label><Input type="number" value={f.cliente_id} onChange={e => setF({ ...f, cliente_id: +e.target.value })} required /></div>
            <div><Label>Assunto *</Label><Input value={f.assunto} onChange={e => setF({ ...f, assunto: e.target.value })} required /></div>
            <div><Label>Mensagem *</Label><Textarea rows={4} value={f.mensagem} onChange={e => setF({ ...f, mensagem: e.target.value })} required /></div>
            <Button type="submit" className="w-full">Abrir Chamado</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>GET /suporte ({suportes.length})</CardTitle></CardHeader>
        <CardContent>
          {suportes.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum chamado.</p> : (
            <div className="space-y-2 max-h-[500px] overflow-auto">
              {suportes.map(s => (
                <div key={s.id} className="border rounded p-3 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <strong>{s.assunto}</strong>
                    <Badge variant={s.status === "Aberto" ? "default" : "secondary"} className="cursor-pointer" onClick={() => toggle(s.id, s.status)}>{s.status}</Badge>
                  </div>
                  <div className="text-muted-foreground">Cliente #{s.cliente_id} · {new Date(s.data_criacao).toLocaleString()}</div>
                  <div className="mt-1">{s.mensagem}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
