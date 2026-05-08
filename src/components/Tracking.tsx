import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Truck, CheckCircle2, Clock } from "lucide-react";
import { obterPedidos } from "@/lib/api/services";
import type { Pedido } from "@/lib/api/models";
import { getSessao } from "@/components/Auth";

type StatusEntrega = "EM ROTA" | "A CAMINHO" | "ENTREGUE";

function statusEntrega(p: Pedido): StatusEntrega {
  if (p.status_compra === "CONCLUIDO") return "ENTREGUE";
  // alterna heurístico baseado no id
  return p.id % 2 === 0 ? "A CAMINHO" : "EM ROTA";
}

function previsao(p: Pedido): string {
  const base = new Date(p.data_venda || p.data_criacao);
  const dias = 1 + (p.id % 3); // 1-3 dias úteis
  base.setDate(base.getDate() + dias);
  return base.toLocaleDateString("pt-BR");
}

const Tracking = () => {
  const [pedidoId, setPedidoId] = useState("");
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const sessao = getSessao();

  useEffect(() => {
    if (!sessao) return;
    setPedidos(obterPedidos().filter((p) => p.cliente_id === sessao.id));
  }, [sessao]);

  if (!sessao) {
    return (
      <section className="container py-20 max-w-2xl text-center">
        <div className="text-xs tracking-widest uppercase text-primary mb-3">Acompanhamento</div>
        <h2 className="font-display text-5xl mb-4">Rastrear <span className="italic text-primary">entrega</span></h2>
        <p className="text-muted-foreground">Faça login na sua conta para visualizar seus pedidos.</p>
      </section>
    );
  }

  const filtrados = pedidoId.trim()
    ? pedidos.filter((p) => String(p.id).includes(pedidoId.trim()))
    : pedidos;

  return (
    <section className="container py-20 max-w-4xl">
      <div className="text-center mb-10 animate-fade-up">
        <div className="text-xs tracking-widest uppercase text-primary mb-3">Acompanhamento</div>
        <h2 className="font-display text-5xl md:text-6xl">Rastrear <span className="italic text-primary">entrega</span></h2>
        <p className="text-muted-foreground mt-3 font-light">Previsão de entrega: 1 a 3 dias úteis.</p>
      </div>

      <div className="p-6 rounded-3xl bg-card border border-border/50 shadow-soft mb-8 flex gap-3 items-end">
        <div className="flex-1 space-y-2">
          <Label className="text-xs tracking-wider uppercase text-muted-foreground">Número do pedido</Label>
          <Input value={pedidoId} onChange={(e) => setPedidoId(e.target.value)} placeholder="Digite o ID ou deixe vazio para ver todos" className="rounded-xl h-12 bg-background" />
        </div>
        <Button onClick={() => setPedidos(obterPedidos())} variant="outline" className="rounded-full h-12">Atualizar</Button>
      </div>

      {filtrados.length === 0 ? (
        <div className="p-12 rounded-3xl bg-card border border-border/50 text-center text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 text-primary/60" />
          Nenhum pedido encontrado. Faça uma compra para acompanhar aqui.
        </div>
      ) : (
        <div className="space-y-4">
          {filtrados.map((p) => {
            const s = statusEntrega(p);
            const Icon = s === "ENTREGUE" ? CheckCircle2 : s === "A CAMINHO" ? Truck : Clock;
            return (
              <div key={p.id} className="p-6 rounded-3xl bg-card border border-border/50 shadow-soft">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-xs tracking-widest uppercase text-muted-foreground">Pedido</div>
                    <div className="font-display text-2xl">#{p.id}</div>
                    <div className="text-sm text-muted-foreground mt-1">{p.endereco_entrega}</div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 border border-border/50 text-xs tracking-widest uppercase">
                      <Icon className="w-3.5 h-3.5 text-primary" /> {s}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">Previsão: {previsao(p)}</div>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2">
                  {(["EM ROTA", "A CAMINHO", "ENTREGUE"] as StatusEntrega[]).map((etapa, idx) => {
                    const ativo = ["EM ROTA", "A CAMINHO", "ENTREGUE"].indexOf(s) >= idx;
                    return (
                      <div key={etapa} className="flex-1">
                        <div className={`h-2 rounded-full transition-smooth ${ativo ? "bg-primary" : "bg-secondary"}`} />
                        <div className={`text-[10px] tracking-widest uppercase mt-2 text-center ${ativo ? "text-primary" : "text-muted-foreground"}`}>{etapa}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 text-sm text-muted-foreground flex justify-between border-t border-border/50 pt-4">
                  <span>Total: <span className="text-foreground font-medium">R$ {p.total_final.toFixed(2)}</span></span>
                  <span>Pagamento: {p.metodo_pagamento.toUpperCase()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Tracking;
