import { useEffect, useState } from "react";
import { Tv, Plus, Search, Trash2, Edit, Loader2, Play, Eye, Star, Youtube, Upload as UploadIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import MediaUpload, { getYouTubeThumbnail } from "@/components/MediaUpload";

const categories = ["Interviews", "Reportages", "Documentaires", "Événements", "Coulisses", "Direct"];
const slots = [
  { value: "morning", label: "Matinale (6h-12h)" },
  { value: "afternoon", label: "Journée (12h-18h)" },
  { value: "prime", label: "Prime time (18h-23h)" },
  { value: "night", label: "Nocturne (23h-6h)" },
];

const VideosManager = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Reportages");
  const [duration, setDuration] = useState("");
  const [slot, setSlot] = useState<string>("prime");
  const [featured, setFeatured] = useState(false);
  const [media, setMedia] = useState<{ source: "upload" | "youtube"; url: string; thumbnail?: string } | null>(null);

  const fetchVideos = async () => {
    const { data } = await supabase.from("videos").select("*").order("created_at", { ascending: false });
    setVideos(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchVideos(); }, []);

  const reset = () => {
    setTitle(""); setDescription(""); setCategory("Reportages");
    setDuration(""); setSlot("prime"); setFeatured(false);
    setMedia(null); setEditId(null);
  };

  const openEdit = (v: any) => {
    setTitle(v.title); setDescription(v.description || ""); setCategory(v.category);
    setDuration(v.duration || ""); setSlot(v.program_slot || "prime"); setFeatured(v.featured);
    setMedia({ source: v.source, url: v.url, thumbnail: v.thumbnail_url });
    setEditId(v.id); setOpen(true);
  };

  const save = async (status: "draft" | "published") => {
    if (!title.trim()) return toast({ title: "Titre requis", variant: "destructive" });
    if (!media?.url) return toast({ title: "Vidéo requise", description: "Importez un fichier ou collez une URL YouTube", variant: "destructive" });

    setSaving(true);
    const thumbnail = media.thumbnail || (media.source === "youtube" ? getYouTubeThumbnail(media.url) : "");
    const payload = {
      title, description, category, duration,
      program_slot: slot, featured, status,
      source: media.source, url: media.url, thumbnail_url: thumbnail,
      created_by: user?.id,
    };

    const { error } = editId
      ? await supabase.from("videos").update(payload).eq("id", editId)
      : await supabase.from("videos").insert(payload);

    setSaving(false);
    if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    toast({ title: editId ? "Vidéo modifiée ✓" : status === "published" ? "Vidéo publiée ✓" : "Brouillon enregistré ✓" });
    reset(); setOpen(false); fetchVideos();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("videos").delete().eq("id", id);
    if (!error) { toast({ title: "Vidéo supprimée" }); fetchVideos(); }
  };

  const togglePublish = async (v: any) => {
    const newStatus = v.status === "published" ? "draft" : "published";
    await supabase.from("videos").update({ status: newStatus }).eq("id", v.id);
    fetchVideos();
  };

  const filtered = videos.filter((v) => v.title.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: videos.length,
    published: videos.filter((v) => v.status === "published").length,
    youtube: videos.filter((v) => v.source === "youtube").length,
    uploads: videos.filter((v) => v.source === "upload").length,
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Tv className="w-6 h-6 text-gold" /> Vidéos & Chaîne TV</h1>
          <p className="text-sm text-muted-foreground">Importez depuis l'appareil ou intégrez une vidéo YouTube</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); setOpen(o); }}>
          <DialogTrigger asChild>
            <Button className="bg-gold hover:bg-gold-dark text-primary text-sm gap-1.5">
              <Plus className="w-4 h-4" /> Nouvelle vidéo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">{editId ? "Modifier la vidéo" : "Publier une vidéo"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-3">
              <div>
                <Label className="text-sm">Source de la vidéo *</Label>
                <p className="text-[11px] text-muted-foreground font-body mb-2">Importez un fichier depuis votre appareil ou intégrez une vidéo YouTube</p>
                <MediaUpload
                  accept="video/*"
                  initialSource={media?.source || "upload"}
                  initialUrl={media?.url || ""}
                  onChange={setMedia}
                />
              </div>
              <div>
                <Label className="text-sm">Titre *</Label>
                <Input className="mt-1" placeholder="Titre du programme" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <Label className="text-sm">Description</Label>
                <Textarea className="mt-1" rows={3} placeholder="Présentation du programme..." value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Catégorie</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Durée</Label>
                  <Input className="mt-1" placeholder="ex: 12:34" value={duration} onChange={(e) => setDuration(e.target.value)} />
                </div>
              </div>
              <div>
                <Label className="text-sm">Créneau de diffusion (grille TV)</Label>
                <Select value={slot} onValueChange={setSlot}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{slots.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
                <Label htmlFor="featured" className="text-sm">Programme en vedette (en tête de chaîne)</Label>
              </div>
              <div className="flex gap-2 justify-end pt-2 border-t">
                <Button variant="outline" onClick={() => save("draft")} disabled={saving}>Brouillon</Button>
                <Button className="bg-gold hover:bg-gold-dark text-primary gap-1.5" onClick={() => save("published")} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tv className="w-4 h-4" />} Publier
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, icon: Tv, color: "text-foreground" },
          { label: "Publiées", value: stats.published, icon: Eye, color: "text-green-600" },
          { label: "YouTube", value: stats.youtube, icon: Youtube, color: "text-red-500" },
          { label: "Uploads", value: stats.uploads, icon: UploadIcon, color: "text-blue-500" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <div>
                <p className="text-xl font-bold font-display leading-none">{s.value}</p>
                <p className="text-[11px] text-muted-foreground font-body">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher une vidéo..." className="pl-9 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-12 text-center">
            <Tv className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="font-display font-semibold">Aucune vidéo</h3>
            <p className="text-sm text-muted-foreground font-body mt-1">Ajoutez votre première vidéo YouTube ou un upload</p>
            <Button className="mt-4 bg-gold hover:bg-gold-dark text-primary" onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Nouvelle vidéo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((v) => {
            const thumb = v.thumbnail_url || (v.source === "youtube" ? getYouTubeThumbnail(v.url) : "");
            return (
              <Card key={v.id} className="overflow-hidden group hover:shadow-card transition-shadow">
                <div className="relative aspect-video bg-muted">
                  {thumb ? (
                    <img src={thumb} alt={v.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Play className="w-10 h-10 text-muted-foreground/40" /></div>
                  )}
                  <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-12 h-12 text-gold fill-gold" />
                  </div>
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    {v.featured && <Badge className="bg-gold text-primary text-[10px] gap-1"><Star className="w-2.5 h-2.5 fill-primary" /> Vedette</Badge>}
                    {v.source === "youtube" ? (
                      <Badge variant="destructive" className="text-[10px] gap-1"><Youtube className="w-2.5 h-2.5" /> YouTube</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] gap-1"><UploadIcon className="w-2.5 h-2.5" /> Upload</Badge>
                    )}
                  </div>
                  {v.duration && (
                    <span className="absolute bottom-2 right-2 bg-primary/80 text-primary-foreground text-xs px-2 py-0.5 rounded font-body">{v.duration}</span>
                  )}
                </div>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-sm line-clamp-2">{v.title}</p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-body mt-1">
                        <span>{v.category}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {v.views}</span>
                      </div>
                    </div>
                    <Badge variant={v.status === "published" ? "default" : "outline"} className={`text-[10px] shrink-0 ${v.status === "published" ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}`}>
                      {v.status === "published" ? "En ligne" : "Brouillon"}
                    </Badge>
                  </div>
                  <div className="flex gap-1.5 pt-2 border-t border-border/50">
                    <Button variant="ghost" size="sm" className="flex-1 text-xs h-7" onClick={() => openEdit(v)}>
                      <Edit className="w-3 h-3 mr-1" /> Modifier
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => togglePublish(v)}>
                      {v.status === "published" ? "Dépublier" : "Publier"}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => remove(v.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VideosManager;
