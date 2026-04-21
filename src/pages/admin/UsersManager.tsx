import { useState, useEffect, useCallback } from "react";
import { Users, Search, MoreHorizontal, Shield, Crown, Loader2, UserPlus, Ban, Trash2, CheckCircle2, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Role = "admin" | "editor" | "premium" | "reader";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

interface UserRoleRow {
  user_id: string;
  role: Role;
  priority: number;
}

const roleStyles: Record<Role, string> = {
  admin: "bg-destructive/15 text-destructive border-destructive/30",
  editor: "bg-primary/15 text-primary border-primary/30",
  premium: "bg-gold/15 text-gold border-gold/30",
  reader: "bg-muted text-muted-foreground border-border",
};

const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  editor: "Éditeur",
  premium: "Premium",
  reader: "Lecteur",
};

const UsersManager = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Record<string, UserRoleRow>>({});
  const [emails, setEmails] = useState<Record<string, { email: string; banned_until: string | null }>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Profile | null>(null);

  // Create form
  const [form, setForm] = useState({ email: "", password: "", display_name: "", role: "reader" as Role, priority: 0 });

  const callAdmin = async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("admin-users", { body });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [profRes, roleRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role, priority"),
    ]);
    setProfiles((profRes.data as Profile[]) || []);
    const roleMap: Record<string, UserRoleRow> = {};
    ((roleRes.data as UserRoleRow[]) || []).forEach((r) => { roleMap[r.user_id] = r; });
    setRoles(roleMap);
    try {
      const res = await callAdmin({ action: "list_emails" });
      setEmails(res.users || {});
    } catch {
      // non-admin or function unavailable; ignore
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const setRoleAndPriority = async (userId: string, newRole: Role, priority?: number) => {
    setBusy(userId);
    try {
      const current = roles[userId];
      const payload = { role: newRole, priority: priority ?? current?.priority ?? 0 };
      if (current) {
        await supabase.from("user_roles").update(payload).eq("user_id", userId);
      } else {
        await supabase.from("user_roles").insert({ user_id: userId, ...payload });
      }
      toast({ title: "Rôle mis à jour", description: `${ROLE_LABELS[newRole]} (priorité ${payload.priority})` });
      await fetchData();
    } catch (e) {
      toast({ title: "Erreur", description: (e as Error).message, variant: "destructive" });
    } finally { setBusy(null); }
  };

  const adjustPriority = async (userId: string, delta: number) => {
    const r = roles[userId];
    if (!r) return setRoleAndPriority(userId, "reader", Math.max(0, delta));
    await setRoleAndPriority(userId, r.role, Math.max(0, (r.priority || 0) + delta));
  };

  const createUser = async () => {
    if (!form.email || !form.password) {
      toast({ title: "Champs requis", description: "Email et mot de passe sont obligatoires", variant: "destructive" });
      return;
    }
    setBusy("create");
    try {
      await callAdmin({ action: "create", ...form });
      toast({ title: "Utilisateur créé", description: form.email });
      setCreateOpen(false);
      setForm({ email: "", password: "", display_name: "", role: "reader", priority: 0 });
      await fetchData();
    } catch (e) {
      toast({ title: "Création échouée", description: (e as Error).message, variant: "destructive" });
    } finally { setBusy(null); }
  };

  const toggleActive = async (p: Profile) => {
    setBusy(p.user_id);
    try {
      await callAdmin({ action: p.is_active ? "disable" : "enable", user_id: p.user_id });
      toast({ title: p.is_active ? "Compte désactivé" : "Compte réactivé" });
      await fetchData();
    } catch (e) {
      toast({ title: "Erreur", description: (e as Error).message, variant: "destructive" });
    } finally { setBusy(null); }
  };

  const deleteUser = async () => {
    if (!confirmDelete) return;
    setBusy(confirmDelete.user_id);
    try {
      await callAdmin({ action: "delete", user_id: confirmDelete.user_id });
      toast({ title: "Utilisateur supprimé" });
      setConfirmDelete(null);
      await fetchData();
    } catch (e) {
      toast({ title: "Suppression échouée", description: (e as Error).message, variant: "destructive" });
    } finally { setBusy(null); }
  };

  const filtered = profiles
    .filter((u) => {
      const name = u.display_name || "";
      const email = emails[u.user_id]?.email || "";
      if (search && !(name.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase()))) return false;
      if (filterRole !== "all" && (roles[u.user_id]?.role || "reader") !== filterRole) return false;
      return true;
    })
    .sort((a, b) => (roles[b.user_id]?.priority || 0) - (roles[a.user_id]?.priority || 0));

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>;

  const roleCount = (r: Role) => Object.values(roles).filter((x) => x.role === r).length;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Gestion des utilisateurs</h1>
          <p className="text-sm text-muted-foreground">{profiles.length} utilisateurs inscrits</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><UserPlus className="w-4 h-4" /> Nouvel utilisateur</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Créer un utilisateur</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Mot de passe *</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
              <div><Label>Nom affiché</Label><Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Rôle</Label>
                  <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Éditeur</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="reader">Lecteur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Priorité</Label><Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} /></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
              <Button onClick={createUser} disabled={busy === "create"}>
                {busy === "create" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { label: "Total", value: profiles.length, icon: Users },
          { label: "Admins", value: roleCount("admin"), icon: Shield },
          { label: "Éditeurs", value: roleCount("editor"), icon: Crown },
          { label: "Désactivés", value: profiles.filter((p) => !p.is_active).length, icon: Ban },
        ] as const).map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className="w-5 h-5 text-gold" />
              <div><p className="text-xl font-bold font-display">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Rechercher nom ou email..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Éditeur</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="reader">Lecteur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="p-3">Utilisateur</th>
                  <th className="p-3">Rôle</th>
                  <th className="p-3">Priorité</th>
                  <th className="p-3 hidden md:table-cell">Statut</th>
                  <th className="p-3 hidden lg:table-cell">Inscrit le</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const r = roles[u.user_id];
                  const role = (r?.role || "reader") as Role;
                  const priority = r?.priority || 0;
                  const email = emails[u.user_id]?.email;
                  const isBusy = busy === u.user_id;
                  return (
                    <tr key={u.id} className="border-b border-border hover:bg-muted/30">
                      <td className="p-3">
                        <p className="font-medium">{u.display_name || "Sans nom"}</p>
                        {email && <p className="text-xs text-muted-foreground">{email}</p>}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className={roleStyles[role]}>{ROLE_LABELS[role]}</Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => adjustPriority(u.user_id, -1)} disabled={isBusy || priority === 0}><ArrowDown className="w-3 h-3" /></Button>
                          <span className="font-mono text-sm w-6 text-center">{priority}</span>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => adjustPriority(u.user_id, 1)} disabled={isBusy}><ArrowUp className="w-3 h-3" /></Button>
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        {u.is_active ? (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 gap-1"><CheckCircle2 className="w-3 h-3" /> Actif</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 gap-1"><Ban className="w-3 h-3" /> Désactivé</Badge>
                        )}
                      </td>
                      <td className="p-3 hidden lg:table-cell text-muted-foreground">{new Date(u.created_at).toLocaleDateString("fr-FR")}</td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isBusy}>
                              {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-4 h-4" />}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => setRoleAndPriority(u.user_id, "admin")} className="gap-2"><Shield className="w-4 h-4" /> Définir Admin</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setRoleAndPriority(u.user_id, "editor")} className="gap-2"><Crown className="w-4 h-4" /> Définir Éditeur</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setRoleAndPriority(u.user_id, "premium")} className="gap-2"><Crown className="w-4 h-4" /> Définir Premium</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setRoleAndPriority(u.user_id, "reader")} className="gap-2"><Users className="w-4 h-4" /> Définir Lecteur</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => toggleActive(u)} className="gap-2">
                              {u.is_active ? <><Ban className="w-4 h-4" /> Désactiver</> : <><CheckCircle2 className="w-4 h-4" /> Réactiver</>}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setConfirmDelete(u)} className="gap-2 text-destructive focus:text-destructive">
                              <Trash2 className="w-4 h-4" /> Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Aucun utilisateur trouvé</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer définitivement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprime <strong>{confirmDelete?.display_name || "cet utilisateur"}</strong> et toutes ses données associées. Elle est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={deleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersManager;