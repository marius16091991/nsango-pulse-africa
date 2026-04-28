import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Bell, Check, Trash2, ExternalLink, Loader2, Mail, Smartphone, MessageCircle } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const TYPE_LABELS: Record<string, string> = {
  article: "Nouveaux articles", comment: "Réponses à mes commentaires",
  subscription: "Abonnements", premium: "Statut premium",
  user: "Communauté", system: "Annonces système",
};

const UserNotifications = () => {
  const { user } = useAuth();
  const { notifications, loading, markRead, markAllRead, remove, unreadCount } = useNotifications();
  const [prefs, setPrefs] = useState<any>({ in_app: true, email: true, push: false, types: {} });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("notification_preferences").select("*").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { if (data) setPrefs(data); });
  }, [user]);

  const savePref = async (patch: any) => {
    if (!user) return;
    const next = { ...prefs, ...patch, user_id: user.id };
    setPrefs(next); setSaving(true);
    const { error } = await supabase.from("notification_preferences").upsert(next, { onConflict: "user_id" });
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Préférences sauvegardées");
  };

  const toggleType = (key: string, val: boolean) => {
    savePref({ types: { ...(prefs.types || {}), [key]: val } });
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card/80 backdrop-blur-sm shadow-card">
        <CardContent className="p-6 md:p-8 space-y-5">
          <div>
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <Bell className="w-5 h-5 text-gold" /> Canaux de réception
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Choisissez où vous souhaitez être averti.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <label className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border hover:border-gold/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-gold" />
                <span className="text-sm font-body">Dans l'app</span>
              </div>
              <Switch checked={prefs.in_app} onCheckedChange={(v) => savePref({ in_app: v })} />
            </label>
            <label className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border hover:border-gold/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold" />
                <span className="text-sm font-body">Email</span>
              </div>
              <Switch checked={prefs.email} onCheckedChange={(v) => savePref({ email: v })} />
            </label>
            <label className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border hover:border-gold/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-gold" />
                <span className="text-sm font-body">Push</span>
              </div>
              <Switch checked={prefs.push} onCheckedChange={(v) => savePref({ push: v })} />
            </label>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card/80 backdrop-blur-sm shadow-card">
        <CardContent className="p-6 md:p-8 space-y-3">
          <h2 className="font-display text-xl font-bold">Types d'événements</h2>
          <div className="divide-y divide-border">
            {Object.entries(TYPE_LABELS).map(([k, label]) => (
              <div key={k} className="flex items-center justify-between py-3">
                <Label className="text-sm font-body">{label}</Label>
                <Switch checked={prefs.types?.[k] !== false} onCheckedChange={(v) => toggleType(k, v)} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card/80 backdrop-blur-sm shadow-card">
        <CardContent className="p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="font-display text-xl font-bold">Historique</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {unreadCount} non lue{unreadCount > 1 ? "s" : ""} sur {notifications.length}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button size="sm" variant="outline" onClick={markAllRead} className="gap-2">
                <Check className="w-3.5 h-3.5" /> Tout marquer lu
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gold" /></div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              Aucune notification pour le moment.
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`group flex items-start gap-3 p-3 rounded-lg border transition-all ${
                    !n.read
                      ? "border-gold/30 bg-gradient-to-r from-gold/5 to-transparent"
                      : "border-border bg-background/50"
                  }`}
                >
                  {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-gold shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{n.title}</p>
                    {n.description && <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })}
                      </span>
                      {n.link && (
                        <Link
                          to={n.link}
                          onClick={() => markRead(n.id)}
                          className="text-[10px] text-gold hover:underline inline-flex items-center gap-0.5"
                        >
                          Voir <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    {!n.read && (
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => markRead(n.id)}>
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => remove(n.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserNotifications;
