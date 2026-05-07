import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserPlus, LogIn, User } from "lucide-react";
import { criarCliente } from "@/lib/api/services";
import { clienteRepo } from "@/lib/api/repositories";

const SESSION_KEY = "lavanda.sessao";

export function getSessao(): { id: number; nome: string; email: string } | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const Auth = () => {
  const [tab, setTab] = useState<"login" | "cadastro">("login");
  const [sessao, setSessao] = useState(getSessao());

  // login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSenha, setLoginSenha] = useState("");

  // cadastro
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");

  const persistir = (c: { id: number; nome: string; email: string }) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(c));
    setSessao(c);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const c = clienteRepo.findAll().find((x) => x.email === loginEmail.trim() && x.senha === loginSenha);
    if (!c) {
      toast.error("E-mail ou senha inválidos");
      return;
    }
    persistir({ id: c.id, nome: c.nome, email: c.email });
    toast.success(`Bem-vinda(o), ${c.nome}!`);
  };

  const handleCadastro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !senha) {
      toast.error("Preencha nome, e-mail e senha.");
      return;
    }
    try {
      const novo = criarCliente({ nome, email, endereco, telefone });
      // injeta extras
      (novo as any).senha = senha;
      (novo as any).data_nascimento = dataNasc;
      persistir({ id: novo.id, nome: novo.nome, email: novo.email });
      toast.success("Conta criada!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao cadastrar");
    }
  };

  const sair = () => {
    localStorage.removeItem(SESSION_KEY);
    setSessao(null);
  };

  if (sessao) {
    return (
      <section className="container py-20 max-w-2xl">
        <div className="text-center mb-10 animate-fade-up">
          <div className="text-xs tracking-widest uppercase text-primary mb-3">Minha conta</div>
          <h2 className="font-display text-5xl">Olá, <span className="italic text-primary">{sessao.nome}</span></h2>
        </div>
        <div className="p-8 rounded-3xl bg-card border border-border/50 shadow-soft space-y-4 text-center">
          <User className="w-12 h-12 text-primary mx-auto" />
          <p className="text-muted-foreground">{sessao.email}</p>
          <p className="text-sm">ID do cliente: <span className="font-mono">{sessao.id}</span></p>
          <Button onClick={sair} variant="outline" className="rounded-full">Sair da conta</Button>
        </div>
      </section>
    );
  }

  return (
    <section className="container py-20 max-w-2xl">
      <div className="text-center mb-10 animate-fade-up">
        <div className="text-xs tracking-widest uppercase text-primary mb-3">Conta</div>
        <h2 className="font-display text-5xl">Entrar / Cadastrar</h2>
      </div>

      <div className="flex gap-2 mb-6 justify-center">
        <Button onClick={() => setTab("login")} variant={tab === "login" ? "default" : "outline"} className="rounded-full">
          <LogIn className="w-4 h-4 mr-2" /> Login
        </Button>
        <Button onClick={() => setTab("cadastro")} variant={tab === "cadastro" ? "default" : "outline"} className="rounded-full">
          <UserPlus className="w-4 h-4 mr-2" /> Cadastro
        </Button>
      </div>

      {tab === "login" ? (
        <form onSubmit={handleLogin} className="p-8 rounded-3xl bg-card border border-border/50 shadow-soft space-y-5">
          <div className="space-y-2">
            <Label className="text-xs tracking-wider uppercase text-muted-foreground">E-mail</Label>
            <Input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required className="rounded-xl h-12 bg-background" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs tracking-wider uppercase text-muted-foreground">Senha</Label>
            <Input type="password" value={loginSenha} onChange={(e) => setLoginSenha(e.target.value)} required className="rounded-xl h-12 bg-background" />
          </div>
          <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary-deep rounded-full h-14">Entrar</Button>
          <p className="text-xs text-muted-foreground text-center">Teste: <code className="text-primary">vmelo3578@gmail.com</code> / <code className="text-primary">vitorialinda123</code></p>
        </form>
      ) : (
        <form onSubmit={handleCadastro} className="p-8 rounded-3xl bg-card border border-border/50 shadow-soft space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground">Nome</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} required className="rounded-xl h-12 bg-background" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground">E-mail</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-xl h-12 bg-background" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground">Senha</Label>
              <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required className="rounded-xl h-12 bg-background" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground">Data de nascimento</Label>
              <Input type="date" value={dataNasc} onChange={(e) => setDataNasc(e.target.value)} className="rounded-xl h-12 bg-background" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground">Endereço</Label>
              <Input value={endereco} onChange={(e) => setEndereco(e.target.value)} className="rounded-xl h-12 bg-background" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground">Telefone</Label>
              <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 00000-0000" className="rounded-xl h-12 bg-background" />
            </div>
          </div>
          <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary-deep rounded-full h-14">Criar conta</Button>
        </form>
      )}
    </section>
  );
};

export default Auth;
