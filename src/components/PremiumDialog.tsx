import { useState, useEffect } from "react";
import { Crown, Check, Sparkles, ArrowLeft, Smartphone, Building2, CreditCard, Copy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePremiumConfig, PremiumPlan } from "@/hooks/usePremiumConfig";

interface PremiumDialogProps { open: boolean; onOpenChange: (open: boolean) => void; }

const paymentMethods = [
  { id: "orange_money", label: "Orange Money", icon: Smartphone },
  { id: "mtn_money", label: "MTN Mobile Money", icon: Smartphone },
  { id: "paypal", label: "PayPal", icon: CreditCard },
  { id: "bank_transfer", label: "Virement bancaire", icon: Building2 },
] as const;

type Step = "plan" | "form" | "instructions";

const PremiumDialog = ({ open, onOpenChange }: PremiumDialogProps) => {
  const { user } = useAuth();
  const { plans, settings, loading } = usePremiumConfig();
  const [step, setStep] = useState<Step>("plan");
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<typeof paymentMethods[number]["id"]>("orange_money");
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState("");
  const [form, setForm] = useState({ full_name: "", email: "", phone: "" });

  const reset = () => {
    setStep("plan"); setSelectedPlan(null); setPaymentMethod("orange_money");
    setReference(""); setForm({ full_name: "", email: "", phone: "" });
  };

  const handleClose = (v: boolean) => { if (!v) reset(); onOpenChange(v); };

  const handleSelectPlan = (plan: PremiumPlan) => {
    setSelectedPlan(plan);
    if (user) setForm((f) => ({ ...f, email: user.email || "" }));
    setStep("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    if (!form.full_name.trim() || !form.email.trim()) { toast.error("Veuillez remplir nom et email"); return; }
    if ((paymentMethod === "orange_money" || paymentMethod === "mtn_money") && !form.phone.trim()) {
      toast.error("Le téléphone est requis pour le mobile money"); return;
    }
    setSubmitting(true);
    const ref = `NSG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const { error } = await supabase.from("subscription_requests").insert({
      user_id: user?.id ?? null, plan_name: selectedPlan.name, amount: selectedPlan.price,
      full_name: form.full_name.trim(), email: form.email.trim(), phone: form.phone.trim() || null,
      payment_method: paymentMethod, payment_reference: ref, status: "pending",
    });
    setSubmitting(false);
    if (error) { toast.error("Erreur d'enregistrement", { description: error.message }); return; }
    setReference(ref); setStep("instructions");
    toast.success("Demande enregistrée");
  };

  const copyRef = () => { navigator.clipboard.writeText(reference); toast.success("Référence copiée"); };
  const formatPrice = (p: PremiumPlan) => `${p.price.toLocaleString("fr-FR")} ${p.currency}`;

  const renderInstructions = () => {
    if (!selectedPlan) return null;
    switch (paymentMethod) {
      case "orange_money":
        return (
          <div className="space-y-2 text-sm font-body">
            <p><span className="text-muted-foreground">Numéro :</span> <span className="font-mono text-gold">{settings.orange_money_number || "—"}</span></p>
            <p><span className="text-muted-foreground">Bénéficiaire :</span> {settings.orange_money_name || "—"}</p>
            <p><span className="text-muted-foreground">Montant :</span> <span className="text-gold font-semibold">{formatPrice(selectedPlan)}</span></p>
            <p className="pt-2">Envoyez le montant et indiquez la référence ci-dessous en motif.</p>
          </div>
        );
      case "mtn_money":
        return (
          <div className="space-y-2 text-sm font-body">
            <p><span className="text-muted-foreground">Numéro :</span> <span className="font-mono text-gold">{settings.mtn_money_number || "—"}</span></p>
            <p><span className="text-muted-foreground">Bénéficiaire :</span> {settings.mtn_money_name || "—"}</p>
            <p><span className="text-muted-foreground">Montant :</span> <span className="text-gold font-semibold">{formatPrice(selectedPlan)}</span></p>
            <p className="pt-2">Envoyez le montant via MoMo et indiquez la référence en motif.</p>
          </div>
        );
      case "paypal":
        return (
          <div className="space-y-2 text-sm font-body">
            <p>Envoyez <span className="text-gold font-semibold">{formatPrice(selectedPlan)}</span> à <span className="font-mono text-gold">{settings.paypal_email || "—"}</span></p>
            <p>Indiquez la référence ci-dessous dans la note du paiement.</p>
          </div>
        );
      case "bank_transfer":
        return (
          <div className="space-y-1 text-sm font-body">
            <p><span className="text-muted-foreground">Banque :</span> {settings.bank_name || "—"}</p>
            <p><span className="text-muted-foreground">Titulaire :</span> {settings.bank_account_name || "—"}</p>
            <p><span className="text-muted-foreground">IBAN :</span> <span className="font-mono">{settings.bank_iban || "—"}</span></p>
            <p><span className="text-muted-foreground">SWIFT :</span> <span className="font-mono">{settings.bank_swift || "—"}</span></p>
            <p className="mt-2">Indiquez la référence ci-dessous en libellé du virement.</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {step === "form" && (
              <button onClick={() => setStep("plan")} className="text-muted-foreground hover:text-gold" aria-label="Retour"><ArrowLeft className="w-4 h-4" /></button>
            )}
            <Crown className="w-5 h-5 text-gold" />
            <DialogTitle className="font-display">
              {step === "plan" && (settings.modal_title || "Devenez membre Premium")}
              {step === "form" && `Abonnement ${selectedPlan?.name}`}
              {step === "instructions" && "Finalisez votre paiement"}
            </DialogTitle>
          </div>
          <DialogDescription className="font-body">
            {step === "plan" && (settings.modal_subtitle || "Accédez à tous nos contenus exclusifs.")}
            {step === "form" && "Vos coordonnées et mode de paiement."}
            {step === "instructions" && (settings.confirmation_message || "Suivez les instructions ci-dessous.")}
          </DialogDescription>
        </DialogHeader>

        {loading && step === "plan" && (
          <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-gold border-t-transparent rounded-full" /></div>
        )}

        {!loading && step === "plan" && (
          <div className={cn("grid gap-4 mt-2", plans.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2", "grid-cols-1")}>
            {plans.length === 0 && <p className="text-center text-muted-foreground font-body py-8 col-span-full">Aucun plan disponible pour le moment.</p>}
            {plans.map((p) => (
              <button key={p.id} onClick={() => handleSelectPlan(p)}
                className={cn("relative text-left bg-card rounded-xl p-6 border transition-all hover:border-gold hover:shadow-elegant",
                  p.highlighted ? "border-gold" : "border-border")}>
                {p.highlighted && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gold text-primary text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full font-body flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Populaire
                  </span>
                )}
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-body">{p.name}</p>
                <p className="font-display text-3xl font-bold mt-1">
                  {p.price.toLocaleString("fr-FR")}<span className="text-sm text-muted-foreground font-body"> {p.currency}</span>
                </p>
                <p className="text-xs text-muted-foreground font-body">{p.duration}</p>
                <ul className="mt-4 space-y-2">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm font-body">
                      <Check className="w-4 h-4 text-gold mt-0.5 shrink-0" /><span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 text-xs uppercase tracking-wider text-gold font-body font-semibold">Choisir →</div>
              </button>
            ))}
          </div>
        )}

        {step === "form" && selectedPlan && (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="bg-secondary/50 rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-body">Plan choisi</p>
                <p className="font-display font-semibold">{selectedPlan.name} — {formatPrice(selectedPlan)}</p>
              </div>
              <button type="button" onClick={() => setStep("plan")} className="text-xs text-gold hover:underline font-body">Changer</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label htmlFor="full_name" className="font-body text-xs uppercase tracking-wider">Nom complet *</Label>
                <Input id="full_name" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="mt-1" /></div>
              <div><Label htmlFor="email" className="font-body text-xs uppercase tracking-wider">Email *</Label>
                <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" /></div>
              <div className="sm:col-span-2"><Label htmlFor="phone" className="font-body text-xs uppercase tracking-wider">
                Téléphone {(paymentMethod === "orange_money" || paymentMethod === "mtn_money") && "*"}
              </Label>
                <Input id="phone" type="tel" placeholder="+237 6XX XX XX XX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" /></div>
            </div>

            <div>
              <Label className="font-body text-xs uppercase tracking-wider mb-2 block">Mode de paiement *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {paymentMethods.map((m) => {
                  const Icon = m.icon; const active = paymentMethod === m.id;
                  return (
                    <button key={m.id} type="button" onClick={() => setPaymentMethod(m.id)}
                      className={cn("flex items-center gap-3 rounded-lg border p-3 text-left transition-colors font-body",
                        active ? "border-gold bg-gold/5" : "border-border hover:border-gold/50")}>
                      <Icon className={cn("w-4 h-4 shrink-0", active ? "text-gold" : "text-muted-foreground")} />
                      <p className="text-sm font-medium">{m.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="w-full bg-gold hover:bg-gold-dark text-primary text-xs uppercase tracking-wider font-body">
              {submitting ? "Enregistrement..." : `Continuer — ${formatPrice(selectedPlan)}`}
            </Button>

            {!user && <p className="text-[11px] text-muted-foreground font-body text-center">
              Astuce : créez un compte pour activer automatiquement votre accès Premium dès validation.
            </p>}
          </form>
        )}

        {step === "instructions" && selectedPlan && (
          <div className="space-y-4 mt-2">
            <div className="bg-gold/5 border border-gold/30 rounded-lg p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-body">Référence de paiement</p>
              <div className="flex items-center justify-between mt-1 gap-2">
                <p className="font-mono font-bold text-gold text-lg break-all">{reference}</p>
                <Button type="button" size="sm" variant="ghost" onClick={copyRef} className="shrink-0"><Copy className="w-4 h-4" /></Button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs uppercase tracking-wider text-gold font-body font-semibold mb-3">
                Instructions {paymentMethods.find((m) => m.id === paymentMethod)?.label}
              </p>
              {renderInstructions()}
            </div>

            <p className="text-xs text-muted-foreground font-body text-center">
              {settings.support_email && <>Support : <span className="text-foreground">{settings.support_email}</span><br /></>}
              {user ? "Votre compte sera automatiquement upgradé Premium dès validation." : "Créez un compte avec ce même email pour activer l'accès."}
            </p>

            <Button onClick={() => handleClose(false)} className="w-full bg-gold hover:bg-gold-dark text-primary text-xs uppercase tracking-wider font-body">
              J'ai compris
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PremiumDialog;
