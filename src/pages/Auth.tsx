import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, LogIn, UserPlus, ArrowLeft, Mail, Sparkles, ShieldCheck, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { describeAuthPasswordError } from "@/lib/authErrors";

/**
 * Sécurise la cible de redirection post-login :
 * - doit commencer par "/" (chemin interne)
 * - ne doit pas commencer par "//" ou "/\\" (protocol-relative URL)
 * - fallback vers /compte si invalide
 */
const sanitizeRedirect = (raw: string | null): string => {
  if (!raw) return "/compte";
  if (!raw.startsWith("/")) return "/compte";
  if (raw.startsWith("//") || raw.startsWith("/\\")) return "/compte";
  return raw;
};

const Auth = () => {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = sanitizeRedirect(searchParams.get("redirect"));

  // Si déjà connecté → redirige immédiatement vers la cible visée
  useEffect(() => {
    if (!loading && user) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, loading, redirectTo, navigate]);

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
          navigate(redirectTo, { replace: true });
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
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 gradient-dark overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none"
             style={{ background: "radial-gradient(600px at 30% 20%, hsl(var(--gold) / 0.25), transparent 70%), radial-gradient(500px at 80% 80%, hsl(var(--gold) / 0.15), transparent 70%)" }} />
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold text-xs uppercase tracking-widest font-body">
            <ArrowLeft className="w-3.5 h-3.5" /> Retour au site
          </Link>
        </div>
        <div className="relative z-10 space-y-6 max-w-md">
          <h1 className="font-display text-5xl font-bold leading-tight">
            <span className="text-gold">N</span>sango
            <span className="block text-base uppercase tracking-[0.3em] text-muted-foreground font-body mt-2">Magazine</span>
          </h1>
          <p className="font-display text-2xl leading-snug">
            Les visages qui inspirent <span className="text-gold">l'Afrique</span>.
          </p>
          <p className="text-sm text-muted-foreground font-body leading-relaxed">
            Rejoignez une communauté qui célèbre la culture, l'innovation et les talents du continent.
          </p>
        </div>
        <div className="relative z-10 grid grid-cols-1 gap-3 max-w-sm">
          {[
            { icon: Sparkles, text: "Articles exclusifs et portraits inédits" },
            { icon: Crown, text: "Accès Premium aux contenus longs" },
            { icon: ShieldCheck, text: "Vos données restent privées et sécurisées" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-xs text-foreground/80 font-body">
              <span className="w-8 h-8 rounded-lg bg-gold/15 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-gold" />
              </span>
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-4">
              <ArrowLeft className="w-4 h-4" /> Retour au site
            </Link>
            <h1 className="font-display text-3xl font-bold">
              <span className="text-gold">N</span>sango
            </h1>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.25em] text-gold font-body">
              {mode === "login" ? "Connexion" : mode === "register" ? "Inscription" : "Récupération"}
            </p>
            <h2 className="font-display text-3xl font-bold">
              {mode === "login" && "Bon retour !"}
              {mode === "register" && "Créez votre compte"}
              {mode === "forgot" && "Mot de passe oublié"}
            </h2>
            <p className="text-sm text-muted-foreground font-body">
              {mode === "login" && "Connectez-vous pour accéder à votre espace personnalisé."}
              {mode === "register" && "Quelques secondes suffisent pour rejoindre la communauté."}
              {mode === "forgot" && "Nous vous enverrons un lien sécurisé par email."}
            </p>
          </div>

          <Card className="shadow-elegant border-border/60">
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
                className="w-full bg-gold hover:bg-gold-dark text-primary font-semibold gap-2 h-11"
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

          <p className="text-[11px] text-center text-muted-foreground font-body">
            En continuant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
