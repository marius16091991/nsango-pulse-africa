import { useState, useEffect } from "react";
import { Users, Search, MoreHorizontal, Mail, Ban, Shield, Crown, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-700", editor: "bg-blue-100 text-blue-700",
  reader: "bg-muted text-muted-foreground",
};

const UsersManager = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const fetchData = async () => {
    const [profRes, roleRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    setProfiles(profRes.data || []);
    const roleMap: Record<string, string> = {};
    (roleRes.data || []).forEach((r: any) => { roleMap[r.user_id] = r.role; });
    setRoles(roleMap);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const changeRole = async (userId: string, newRole: string) => {
    const current = roles[userId];
    if (current) {
      await supabase.from("user_roles").update({ role: newRole as any }).eq("user_id", userId);
    } else {
      await supabase.from("user_roles").insert({ user_id: userId, role: newRole as any });
    }
    toast({ title: "Rôle modifié", description: `Nouveau rôle : ${newRole}` });
    fetchData();
  };

  const filtered = profiles.filter((u) => {
    const name = u.display_name || "";
    if (search && !name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterRole !== "all" && (roles[u.user_id] || "reader") !== filterRole) return false;
    return true;
  });

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-display font-bold">Gestion des utilisateurs</h1>
        <p className="text-sm text-muted-foreground">{profiles.length} utilisateurs inscrits</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total", value: profiles.length, icon: Users },
          { label: "Admins", value: Object.values(roles).filter(r => r === "admin").length, icon: Shield },
          { label: "Éditeurs", value: Object.values(roles).filter(r => r === "editor").length, icon: Crown },
        ].map((s) => (
          <Card key={s.label}><CardContent className="p-4 flex items-center gap-3"><s.icon className="w-5 h-5 text-gold" /><div><p className="text-xl font-bold font-display">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div></CardContent></Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Éditeur</SelectItem>
                <SelectItem value="reader">Lecteur</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-left text-muted-foreground">
                <th className="p-3">Utilisateur</th><th className="p-3">Rôle</th><th className="p-3 hidden md:table-cell">Inscrit le</th><th className="p-3 w-10"></th>
              </tr></thead>
              <tbody>
                {filtered.map((u) => {
                  const role = roles[u.user_id] || "reader";
                  return (
                    <tr key={u.id} className="border-b border-border hover:bg-muted/30">
                      <td className="p-3">
                        <p className="font-medium">{u.display_name || "Sans nom"}</p>
                      </td>
                      <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${roleColors[role] || roleColors.reader}`}>{role}</span></td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground">{new Date(u.created_at).toLocaleDateString("fr-FR")}</td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => changeRole(u.user_id, "admin")} className="gap-2"><Shield className="w-4 h-4" /> Admin</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => changeRole(u.user_id, "editor")} className="gap-2"><Crown className="w-4 h-4" /> Éditeur</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => changeRole(u.user_id, "reader")} className="gap-2"><Users className="w-4 h-4" /> Lecteur</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersManager;
