import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { Mail, Loader2, ArrowLeft, Check } from "lucide-react";

export const Route = createFileRoute("/_auth/recuperar-senha")({
  head: () => ({
    meta: [
      { title: "Recuperar senha — ShopManager" },
      { name: "description", content: "Redefina sua senha do ShopManager." },
    ],
  }),
  component: RecuperarSenhaPage,
});

function RecuperarSenhaPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: err } = await resetPassword(email);

    if (err) {
      setError(err);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/10">
          <Check className="h-7 w-7 text-success" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">E-mail enviado!</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          Se <strong>{email}</strong> estiver cadastrado, você receberá um link para redefinir sua
          senha. Verifique a caixa de entrada e a pasta de spam.
        </p>
        <Link to="/login" className="inline-block mt-6">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Recuperar senha</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Informe seu e-mail e enviaremos um link para redefinir sua senha.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

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
            autoFocus
          />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Mail className="h-4 w-4 mr-2" />
          )}
          Enviar link de recuperação
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to="/login" className="text-primary font-medium hover:underline">
          <ArrowLeft className="h-3 w-3 inline mr-1" />
          Voltar ao login
        </Link>
      </p>
    </div>
  );
}
