import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, KeyRound, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { describeAuthPasswordError } from "@/lib/authErrors";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase pose la session via le hash (#access_token=…&type=recovery)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasSession(true);
      }
      setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setHasSession(true);
      setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: "Mot de passe trop court", description: "Minimum 8 caractères", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Les mots de passe ne correspondent pas", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      const info = describeAuthPasswordError(error);
      toast({ title: info.title, description: info.description, variant: "destructive" });
      return;
    }
    setDone(true);
    toast({ title: "Mot de passe modifié", description: "Vous pouvez maintenant vous connecter." });
    setTimeout(() => navigate("/auth"), 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6">
            <ArrowLeft className="w-4 h-4" /> Retour au site
          </Link>
          <h1 className="font-display text-4xl font-bold">
            <span className="text-gold">N</span>sango
          </h1>
          <p className="text-sm text-muted-foreground mt-2">Réinitialiser votre mot de passe</p>
        </div>

        <Card className="shadow-elegant border-border">
          <CardContent className="p-6">
            {!ready ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>
            ) : !hasSession ? (
              <div className="text-center space-y-3 py-4">
                <p className="text-sm text-muted-foreground">
                  Lien invalide ou expiré. Demandez un nouveau lien de réinitialisation.
                </p>
                <Button asChild className="bg-gold hover:bg-gold-dark text-primary font-semibold">
                  <Link to="/auth">Retour à la connexion</Link>
                </Button>
              </div>
            ) : done ? (
              <div className="text-center space-y-3 py-4">
                <CheckCircle2 className="w-12 h-12 text-gold mx-auto" />
                <p className="font-semibold">Mot de passe mis à jour</p>
                <p className="text-sm text-muted-foreground">Redirection vers la connexion…</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-sm">Nouveau mot de passe</Label>
                  <div className="relative mt-1">
                    <Input
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPw(!showPw)}
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Confirmer le mot de passe</Label>
                  <Input
                    className="mt-1"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    minLength={8}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gold hover:bg-gold-dark text-primary font-semibold gap-2"
                  disabled={submitting}
                >
                  <KeyRound className="w-4 h-4" />
                  {submitting ? "Mise à jour…" : "Mettre à jour le mot de passe"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;