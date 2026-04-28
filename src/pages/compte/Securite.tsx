import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, KeyRound, ShieldCheck, LogOut, Loader2, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { describeAuthPasswordError } from "@/lib/authErrors";
import PasswordStrength from "@/components/auth/PasswordStrength";

const Securite = () => {
  const { signOut } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < 8) return toast.error("Minimum 8 caractères");
    if (next !== confirm) return toast.error("Les mots de passe ne correspondent pas");
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: next });
    setSaving(false);
    if (error) {
      const info = describeAuthPasswordError(error);
      toast.error(info.title, { description: info.description });
      return;
    }
    toast.success("Mot de passe mis à jour");
    setCurrent(""); setNext(""); setConfirm("");
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card/80 backdrop-blur-sm shadow-card">
        <CardContent className="p-6 md:p-8 space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-gold" /> Mot de passe
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Vérification automatique contre la base publique HIBP — les mots de passe compromis sont refusés.
            </p>
          </div>

          <form onSubmit={handleChange} className="space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-wider font-body">Nouveau mot de passe</Label>
              <div className="relative mt-1.5">
                <Input
                  type={showPw ? "text" : "password"}
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  minLength={8}
                  required
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrength password={next} />
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider font-body">Confirmer</Label>
              <Input
                className="mt-1.5"
                type={showPw ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                minLength={8}
                required
                placeholder="••••••••"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving} className="bg-gold hover:bg-gold-dark text-primary font-semibold gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Mettre à jour
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border bg-card/80 backdrop-blur-sm shadow-card">
        <CardContent className="p-6 md:p-8 space-y-4">
          <div>
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <Shield className="w-5 h-5 text-gold" /> Sessions & accès
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Déconnectez-vous de tous les appareils en cas de doute.</p>
          </div>
          <Button
            variant="outline"
            className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={async () => {
              await signOut();
              toast.success("Déconnecté");
            }}
          >
            <LogOut className="w-4 h-4" /> Se déconnecter
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-6 md:p-8 space-y-3">
          <h2 className="font-display text-base font-bold flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-4 h-4" /> Zone sensible
          </h2>
          <p className="text-xs text-muted-foreground">
            Pour supprimer votre compte ou modifier votre adresse email, contactez l'équipe Nsango par email — un administrateur traitera votre demande sous 48h.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Securite;