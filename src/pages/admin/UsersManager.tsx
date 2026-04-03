import { useState } from "react";
import { Users, Search, MoreHorizontal, Mail, Ban, Shield, Eye, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const users = [
  { id: 1, name: "Amara Diallo", email: "amara@example.com", role: "admin", status: "active", joined: "2025-01-15", premium: true },
  { id: 2, name: "Jean Mabika", email: "jean.m@example.com", role: "editor", status: "active", joined: "2025-03-20", premium: true },
  { id: 3, name: "Fatou Ndiaye", email: "fatou@example.com", role: "author", status: "active", joined: "2025-06-10", premium: true },
  { id: 4, name: "Paul Essomba", email: "paul.e@example.com", role: "user", status: "active", joined: "2026-01-05", premium: true },
  { id: 5, name: "Marie Kouassi", email: "marie.k@example.com", role: "user", status: "suspended", joined: "2025-11-22", premium: false },
  { id: 6, name: "Omar Sy", email: "omar.s@example.com", role: "user", status: "active", joined: "2026-02-14", premium: false },
  { id: 7, name: "Chimamanda A.", email: "chima@example.com", role: "author", status: "active", joined: "2025-08-03", premium: false },
];

const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  editor: "bg-blue-100 text-blue-700",
  author: "bg-purple-100 text-purple-700",
  user: "bg-muted text-muted-foreground",
};

const UsersManager = () => {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const filtered = users.filter((u) => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterRole !== "all" && u.role !== filterRole) return false;
    return true;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Gestion des utilisateurs</h1>
        <p className="text-sm text-muted-foreground font-body">{users.length} utilisateurs enregistrés</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: users.length, icon: Users },
          { label: "Admins", value: users.filter((u) => u.role === "admin").length, icon: Shield },
          { label: "Premium", value: users.filter((u) => u.premium).length, icon: Crown },
          { label: "Suspendus", value: users.filter((u) => u.status === "suspended").length, icon: Ban },
        ].map((s) => (
          <Card key={s.label}><CardContent className="p-4 flex items-center gap-3"><s.icon className="w-5 h-5 text-gold" /><div><p className="text-xl font-bold font-display">{s.value}</p><p className="text-xs text-muted-foreground font-body">{s.label}</p></div></CardContent></Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Rechercher un utilisateur..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Éditeur</SelectItem>
                <SelectItem value="author">Auteur</SelectItem>
                <SelectItem value="user">Utilisateur</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-left text-muted-foreground font-body">
                <th className="p-3">Utilisateur</th><th className="p-3">Rôle</th><th className="p-3 hidden md:table-cell">Inscrit le</th><th className="p-3">Statut</th><th className="p-3 w-10"></th>
              </tr></thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-border hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                        {u.premium && <Crown className="w-3.5 h-3.5 text-gold" />}
                      </div>
                    </td>
                    <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold font-body capitalize ${roleColors[u.role]}`}>{u.role}</span></td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground font-body">{u.joined}</td>
                    <td className="p-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold font-body ${u.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {u.status === "active" ? "Actif" : "Suspendu"}
                      </span>
                    </td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2"><Eye className="w-4 h-4" /> Voir</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2"><Mail className="w-4 h-4" /> Email</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2"><Shield className="w-4 h-4" /> Changer rôle</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive"><Ban className="w-4 h-4" /> Suspendre</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersManager;
