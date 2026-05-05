import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { LifeBuoy, Send } from "lucide-react";
import { criarSuporte } from "@/lib/api/services";

const Support = () => {
  const [nome, setNome] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const cliente_id = Date.now();
      const ticket = criarSuporte({ cliente_id, assunto, mensagem });
      toast.success("Mensagem enviada!", {
        description: `Ticket #${ticket.id} · status ${ticket.status}. Em breve responderemos${nome ? `, ${nome}` : ""}.`,
      });
      setNome("");
      setAssunto("");
      setMensagem("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar mensagem");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section id="suporte" className="bg-gradient-soft border-t border-border/50">
      <div className="container py-20 max-w-5xl">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 items-start">
          <div className="space-y-6 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 border border-border/50 text-xs tracking-widest uppercase">
              <LifeBuoy className="w-3 h-3 text-primary" /> Suporte
            </div>
            <h2 className="font-display text-5xl md:text-6xl leading-[0.95]">
              Fale<br /><span className="italic text-primary">conosco</span>
            </h2>
            <p className="text-muted-foreground font-light leading-relaxed">
              Dúvidas sobre o produto, pedidos ou entregas? Nossa equipe responde rapidinho. Abra um chamado e cuidaremos do resto.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>📧 contato@lavanda.com</p>
              <p>⏱️ Atendimento em até 24h</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-card border border-border/50 shadow-soft space-y-5">
            <div className="space-y-2">
              <Label htmlFor="sup-nome" className="text-xs tracking-wider uppercase text-muted-foreground">Nome (opcional)</Label>
              <Input id="sup-nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como podemos te chamar?" className="rounded-xl h-12 bg-background" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sup-assunto" className="text-xs tracking-wider uppercase text-muted-foreground">Assunto</Label>
              <Input id="sup-assunto" value={assunto} onChange={(e) => setAssunto(e.target.value)} placeholder="Sobre o que é seu contato?" required className="rounded-xl h-12 bg-background" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sup-msg" className="text-xs tracking-wider uppercase text-muted-foreground">Mensagem</Label>
              <Textarea id="sup-msg" value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Conte com detalhes como podemos ajudar..." required rows={5} className="rounded-xl bg-background resize-none" />
            </div>
            <Button type="submit" disabled={enviando} size="lg" className="w-full bg-primary hover:bg-primary-deep rounded-full h-14 text-base shadow-elegant">
              {enviando ? "Enviando..." : (<>Enviar mensagem <Send className="w-4 h-4 ml-2" /></>)}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Support;
