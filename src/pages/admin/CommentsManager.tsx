import { useState } from "react";
import { MessageSquare, CheckCircle, XCircle, Clock, Search, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const comments = [
  { id: 1, author: "Amara Diallo", article: "Aliko Dangote : L'empire", content: "Excellent article, très inspirant ! Dangote est un modèle pour toute l'Afrique.", date: "2026-04-02 14:30", status: "approved" },
  { id: 2, author: "Jean M.", article: "Fashion Week de Lagos", content: "J'adore la couverture de cet événement. Nsango est toujours au top !", date: "2026-04-02 12:15", status: "approved" },
  { id: 3, author: "User123", article: "Les startups fintech", content: "Ce contenu est sponsorisé, non ? Vous devriez le mentionner clairement.", date: "2026-04-01 18:45", status: "pending" },
  { id: 4, author: "SpamBot", article: "Portrait : Wangari Maathai", content: "Buy cheap watches at www.spam-link.com", date: "2026-04-01 03:22", status: "flagged" },
  { id: 5, author: "Marie K.", article: "Burna Boy : talent émergent", content: "Burna Boy mérite cette reconnaissance. La musique africaine rayonne dans le monde !", date: "2026-03-31 20:10", status: "approved" },
  { id: 6, author: "Paul E.", article: "Interview : Ngozi Okonjo-Iweala", content: "Quand sera publiée la suite de cette interview ?", date: "2026-04-02 09:00", status: "pending" },
];

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  approved: { label: "Approuvé", color: "bg-green-100 text-green-700", icon: CheckCircle },
  pending: { label: "En attente", color: "bg-amber-100 text-amber-700", icon: Clock },
  flagged: { label: "Signalé", color: "bg-red-100 text-red-700", icon: AlertTriangle },
  rejected: { label: "Rejeté", color: "bg-muted text-muted-foreground", icon: XCircle },
};

const CommentsManager = () => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = comments.filter((c) => {
    if (search && !c.content.toLowerCase().includes(search.toLowerCase()) && !c.author.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    return true;
  });

  const pendingCount = comments.filter((c) => c.status === "pending").length;
  const flaggedCount = comments.filter((c) => c.status === "flagged").length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Modération des commentaires</h1>
        <p className="text-sm text-muted-foreground font-body">
          {pendingCount} en attente · {flaggedCount} signalé{flaggedCount > 1 ? "s" : ""}
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvés</SelectItem>
                <SelectItem value="flagged">Signalés</SelectItem>
                <SelectItem value="rejected">Rejetés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filtered.map((c) => {
          const cfg = statusConfig[c.status];
          const StatusIcon = cfg.icon;
          return (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{c.author}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold font-body flex items-center gap-1 ${cfg.color}`}>
                        <StatusIcon className="w-3 h-3" /> {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-body mb-2">
                      sur « {c.article} » · {c.date}
                    </p>
                    <p className="text-sm font-body">{c.content}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {c.status !== "approved" && (
                      <Button size="sm" variant="outline" className="text-xs font-body text-green-700 border-green-200 hover:bg-green-50 gap-1">
                        <CheckCircle className="w-3 h-3" /> Approuver
                      </Button>
                    )}
                    {c.status !== "rejected" && (
                      <Button size="sm" variant="outline" className="text-xs font-body text-destructive border-red-200 hover:bg-red-50 gap-1">
                        <XCircle className="w-3 h-3" /> Rejeter
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CommentsManager;
