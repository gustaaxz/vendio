import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { UserPlus, Loader2, Check } from "lucide-react";

export const Route = createFileRoute("/_auth/registro")({
  head: () => ({
    meta: [
      { title: "Criar conta — ShopManager" },
      {
        name: "description",
        content: "Crie sua conta e comece a organizar sua loja em minutos.",
      },
    ],
  }),
  component: RegistroPage,
});

function RegistroPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    const { error: err } = await signUp(email, password, orgName, fullName);

    if (err) {
      setError(
        err.includes("already registered")
          ? "Este e-mail já está cadastrado."
          : err,
      );
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/10">
          <Check className="h-7 w-7 text-success" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Conta criada!</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          Enviamos um link de confirmação para <strong>{email}</strong>. Verifique sua caixa de
          entrada (e a pasta de spam) para ativar sua conta.
        </p>
        <Link to="/login" className="inline-block mt-6">
          <Button variant="outline">Ir para o login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Crie sua conta</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Comece com 14 dias grátis. Sem cartão de crédito.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div>
          <Label htmlFor="fullName">Seu nome</Label>
          <Input
            id="fullName"
            placeholder="João Silva"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div>
          <Label htmlFor="orgName">Nome da loja</Label>
          <Input
            id="orgName"
            placeholder="Mercado do João"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={6}
          />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <UserPlus className="h-4 w-4 mr-2" />
          )}
          Criar conta grátis
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link to="/login" className="text-primary font-medium hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
