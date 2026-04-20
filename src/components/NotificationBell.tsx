import { Link } from "react-router-dom";
import { Bell, Check, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const typeColors: Record<string, string> = {
  article: "text-green-600", comment: "text-blue-500", subscription: "text-gold",
  premium: "text-gold", user: "text-purple-500", alert: "text-destructive", system: "text-muted-foreground",
};

const NotificationBell = ({ adminLink = false }: { adminLink?: boolean }) => {
  const { notifications, unreadCount, markRead, markAllRead, remove } = useNotifications();
  const recent = notifications.slice(0, 8);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-muted h-9 w-9">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-destructive text-destructive-foreground rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-card">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <p className="font-display font-bold text-sm">Notifications</p>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead} className="h-7 text-xs gap-1">
              <Check className="w-3 h-3" /> Tout lire
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-96">
          {recent.length === 0 ? (
            <p className="p-6 text-center text-xs text-muted-foreground font-body">Aucune notification</p>
          ) : (
            <ul className="divide-y">
              {recent.map((n) => (
                <li key={n.id} className={`p-3 hover:bg-muted/40 transition ${!n.read ? "bg-gold/5" : ""}`}>
                  <div className="flex items-start gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${!n.read ? "bg-gold" : "bg-transparent"}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${typeColors[n.type] || ""}`}>{n.title}</p>
                      {n.description && <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{n.description}</p>}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })}
                        </span>
                        {n.link && (
                          <Link to={n.link} className="text-[10px] text-gold hover:underline inline-flex items-center gap-0.5" onClick={() => markRead(n.id)}>
                            Voir <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        )}
                        {!n.read && (
                          <button onClick={() => markRead(n.id)} className="text-[10px] text-muted-foreground hover:text-foreground">Marquer lu</button>
                        )}
                        <button onClick={() => remove(n.id)} className="text-[10px] text-muted-foreground hover:text-destructive ml-auto">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
        <div className="p-2 border-t">
          <Link to={adminLink ? "/admin/notifications" : "/compte/notifications"}>
            <Button variant="ghost" size="sm" className="w-full text-xs">Voir toutes les notifications</Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
