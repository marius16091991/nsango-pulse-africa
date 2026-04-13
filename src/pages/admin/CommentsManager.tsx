import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Search, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  approved: { label: "Approuvé", color: "bg-green-100 text-green-700", icon: CheckCircle },
  pending: { label: "En attente", color: "bg-amber-100 text-amber-700", icon: Clock },
  flagged: { label: "Signalé", color: "bg-red-100 text-red-700", icon: AlertTriangle },
  rejected: { label: "Rejeté", color: "bg-muted text-muted-foreground", icon: XCircle },
};

const CommentsManager = () => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*, articles(title)")
      .order("created_at", { ascending: false });
    setComments(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchComments(); }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("comments").update({ status: newStatus }).eq("id", id);
    if (!error) {
      toast({ title: `Commentaire ${newStatus === "approved" ? "approuvé" : "rejeté"}` });
      fetchComments();
    }
  };

  const deleteComment = async (id: string) => {
    await supabase.from("comments").delete().eq("id", id);
    toast({ title: "Commentaire supprimé" });
    fetchComments();
  };

  const filtered = comments.filter((c) => {
    if (search && !c.content.toLowerCase().includes(search.toLowerCase()) && !c.author_name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    return true;
  });

  const pendingCount = comments.filter(c => c.status === "pending").length;
  const flaggedCount = comments.filter(c => c.status === "flagged").length;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-display font-bold">Modération des commentaires</h1>
        <p className="text-sm text-muted-foreground">{pendingCount} en attente · {flaggedCount} signalé{flaggedCount > 1 ? "s" : ""}</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
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

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const cfg = statusConfig[c.status] || statusConfig.pending;
            const StatusIcon = cfg.icon;
            return (
              <Card key={c.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{c.author_name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${cfg.color}`}>
                          <StatusIcon className="w-3 h-3" /> {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        sur « {c.articles?.title || "Article"} » · {new Date(c.created_at).toLocaleString("fr-FR")}
                      </p>
                      <p className="text-sm">{c.content}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {c.status !== "approved" && (
                        <Button size="sm" variant="outline" className="text-xs text-green-700 border-green-200 hover:bg-green-50 gap-1" onClick={() => updateStatus(c.id, "approved")}>
                          <CheckCircle className="w-3 h-3" /> Approuver
                        </Button>
                      )}
                      {c.status !== "rejected" && (
                        <Button size="sm" variant="outline" className="text-xs text-destructive border-red-200 hover:bg-red-50 gap-1" onClick={() => updateStatus(c.id, "rejected")}>
                          <XCircle className="w-3 h-3" /> Rejeter
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Aucun commentaire trouvé</p>}
        </div>
      )}
    </div>
  );
};

export default CommentsManager;
