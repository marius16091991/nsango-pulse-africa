import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, LogIn, UserPlus, ArrowLeft, Mail, KeyRound } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { describeAuthPasswordError } from "@/lib/authErrors";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/compte";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        if (error) {
          toast({ title: "Erreur", description: error.message, variant: "destructive" });
        } else {
          toast({
            title: "Email envoyé",
            description: "Si un compte existe pour cette adresse, vous recevrez un lien de réinitialisation.",
          });
          setMode("login");
        }
      } else if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          toast({ title: "Erreur de connexion", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Bienvenue !" });
          navigate(redirectTo);
        }
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          const info = describeAuthPasswordError(error);
          toast({
            title: info.isCompromised ? info.title : "Erreur d'inscription",
            description: info.description,
            variant: "destructive",
          });
        } else {
          toast({ title: "Compte créé", description: "Vérifiez votre email pour confirmer votre compte." });
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6">
            <ArrowLeft className="w-4 h-4" /> Retour au site
          </Link>
          <h1 className="font-display text-4xl font-bold">
            <span className="text-gold">N</span>sango
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {mode === "login" && "Connectez-vous à votre espace"}
            {mode === "register" && "Créez votre compte"}
            {mode === "forgot" && "Récupérez l'accès à votre compte"}
          </p>
        </div>

        <Card className="shadow-elegant border-border">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <Label className="text-sm">Nom d'affichage</Label>
                  <Input
                    className="mt-1"
                    placeholder="Votre nom"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div>
                <Label className="text-sm">Email</Label>
                <Input
                  className="mt-1"
                  type="email"
                  placeholder="email@exemple.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                {mode === "forgot" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Saisissez l'email de votre compte. Nous vous enverrons un lien sécurisé pour définir un nouveau mot de passe.
                  </p>
                )}
              </div>
              {mode !== "forgot" && (
                <div>
                  <Label className="text-sm">Mot de passe</Label>
                  <div className="relative mt-1">
                    <Input
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPw(!showPw)}
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {mode === "login" && (
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-gold transition-colors mt-2"
                      onClick={() => setMode("forgot")}
                    >
                      Mot de passe oublié ?
                    </button>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold-dark text-primary font-semibold gap-2"
                disabled={submitting}
              >
                {mode === "login" && <LogIn className="w-4 h-4" />}
                {mode === "register" && <UserPlus className="w-4 h-4" />}
                {mode === "forgot" && <Mail className="w-4 h-4" />}
                {submitting
                  ? "Chargement..."
                  : mode === "login"
                    ? "Se connecter"
                    : mode === "register"
                      ? "Créer mon compte"
                      : "Envoyer le lien de réinitialisation"}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              {mode === "forgot" ? (
                <button
                  className="text-sm text-muted-foreground hover:text-gold transition-colors inline-flex items-center gap-1"
                  onClick={() => setMode("login")}
                >
                  <ArrowLeft className="w-3 h-3" /> Retour à la connexion
                </button>
              ) : (
                <button
                  className="text-sm text-muted-foreground hover:text-gold transition-colors block w-full"
                  onClick={() => setMode(mode === "login" ? "register" : "login")}
                >
                  {mode === "login" ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
