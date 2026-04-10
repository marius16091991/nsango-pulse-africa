import { useState } from "react";
import { Bell, CheckCircle, AlertTriangle, Users, Crown, MessageSquare, FileText, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Notification {
  id: number; type: string; icon: typeof Bell; color: string; title: string; desc: string; time: string; read: boolean;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, type: "subscription", icon: Crown, color: "text-gold", title: "Nouvel abonné Gold", desc: "Omar Sy vient de souscrire à l'abonnement Gold", time: "Il y a 2 heures", read: false },
    { id: 2, type: "comment", icon: MessageSquare, color: "text-blue-500", title: "Nouveau commentaire en attente", desc: "Un commentaire sur « Les startups fintech » nécessite modération", time: "Il y a 3 heures", read: false },
    { id: 3, type: "alert", icon: AlertTriangle, color: "text-red-500", title: "Commentaire signalé", desc: "Un commentaire spam détecté sur « Portrait : Wangari Maathai »", time: "Il y a 5 heures", read: false },
    { id: 4, type: "article", icon: FileText, color: "text-green-600", title: "Article publié avec succès", desc: "« Aliko Dangote : L'empire » est maintenant en ligne", time: "Il y a 1 jour", read: true },
    { id: 5, type: "subscription", icon: Crown, color: "text-gold", title: "Nouvel abonné Silver", desc: "Jean Mabika a souscrit à Silver", time: "Il y a 1 jour", read: true },
    { id: 6, type: "users", icon: Users, color: "text-purple-500", title: "50 nouveaux inscrits cette semaine", desc: "Croissance en hausse de 15%", time: "Il y a 2 jours", read: true },
  ]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({ title: "Tout marqué comme lu" });
  };

  const markRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast({ title: "Notification supprimée" });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground font-body">{unreadCount} non lue{unreadCount > 1 ? "s" : ""}</p>
        </div>
        <Button variant="outline" className="text-sm font-body" onClick={markAllRead}>Tout marquer comme lu</Button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <Card key={n.id} className={`cursor-pointer transition-colors ${!n.read ? "border-gold/30 bg-gold/5" : ""}`} onClick={() => markRead(n.id)}>
            <CardContent className="p-4 flex items-start gap-4">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${!n.read ? "bg-gold/10" : "bg-muted"}`}>
                <n.icon className={`w-4 h-4 ${n.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{n.title}</p>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-gold shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground font-body mt-0.5">{n.desc}</p>
                <p className="text-[10px] text-muted-foreground font-body mt-1">{n.time}</p>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {notifications.length === 0 && <p className="text-center text-muted-foreground font-body py-8">Aucune notification</p>}
      </div>
    </div>
  );
};

export default NotificationsPage;
