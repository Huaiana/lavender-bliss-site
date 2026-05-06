import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { obterPedidos, listarSuportes } from "@/lib/api/services";
import { produtoRepo, clienteRepo, descontoRepo, freteRepo } from "@/lib/api/repositories";
import type { Pedido } from "@/lib/api/models";
import { toast } from "sonner";
import { Lock, LogOut, BarChart3, Package, ArrowLeft, Database } from "lucide-react";

const ADMIN_PASSWORD = "adminlavanda";
const SESSION_KEY = "lavanda_admin_session";

const Admin = () => {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") setAuthed(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setAuthed(true);
      toast.success("Acesso concedido");
    } else {
      toast.error("Senha incorreta");
      setPassword("");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
    setPassword("");
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="w-full max-w-md p-8 rounded-3xl bg-card border border-border/50 shadow-elegant space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-purple shadow-glow flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl">Área restrita</h1>
            <p className="text-sm text-muted-foreground font-light">Acesso exclusivo a funcionários</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pwd" className="text-xs tracking-wider uppercase text-muted-foreground">Senha</Label>
            <Input
              id="pwd"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha"
              autoFocus
              className="rounded-xl h-12 bg-background"
            />
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary-deep rounded-full h-12">Entrar</Button>
          <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-primary transition-smooth">
            ← Voltar ao site
          </Link>
        </form>
      </div>
    );
  }

  return <AdminPanel onLogout={handleLogout} />;
};

