import { useMemo, useState } from "react";
import heroImage from "@/assets/lavender-hero.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Droplet, Sparkles, Leaf, Wind, ShoppingBag, ArrowRight, Tag, Truck, LifeBuoy } from "lucide-react";
import {
  aplicarCupom,
  calcularFrete,
  criarCliente,
  criarPedido,
  estimarDistanciaPorCep,
} from "@/lib/api/services";
import Support from "@/components/Support";

const Index = () => {
  const [section, setSection] = useState<"home" | "product" | "checkout">("home");

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
            <a href="#suporte" className="transition-smooth hover:text-primary inline-flex items-center gap-1"><LifeBuoy className="w-3.5 h-3.5" /> Suporte</a>
            <a href="/admin" className="transition-smooth hover:text-primary">Admin</a>
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
          <div className="text-xs tracking-widest uppercase text-primary mb-3">Skincare · 60ml</div>
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
  const [payment, setPayment] = useState("pix");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("Rua Ademar de Barros, 576");
  const [city, setCity] = useState("São Paulo");
  const [cep, setCep] = useState("");
  const [cupom, setCupom] = useState("");
  const [cupomAplicado, setCupomAplicado] = useState<{ codigo: string; valorDesconto: number } | null>(null);
  const [frete, setFrete] = useState<{ valor: number; distancia: number } | null>(null);

  const subtotal = PRECO_BASE;
  const total = useMemo(() => {
    return +(subtotal + (frete?.valor ?? 0) - (cupomAplicado?.valorDesconto ?? 0)).toFixed(2);
  }, [subtotal, frete, cupomAplicado]);

  const handleCalcularFrete = () => {
    try {
      const distancia = estimarDistanciaPorCep(cep);
      const { valorFrete } = calcularFrete(distancia);
      setFrete({ valor: valorFrete, distancia });
      toast.success(`Frete calculado: ~${distancia} km`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao calcular frete");
    }
  };

  const handleAplicarCupom = () => {
    try {
      const r = aplicarCupom(cupom, subtotal);
      setCupomAplicado({ codigo: r.codigo, valorDesconto: r.valorDesconto });
      toast.success(`Cupom ${r.codigo} aplicado!`, { description: `−R$ ${r.valorDesconto.toFixed(2)}` });
    } catch (err) {
      setCupomAplicado(null);
      toast.error(err instanceof Error ? err.message : "Cupom inválido");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!nome || !email) {
        toast.error("Preencha nome e e-mail.");
        return;
      }
      if (!frete) {
        toast.error("Calcule o frete antes de finalizar.");
        return;
      }
      const cliente = criarCliente({ nome, email, endereco: `${address}, ${city}` });
      const pedido = criarPedido({
        cliente_id: cliente.id,
        produto_id: 1,
        quantidade: 1,
        endereco_entrega: `${address}, ${city} — CEP ${cep}`,
        distancia_calculada: frete.distancia,
        cupom: cupomAplicado?.codigo,
        metodo_pagamento: payment,
      });
      toast.success("Pedido realizado!", {
        description: `#${pedido.id} · ${payment.toUpperCase()} · Total R$ ${pedido.total_final.toFixed(2)}`,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar pedido");
    }
  };

  return (
    <section className="container py-20 max-w-5xl">
      <div className="text-center mb-12 animate-fade-up">
        <div className="text-xs tracking-widest uppercase text-primary mb-3">Checkout</div>
        <h2 className="font-display text-5xl md:text-6xl">Finalizar compra</h2>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_400px] gap-8">
        <div className="space-y-8">
          <div className="p-8 rounded-3xl bg-card border border-border/50 shadow-soft space-y-6">
            <h3 className="font-display text-2xl">Seus dados</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-xs tracking-wider uppercase text-muted-foreground">Nome</Label>
                <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" className="rounded-xl h-12 bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs tracking-wider uppercase text-muted-foreground">E-mail</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" className="rounded-xl h-12 bg-background" />
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-card border border-border/50 shadow-soft space-y-6">
            <h3 className="font-display text-2xl">Endereço de entrega</h3>
            <div className="space-y-2">
              <Label htmlFor="addr" className="text-xs tracking-wider uppercase text-muted-foreground">Endereço</Label>
              <Input id="addr" value={address} onChange={(e) => setAddress(e.target.value)} className="rounded-xl h-12 bg-background" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-xs tracking-wider uppercase text-muted-foreground">Cidade</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="rounded-xl h-12 bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cep" className="text-xs tracking-wider uppercase text-muted-foreground">CEP</Label>
                <Input id="cep" value={cep} onChange={(e) => setCep(e.target.value)} placeholder="00000-000" className="rounded-xl h-12 bg-background" />
              </div>
            </div>
            <Button type="button" variant="outline" onClick={handleCalcularFrete} className="rounded-full">
              <Truck className="w-4 h-4 mr-2" /> Calcular frete
            </Button>
            {frete && (
              <p className="text-sm text-muted-foreground">
                Distância estimada: <span className="text-foreground">{frete.distancia} km</span> · Frete:{" "}
                <span className="text-foreground">R$ {frete.valor.toFixed(2)}</span>
              </p>
            )}
          </div>

          <div className="p-8 rounded-3xl bg-card border border-border/50 shadow-soft space-y-6">
            <h3 className="font-display text-2xl">Cupom de desconto</h3>
            <div className="flex gap-3">
              <Input value={cupom} onChange={(e) => setCupom(e.target.value)} placeholder="LAVANDA10" className="rounded-xl h-12 bg-background" />
              <Button type="button" variant="outline" onClick={handleAplicarCupom} className="rounded-full">
                <Tag className="w-4 h-4 mr-2" /> Aplicar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Experimente <code className="text-primary">LAVANDA10</code> ou <code className="text-primary">BEMVINDO5</code></p>
          </div>

          <div className="p-8 rounded-3xl bg-card border border-border/50 shadow-soft space-y-6">
            <h3 className="font-display text-2xl">Forma de pagamento</h3>
            <RadioGroup value={payment} onValueChange={setPayment} className="space-y-3">
              {[
                { id: "pix", label: "Pix", desc: "Aprovação imediata" },
                { id: "credito", label: "Cartão de Crédito", desc: "Até 3x sem juros" },
                { id: "debito", label: "Cartão de Débito", desc: "Pagamento à vista" },
              ].map(opt => (
                <label key={opt.id} htmlFor={opt.id} className={`flex items-center gap-4 p-5 rounded-xl border cursor-pointer transition-smooth ${payment === opt.id ? "border-primary bg-secondary/60" : "border-border hover:border-primary/50"}`}>
                  <RadioGroupItem value={opt.id} id={opt.id} />
                  <div className="flex-1">
                    <div className="font-medium">{opt.label}</div>
                    <div className="text-xs text-muted-foreground">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </RadioGroup>
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
              <div className="text-sm text-muted-foreground">60ml · 1 unidade</div>
              <div className="font-display text-lg text-primary mt-1">R$ {PRECO_BASE.toFixed(2)}</div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>R$ {subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frete</span>
              <span>{frete ? `R$ ${frete.valor.toFixed(2)}` : <span className="italic text-xs">informe o CEP</span>}</span>
            </div>
            {cupomAplicado && (
              <div className="flex justify-between text-primary">
                <span>Cupom {cupomAplicado.codigo}</span>
                <span>−R$ {cupomAplicado.valorDesconto.toFixed(2)}</span>
              </div>
            )}
          </div>
          <div className="flex justify-between items-baseline pt-4 border-t border-border/60">
            <span className="font-display text-xl">Total</span>
            <span className="font-display text-3xl text-primary">R$ {total.toFixed(2)}</span>
          </div>
          <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary-deep rounded-full h-14 text-base shadow-elegant">
            Comprar agora
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-xs text-center text-muted-foreground">Compra 100% segura · Entrega para todo o Brasil</p>
        </aside>
      </form>
    </section>
  );
};

export default Index;
