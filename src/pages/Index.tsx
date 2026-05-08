import { useEffect, useMemo, useState } from "react";
import heroImage from "@/assets/lavender-hero.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Droplet, Sparkles, Leaf, Wind, ShoppingBag, ArrowRight, LifeBuoy, Tag, X } from "lucide-react";
import {
  aplicarCupom,
  calcularFrete,
  criarPedido,
  estimarDistanciaPorCep,
} from "@/lib/api/services";
import { clienteRepo } from "@/lib/api/repositories";
import type { Cliente } from "@/lib/api/models";
import Support from "@/components/Support";
import Auth, { getSessao } from "@/components/Auth";
import Tracking from "@/components/Tracking";

const Index = () => {
  const [section, setSection] = useState<"home" | "product" | "checkout" | "conta" | "rastrear">("home");

  const go = (s: typeof section) => {
    setSection(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/50">
        <div className="container flex items-center justify-between py-5">
          <button onClick={() => go("home")} className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full bg-gradient-purple shadow-glow flex items-center justify-center">
              <Droplet className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl tracking-tight">Lavanda<span className="italic text-primary">.</span></span>
          </button>
          <div className="hidden md:flex items-center gap-8 text-sm font-light">
            <button onClick={() => go("home")} className={`transition-smooth hover:text-primary ${section === "home" ? "text-primary" : ""}`}>Início</button>
            <button onClick={() => go("product")} className={`transition-smooth hover:text-primary ${section === "product" ? "text-primary" : ""}`}>Produto</button>
            <button onClick={() => go("checkout")} className={`transition-smooth hover:text-primary ${section === "checkout" ? "text-primary" : ""}`}>Comprar</button>
            <button onClick={() => go("rastrear")} className={`transition-smooth hover:text-primary ${section === "rastrear" ? "text-primary" : ""}`}>Rastrear</button>
            <button onClick={() => go("conta")} className={`transition-smooth hover:text-primary ${section === "conta" ? "text-primary" : ""}`}>Conta</button>
            <a href="#suporte" className="transition-smooth hover:text-primary inline-flex items-center gap-1"><LifeBuoy className="w-3.5 h-3.5" /> Suporte</a>
          </div>
          <Button onClick={() => go("checkout")} variant="default" size="sm" className="bg-primary hover:bg-primary-deep rounded-full">
            <ShoppingBag className="w-4 h-4 mr-2" /> R$ 49,90
          </Button>
        </div>
      </nav>

      <main className="pt-20">
        {section === "home" && <Home onShop={() => go("product")} />}
        {section === "product" && <Product onBuy={() => go("checkout")} />}
        {section === "checkout" && <Checkout />}
        {section === "rastrear" && <Tracking />}
        {section === "conta" && <Auth />}
      </main>

      <Support />

      <footer className="border-t border-border/50 py-12 bg-gradient-soft">

        <div className="container text-center text-sm text-muted-foreground font-light">
          <div className="font-display text-2xl text-foreground mb-2">Lavanda<span className="italic text-primary">.</span></div>
          <p>© 2026 — Hidratação que perfuma seus dias.</p>
        </div>
      </footer>
    </div>
  );
};

const Home = ({ onShop }: { onShop: () => void }) => (
  <section className="relative overflow-hidden bg-gradient-hero">
    <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary-glow/20 blur-3xl" />
    <div className="absolute bottom-0 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />

    <div className="container relative grid lg:grid-cols-2 gap-12 items-center min-h-[85vh] py-20">
      <div className="space-y-8 animate-fade-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 border border-border/50 text-xs tracking-widest uppercase">
          <Sparkles className="w-3 h-3 text-primary" /> Nova coleção
        </div>
        <h1 className="font-display text-6xl md:text-7xl lg:text-8xl leading-[0.95]">
          Óleo Bifásico
          <br />
          <span className="italic text-primary">de Lavanda</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground font-light max-w-md leading-relaxed">
          Hidratação e frescor para sua pele todos os dias. Um óleo leve que perfuma e deixa sua pele macia com um aroma suave de lavanda.
        </p>
        <div className="flex flex-wrap gap-4 items-center">
          <Button onClick={onShop} size="lg" className="bg-primary hover:bg-primary-deep rounded-full px-8 h-14 text-base shadow-elegant group">
            Ver produto
            <ArrowRight className="w-4 h-4 ml-2 transition-smooth group-hover:translate-x-1" />
          </Button>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {[0,1,2].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-gradient-purple" />)}
            </div>
            +2.000 clientes apaixonados
          </div>
        </div>
      </div>

      <div className="relative animate-float">
        <div className="absolute inset-0 bg-gradient-purple rounded-full blur-3xl opacity-30 scale-90" />
        <img src={heroImage} alt="Óleo bifásico de lavanda em frasco de vidro com flores de lavanda" className="relative w-full max-w-xl mx-auto rounded-3xl shadow-elegant" />
      </div>
    </div>

    {/* Features strip */}
    <div className="container pb-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { icon: Droplet, title: "Hidrata", text: "Profundamente" },
          { icon: Sparkles, title: "Macia", text: "Toque sedoso" },
          { icon: Leaf, title: "Calmante", text: "Aroma natural" },
          { icon: Wind, title: "Refrescante", text: "Sensação leve" },
        ].map((f, i) => (
          <div key={i} className="p-6 rounded-2xl bg-card/60 backdrop-blur border border-border/50 hover:shadow-soft transition-smooth">
            <f.icon className="w-6 h-6 text-primary mb-3" />
            <div className="font-display text-2xl">{f.title}</div>
            <div className="text-sm text-muted-foreground font-light">{f.text}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Product = ({ onBuy }: { onBuy: () => void }) => (
  <section className="container py-20">
    <div className="grid lg:grid-cols-2 gap-16 items-start">
      <div className="lg:sticky lg:top-28">
        <div className="relative aspect-square rounded-3xl bg-gradient-hero overflow-hidden shadow-elegant">
          <img src={heroImage} alt="Óleo bifásico de lavanda" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="space-y-8 animate-fade-up">
        <div>
          <div className="text-xs tracking-widest uppercase text-primary mb-3">Skincare · 120ml</div>
          <h2 className="font-display text-5xl md:text-6xl leading-[0.95] mb-4">
            Óleo Bifásico
            <br /><span className="italic">de Lavanda</span>
          </h2>
          <div className="text-3xl font-display text-primary">R$ 49,90</div>
        </div>

        <p className="text-lg text-muted-foreground font-light leading-relaxed">
          Esse óleo hidrata a pele, deixando ela macia e cheirosa. É leve, fácil de usar e perfeito pro dia a dia. Agite antes de usar para misturar as duas fases e libere todo o poder da lavanda.
        </p>

        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="font-display text-2xl">Benefícios</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {["Hidrata a pele", "Deixa macia", "Aroma calmante", "Sensação refrescante"].map(b => (
              <div key={b} className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm">{b}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-border">
          <h3 className="font-display text-2xl">Modo de uso</h3>
          <p className="text-muted-foreground font-light">Agite antes de usar e aplique na pele espalhando bem.</p>
        </div>

        <div className="space-y-3 pt-4 border-t border-border">
          <h3 className="font-display text-2xl">Indicação</h3>
          <p className="text-muted-foreground font-light">Todos os tipos de pele.</p>
        </div>

        <Button onClick={onBuy} size="lg" className="w-full bg-primary hover:bg-primary-deep rounded-full h-14 text-base shadow-elegant">
          Comprar — R$ 49,90
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  </section>
);

const PRECO_BASE = 49.9;

const Checkout = () => {
  const sessao = getSessao();
  const cliente: Cliente | undefined = sessao
    ? clienteRepo.findAll().find((c) => c.id === sessao.id)
    : undefined;

  const [payment, setPayment] = useState("pix");
  const [cardKind, setCardKind] = useState<"credito" | "debito">("credito");
  const [frete, setFrete] = useState<{ valor: number; distancia: number } | null>(null);
  const [cupomInput, setCupomInput] = useState("");
  const [cupomAplicado, setCupomAplicado] = useState<{ codigo: string; valor: number } | null>(null);

  const subtotal = PRECO_BASE;
  const total = useMemo(
    () => +(Math.max(0, subtotal - (cupomAplicado?.valor ?? 0)) + (frete?.valor ?? 0)).toFixed(2),
    [subtotal, frete, cupomAplicado]
  );

  useEffect(() => {
    if (!cliente?.cep) return;
    try {
      const distancia = estimarDistanciaPorCep(cliente.cep);
      const { valorFrete } = calcularFrete(distancia);
      setFrete({ valor: valorFrete, distancia });
    } catch {
      setFrete(null);
    }
  }, [cliente?.cep]);

  if (!sessao || !cliente) {
    return (
      <section className="container py-20 max-w-2xl text-center">
        <div className="text-xs tracking-widest uppercase text-primary mb-3">Checkout</div>
        <h2 className="font-display text-5xl mb-4">Finalizar <span className="italic text-primary">compra</span></h2>
        <p className="text-muted-foreground">Faça login na sua conta para continuar a compra.</p>
      </section>
    );
  }

  const handleAplicarCupom = () => {
    const codigo = cupomInput.trim();
    if (!codigo) return;
    try {
      const r = aplicarCupom(codigo, subtotal);
      setCupomAplicado({ codigo: r.codigo, valor: r.valorDesconto });
      toast.success(`Cupom ${r.codigo} aplicado!`, {
        description: `Desconto de R$ ${r.valorDesconto.toFixed(2)}`,
      });
    } catch (err) {
      setCupomAplicado(null);
      toast.error(err instanceof Error ? err.message : "Cupom inválido");
    }
  };

  const handleRemoverCupom = () => {
    setCupomAplicado(null);
    setCupomInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!frete) {
        toast.error("CEP do cadastro inválido. Atualize seus dados.");
        return;
      }
      const metodo = payment === "cartao" ? cardKind : payment;
      const pedido = criarPedido({
        cliente_id: cliente.id,
        produto_id: 1,
        quantidade: 1,
        endereco_entrega: `${cliente.endereco}${cliente.cep ? ` — CEP ${cliente.cep}` : ""}`,
        distancia_calculada: frete.distancia,
        cupom: cupomAplicado?.codigo,
        metodo_pagamento: metodo,
      });
      toast.success("Pedido realizado!", {
        description: `#${pedido.id} · ${metodo.toUpperCase()} · Total R$ ${pedido.total_final.toFixed(2)}`,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar pedido");
    }
  };

  const Field = ({ label, value }: { label: string; value?: string }) => (
    <div>
      <div className="text-xs tracking-wider uppercase text-muted-foreground">{label}</div>
      <div className="text-sm mt-1">{value || <span className="italic text-muted-foreground">não informado</span>}</div>
    </div>
  );

  return (
    <section className="container py-20 max-w-5xl">
      <div className="text-center mb-12 animate-fade-up">
        <div className="text-xs tracking-widest uppercase text-primary mb-3">Checkout</div>
        <h2 className="font-display text-5xl md:text-6xl">Finalizar compra</h2>
        <p className="text-muted-foreground mt-3 font-light">Confirme seus dados e escolha a forma de pagamento.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_400px] gap-8">
        <div className="space-y-8">
          <div className="p-8 rounded-3xl bg-card border border-border/50 shadow-soft space-y-6">
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-2xl">Confirme seus dados</h3>
              <span className="text-xs text-muted-foreground">do cadastro</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Nome" value={cliente.nome} />
              <Field label="E-mail" value={cliente.email} />
              <Field label="Telefone" value={cliente.telefone} />
              <Field label="CEP" value={cliente.cep} />
              <div className="sm:col-span-2"><Field label="Endereço de entrega" value={cliente.endereco} /></div>
            </div>
            <p className="text-xs text-muted-foreground">
              Para alterar, edite na sua <span className="text-primary">conta</span>.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-card border border-border/50 shadow-soft space-y-6">
            <h3 className="font-display text-2xl">Forma de pagamento</h3>
            <RadioGroup value={payment} onValueChange={setPayment} className="space-y-3">
              {[
                { id: "pix", label: "Pix", desc: "Aprovação imediata" },
                { id: "boleto", label: "Boleto bancário", desc: "Vencimento em 3 dias úteis" },
                { id: "cartao", label: "Cartão de Crédito ou Débito", desc: "Crédito em até 3x sem juros" },
              ].map((opt) => (
                <label key={opt.id} htmlFor={opt.id} className={`flex items-center gap-4 p-5 rounded-xl border cursor-pointer transition-smooth ${payment === opt.id ? "border-primary bg-secondary/60" : "border-border hover:border-primary/50"}`}>
                  <RadioGroupItem value={opt.id} id={opt.id} />
                  <div className="flex-1">
                    <div className="font-medium">{opt.label}</div>
                    <div className="text-xs text-muted-foreground">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </RadioGroup>

            {payment === "cartao" && (
              <div className="pl-2 pt-2">
                <div className="text-xs tracking-wider uppercase text-muted-foreground mb-3">Tipo do cartão</div>
                <RadioGroup value={cardKind} onValueChange={(v) => setCardKind(v as "credito" | "debito")} className="grid grid-cols-2 gap-3">
                  {[
                    { id: "credito", label: "Crédito" },
                    { id: "debito", label: "Débito" },
                  ].map((opt) => (
                    <label key={opt.id} htmlFor={`card-${opt.id}`} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-smooth ${cardKind === opt.id ? "border-primary bg-secondary/60" : "border-border hover:border-primary/50"}`}>
                      <RadioGroupItem value={opt.id} id={`card-${opt.id}`} />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-28 h-fit p-8 rounded-3xl bg-gradient-hero border border-border/50 shadow-elegant space-y-6">
          <h3 className="font-display text-2xl">Resumo</h3>
          <div className="flex gap-4 pb-6 border-b border-border/60">
            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
              <img src={heroImage} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="font-medium">Óleo Bifásico de Lavanda</div>
              <div className="text-sm text-muted-foreground">120ml · 1 unidade</div>
              <div className="font-display text-lg text-primary mt-1">R$ {PRECO_BASE.toFixed(2)}</div>
            </div>
          </div>
          <div className="space-y-3 pb-2 border-b border-border/60">
            <div className="flex items-center gap-2 text-xs tracking-wider uppercase text-muted-foreground">
              <Tag className="w-3.5 h-3.5 text-primary" /> Cupom de desconto
            </div>
            {cupomAplicado ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/60 border border-primary/30">
                <div>
                  <div className="font-medium text-sm">{cupomAplicado.codigo}</div>
                  <div className="text-xs text-primary">−R$ {cupomAplicado.valor.toFixed(2)}</div>
                </div>
                <button type="button" onClick={handleRemoverCupom} className="text-muted-foreground hover:text-foreground transition-smooth p-1" aria-label="Remover cupom">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={cupomInput}
                  onChange={(e) => setCupomInput(e.target.value.toUpperCase())}
                  placeholder="Ex: LAVANDA10"
                  className="h-10 rounded-xl bg-background"
                />
                <Button type="button" variant="outline" onClick={handleAplicarCupom} className="rounded-xl h-10">
                  Aplicar
                </Button>
              </div>
            )}
            <p className="text-[11px] text-muted-foreground">Use <span className="font-medium text-primary">LAVANDA10</span> e ganhe 10% na primeira compra.</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>R$ {subtotal.toFixed(2)}</span></div>
            {cupomAplicado && (
              <div className="flex justify-between text-primary">
                <span>Desconto ({cupomAplicado.codigo})</span>
                <span>−R$ {cupomAplicado.valor.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frete</span>
              <span>{frete ? `R$ ${frete.valor.toFixed(2)}` : <span className="italic text-xs">cadastre um CEP</span>}</span>
            </div>
          </div>
          <div className="flex justify-between items-baseline pt-4 border-t border-border/60">
            <span className="font-display text-xl">Total</span>
            <span className="font-display text-3xl text-primary">R$ {total.toFixed(2)}</span>
          </div>
          <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary-deep rounded-full h-14 text-base shadow-elegant">
            Confirmar pedido
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-xs text-center text-muted-foreground">Compra 100% segura · Entrega para todo o Brasil</p>
        </aside>
      </form>
    </section>
  );
};

export default Index;