const AdminPanel = ({ onLogout }: { onLogout: () => void }) => {
  const [pedidos, setPedidos] = useState<Pedido[]>(obterPedidos());

  const refresh = () => setPedidos(obterPedidos());

  const produtoNome = (id: number) => produtoRepo.findById(id)?.nome ?? `#${id}`;
  const cliente = (id: number) => clienteRepo.findAll().find((c) => c.id === id);
  const clienteNome = (id: number) => cliente(id)?.nome ?? `Cliente #${id}`;

  const stats = useMemo(() => {
    const total = pedidos.length;
    const receita = pedidos.reduce((s, p) => s + p.total_final, 0);
    const unidades = pedidos.reduce((s, p) => s + p.quantidade, 0);
    const ticket = total > 0 ? receita / total : 0;
    const totalDescontos = pedidos.reduce((s, p) => s + p.valor_desconto, 0);
    const totalFrete = pedidos.reduce((s, p) => s + p.valor_frete, 0);

    const porPagamento = pedidos.reduce<Record<string, { count: number; total: number }>>((acc, p) => {
      const k = (p.metodo_pagamento || "—").toUpperCase();
      acc[k] ??= { count: 0, total: 0 };
      acc[k].count++;
      acc[k].total += p.total_final;
      return acc;
    }, {});

    const porProduto = pedidos.reduce<Record<string, { qtd: number; receita: number }>>((acc, p) => {
      const k = produtoNome(p.produto_id);
      acc[k] ??= { qtd: 0, receita: 0 };
      acc[k].qtd += p.quantidade;
      acc[k].receita += p.total_final;
      return acc;
    }, {});

    const porCliente = pedidos.reduce<Record<number, { nome: string; email: string; pedidos: number; unidades: number; receita: number }>>((acc, p) => {
      const c = cliente(p.cliente_id);
      acc[p.cliente_id] ??= {
        nome: c?.nome ?? `Cliente #${p.cliente_id}`,
        email: c?.email ?? "—",
        pedidos: 0, unidades: 0, receita: 0,
      };
      acc[p.cliente_id].pedidos++;
      acc[p.cliente_id].unidades += p.quantidade;
      acc[p.cliente_id].receita += p.total_final;
      return acc;
    }, {});

    return { total, receita, unidades, ticket, totalDescontos, totalFrete, porPagamento, porProduto, porCliente };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidos]);

  const fmt = (v: number) => `R$ ${v.toFixed(2)}`;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 backdrop-blur-md bg-background/70 sticky top-0 z-40">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-smooth inline-flex items-center gap-1 text-sm">
              <ArrowLeft className="w-4 h-4" /> Site
            </Link>
            <span className="text-border">|</span>
            <h1 className="font-display text-2xl">Painel administrativo</h1>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout} className="rounded-full">
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </div>
      </header>

      <main className="container py-10">
        <Tabs defaultValue="relatorios" className="space-y-6">
          <TabsList>
            <TabsTrigger value="relatorios"><BarChart3 className="w-4 h-4 mr-2" /> Relatórios de vendas</TabsTrigger>
            <TabsTrigger value="pedidos" onClick={refresh}><Package className="w-4 h-4 mr-2" /> Pedidos</TabsTrigger>
            <TabsTrigger value="db"><Database className="w-4 h-4 mr-2" /> Banco de dados</TabsTrigger>
          </TabsList>

          <TabsContent value="relatorios" className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Pedidos" value={String(stats.total)} />
              <StatCard label="Receita total" value={fmt(stats.receita)} highlight />
              <StatCard label="Unidades vendidas" value={String(stats.unidades)} />
              <StatCard label="Ticket médio" value={fmt(stats.ticket)} />
              <StatCard label="Total em descontos" value={fmt(stats.totalDescontos)} />
              <StatCard label="Total em frete" value={fmt(stats.totalFrete)} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-card border border-border/50">
                <h3 className="font-display text-xl mb-4">Por forma de pagamento</h3>
                {Object.keys(stats.porPagamento).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sem vendas ainda.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Método</TableHead>
                        <TableHead className="text-right">Pedidos</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(stats.porPagamento).map(([m, v]) => (
                        <TableRow key={m}>
                          <TableCell>{m}</TableCell>
                          <TableCell className="text-right">{v.count}</TableCell>
                          <TableCell className="text-right">{fmt(v.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border/50">
                <h3 className="font-display text-xl mb-4">Por produto</h3>
                {Object.keys(stats.porProduto).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sem vendas ainda.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-right">Unid.</TableHead>
                        <TableHead className="text-right">Receita</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(stats.porProduto).map(([n, v]) => (
                        <TableRow key={n}>
                          <TableCell>{n}</TableCell>
                          <TableCell className="text-right">{v.qtd}</TableCell>
                          <TableCell className="text-right">{fmt(v.receita)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>

            <Button variant="outline" onClick={refresh} className="rounded-full">Atualizar dados</Button>
          </TabsContent>

          <TabsContent value="pedidos">
            <div className="p-6 rounded-2xl bg-card border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl">Todos os pedidos</h3>
                <Button variant="outline" size="sm" onClick={refresh} className="rounded-full">Atualizar</Button>
              </div>
              {pedidos.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum pedido registrado ainda.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Frete</TableHead>
                      <TableHead className="text-right">Desc.</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Pagto</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pedidos.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs">{p.id}</TableCell>
                        <TableCell className="text-xs">{new Date(p.data_criacao).toLocaleString("pt-BR")}</TableCell>
                        <TableCell className="text-xs">{p.cliente_id}</TableCell>
                        <TableCell>{produtoNome(p.produto_id)}</TableCell>
                        <TableCell className="text-right">{p.quantidade}</TableCell>
                        <TableCell className="text-right">{fmt(p.valor_frete)}</TableCell>
                        <TableCell className="text-right">{fmt(p.valor_desconto)}</TableCell>
                        <TableCell className="text-right font-medium">{fmt(p.total_final)}</TableCell>
                        <TableCell className="uppercase text-xs">{p.metodo_pagamento}</TableCell>
                        <TableCell className="text-xs">{p.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          <TabsContent value="db" className="space-y-8">
            <DbSection title="cliente" rows={clienteRepo.findAll()} />
            <DbSection title="produto" rows={produtoRepo.findAll()} />
            <DbSection title="desconto" rows={descontoRepo.findAll()} />
            <DbSection title="frete" rows={freteRepo.findAll()} />
            <DbSection title="pedido" rows={obterPedidos()} />
            <DbSection title="suporte" rows={listarSuportes()} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const StatCard = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div className={`p-6 rounded-2xl border ${highlight ? "bg-gradient-purple text-primary-foreground border-transparent shadow-glow" : "bg-card border-border/50"}`}>
    <div className={`text-xs tracking-wider uppercase ${highlight ? "opacity-80" : "text-muted-foreground"}`}>{label}</div>
    <div className="font-display text-3xl mt-2">{value}</div>
  </div>
);

const DbSection = ({ title, rows }: { title: string; rows: readonly object[] }) => {
  const data = rows as unknown as Record<string, unknown>[];
  const cols = data.length > 0 ? Object.keys(data[0]) : [];
  return (
    <div className="p-6 rounded-2xl bg-card border border-border/50">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="font-display text-xl">
          <span className="text-primary">{title}</span>
          <span className="text-muted-foreground font-light text-sm ml-3">
            {data.length} {data.length === 1 ? "registro" : "registros"}
          </span>
        </h3>
      </div>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">Tabela vazia.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {cols.map((c) => <TableHead key={c} className="whitespace-nowrap">{c}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((r, i) => (
                <TableRow key={i}>
                  {cols.map((c) => {
                    const v = r[c];
                    const display = v === null || v === undefined
                      ? "—"
                      : typeof v === "object" ? JSON.stringify(v) : String(v);
                    return (
                      <TableCell key={c} className="text-xs whitespace-nowrap max-w-xs truncate" title={display}>
                        {display}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Admin;
