import { useState, useEffect, useMemo } from "react";
import {
  Upload, Search, Grid, List, Image, Video, Music, FileText, Trash2, Eye,
  MoreHorizontal, RefreshCw, Loader2, CheckSquare, Square, Copy, ExternalLink,
  X, HardDrive, Newspaper, Tv, Sparkles, Filter
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import FileUpload from "@/components/FileUpload";
import { getYouTubeThumbnail } from "@/components/MediaUpload";
import { cn } from "@/lib/utils";

interface UnifiedMedia {
  id: string;
  name: string;
  type: "image" | "video" | "audio" | "document";
  size: string | null;
  url: string;
  thumbnail?: string;
  source: "upload" | "article" | "video"; // origin
  meta?: string; // e.g. article title or category
  created_at: string;
}

const typeIcons: Record<string, typeof Image> = { image: Image, video: Video, audio: Music, document: FileText };
const typeColors: Record<string, string> = {
  image: "text-blue-500 bg-blue-50",
  video: "text-red-500 bg-red-50",
  audio: "text-purple-500 bg-purple-50",
  document: "text-amber-500 bg-amber-50",
};

const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

const getMediaType = (mimeOrName: string): UnifiedMedia["type"] => {
  const lower = mimeOrName.toLowerCase();
  if (lower.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(lower)) return "image";
  if (lower.startsWith("video/") || /\.(mp4|mov|avi|webm)$/i.test(lower)) return "video";
  if (lower.startsWith("audio/") || /\.(mp3|wav|ogg|m4a)$/i.test(lower)) return "audio";
  return "document";
};

const MediasManager = () => {
  const { user } = useAuth();
  const [uploads, setUploads] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sourceTab, setSourceTab] = useState<"all" | "articles" | "videos" | "uploads">("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<UnifiedMedia | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchAll = async () => {
    setLoading(true);
    const [up, art, vid] = await Promise.all([
      supabase.from("media").select("*").order("created_at", { ascending: false }),
      supabase.from("articles").select("id, title, category, cover_url, created_at").not("cover_url", "is", null).neq("cover_url", "").order("created_at", { ascending: false }),
      supabase.from("videos").select("id, title, category, source, url, thumbnail_url, created_at").order("created_at", { ascending: false }),
    ]);
    setUploads(up.data || []);
    setArticles(art.data || []);
    setVideos(vid.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    // Realtime: auto-update when articles, videos or media change
    const channel = supabase
      .channel("medias-aggregator")
      .on("postgres_changes", { event: "*", schema: "public", table: "articles" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "videos" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "media" }, fetchAll)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const allMedia: UnifiedMedia[] = useMemo(() => {
    const list: UnifiedMedia[] = [];
    uploads.forEach((m) => list.push({
      id: `upload-${m.id}`,
      name: m.name, type: (m.type as any) || "image", size: m.size, url: m.url,
      source: "upload", created_at: m.created_at,
    }));
    articles.forEach((a) => list.push({
      id: `article-${a.id}`,
      name: a.title, type: "image", size: null, url: a.cover_url,
      source: "article", meta: a.category, created_at: a.created_at,
    }));
    videos.forEach((v) => {
      const thumb = v.thumbnail_url || (v.source === "youtube" ? getYouTubeThumbnail(v.url) : "");
      list.push({
        id: `video-${v.id}`,
        name: v.title, type: "video", size: null, url: v.url, thumbnail: thumb,
        source: "video", meta: v.category, created_at: v.created_at,
      });
    });
    return list;
  }, [uploads, articles, videos]);

  const filtered = useMemo(() => {
    return allMedia
      .filter((m) => {
        if (sourceTab === "uploads" && m.source !== "upload") return false;
        if (sourceTab === "articles" && m.source !== "article") return false;
        if (sourceTab === "videos" && m.source !== "video") return false;
        if (filterType !== "all" && m.type !== filterType) return false;
        if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [allMedia, sourceTab, filterType, search]);

  const stats = useMemo(() => ({
    total: allMedia.length,
    articles: articles.length,
    videos: videos.length,
    uploads: uploads.length,
  }), [allMedia, articles, videos, uploads]);

  const handleUploadComplete = async (url: string, file: { name: string; size: number; type: string }) => {
    const sizeStr = file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(0)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    const { error } = await supabase.from("media").insert({
      name: file.name, type: getMediaType(file.type || file.name),
      size: sizeStr, url, uploaded_by: user?.id || null,
    });
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else { setUploadOpen(false); }
  };

  const handleDelete = async (m: UnifiedMedia) => {
    if (m.source !== "upload") {
      toast({ title: "Impossible", description: "Ce média provient d'un article ou d'une vidéo. Modifiez l'élément source pour le retirer.", variant: "destructive" });
      return;
    }
    const realId = m.id.replace("upload-", "");
    const { error } = await supabase.from("media").delete().eq("id", realId);
    if (!error) toast({ title: "Supprimé" });
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "URL copiée" });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });
  };

  return (
    <div className="p-4 lg:p-8 space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" /> Bibliothèque médias
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-0.5">
            Tous les visuels de la plateforme — articles, vidéos et fichiers uploadés. Mise à jour en temps réel.
          </p>
        </div>
        <Button className="bg-gold hover:bg-gold-dark text-primary text-sm gap-1.5" onClick={() => setUploadOpen(true)}>
          <Upload className="w-4 h-4" /> Importer un fichier
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total médias", value: stats.total, icon: HardDrive, color: "text-foreground" },
          { label: "Articles", value: stats.articles, icon: Newspaper, color: "text-blue-500" },
          { label: "Vidéos / TV", value: stats.videos, icon: Tv, color: "text-red-500" },
          { label: "Uploads", value: stats.uploads, icon: Upload, color: "text-gold" },
        ].map((s) => (
          <Card key={s.label} className="border-border/50 hover:shadow-card transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <s.icon className={cn("w-5 h-5", s.color)} />
              </div>
              <div>
                <p className="text-xl font-bold font-display leading-none">{s.value}</p>
                <p className="text-[11px] text-muted-foreground font-body mt-1">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Source tabs */}
      <Tabs value={sourceTab} onValueChange={(v) => setSourceTab(v as any)}>
        <TabsList className="grid grid-cols-4 w-full sm:w-auto sm:inline-flex">
          <TabsTrigger value="all" className="text-xs">Tout</TabsTrigger>
          <TabsTrigger value="articles" className="text-xs gap-1"><Newspaper className="w-3 h-3" /> Articles</TabsTrigger>
          <TabsTrigger value="videos" className="text-xs gap-1"><Tv className="w-3 h-3" /> Vidéos</TabsTrigger>
          <TabsTrigger value="uploads" className="text-xs gap-1"><Upload className="w-3 h-3" /> Uploads</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Toolbar */}
      <Card className="border-border/50">
        <CardContent className="p-3 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." className="pl-9 h-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
            {search && (
              <button className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setSearch("")}>
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32 h-9 text-sm"><Filter className="w-3 h-3 mr-1" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Vidéos</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="document">Docs</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-0.5 border rounded-md p-0.5">
              <Button variant={view === "grid" ? "default" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setView("grid")}>
                <Grid className="w-3.5 h-3.5" />
              </Button>
              <Button variant={view === "list" ? "default" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setView("list")}>
                <List className="w-3.5 h-3.5" />
              </Button>
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={fetchAll}>
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-12 text-center">
            <Image className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="font-display font-semibold">Aucun média</h3>
            <p className="text-sm text-muted-foreground font-body mt-1">
              {search ? "Aucun résultat pour votre recherche" : "La bibliothèque se remplira automatiquement quand vous publierez articles et vidéos"}
            </p>
          </CardContent>
        </Card>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((m) => {
            const Icon = typeIcons[m.type] || FileText;
            const display = m.thumbnail || (m.type === "image" ? m.url : null);
            return (
              <Card key={m.id} className="group relative hover:shadow-md transition-all overflow-hidden cursor-pointer" onClick={() => setPreviewMedia(m)}>
                <CardContent className="p-0">
                  <div className="aspect-square bg-muted/50 flex items-center justify-center relative overflow-hidden">
                    {display ? (
                      <img src={display} alt={m.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center", typeColors[m.type])}>
                        <Icon className="w-7 h-7" />
                      </div>
                    )}
                    {/* Source badge */}
                    <div className="absolute top-1.5 left-1.5">
                      {m.source === "article" && <Badge className="bg-blue-500/90 hover:bg-blue-500/90 text-white text-[9px] gap-1 px-1.5 h-4"><Newspaper className="w-2.5 h-2.5" /> Article</Badge>}
                      {m.source === "video" && <Badge className="bg-red-500/90 hover:bg-red-500/90 text-white text-[9px] gap-1 px-1.5 h-4"><Tv className="w-2.5 h-2.5" /> Vidéo</Badge>}
                      {m.source === "upload" && <Badge className="bg-gold/90 hover:bg-gold/90 text-primary text-[9px] gap-1 px-1.5 h-4"><Upload className="w-2.5 h-2.5" /> Upload</Badge>}
                    </div>
                    <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      <Button size="icon" variant="secondary" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setPreviewMedia(m); }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="secondary" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); copyUrl(m.url); }}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      {m.source === "upload" && (
                        <Button size="icon" variant="destructive" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleDelete(m); }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-medium truncate" title={m.name}>{m.name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-body capitalize">{m.type}</Badge>
                      {m.meta && <span className="text-[10px] text-muted-foreground font-body truncate">{m.meta}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left text-muted-foreground text-xs">
                  <th className="p-3">Fichier</th>
                  <th className="p-3 w-24">Source</th>
                  <th className="p-3 w-20">Type</th>
                  <th className="p-3 w-32 hidden md:table-cell">Date</th>
                  <th className="p-3 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const Icon = typeIcons[m.type] || FileText;
                  const display = m.thumbnail || (m.type === "image" ? m.url : null);
                  return (
                    <tr key={m.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {display ? (
                            <img src={display} alt="" className="w-9 h-9 rounded-md object-cover" loading="lazy" />
                          ) : (
                            <div className={cn("w-9 h-9 rounded-md flex items-center justify-center", typeColors[m.type])}>
                              <Icon className="w-4 h-4" />
                            </div>
                          )}
                          <span className="font-medium text-sm truncate max-w-[280px]">{m.name}</span>
                        </div>
                      </td>
                      <td className="p-3 capitalize text-xs text-muted-foreground">{m.source}</td>
                      <td className="p-3"><Badge variant="outline" className="text-[10px] capitalize">{m.type}</Badge></td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground text-xs">{formatDate(m.created_at)}</td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setPreviewMedia(m)}><Eye className="w-4 h-4 mr-2" /> Aperçu</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyUrl(m.url)}><Copy className="w-4 h-4 mr-2" /> Copier l'URL</DropdownMenuItem>
                            <DropdownMenuItem asChild><a href={m.url} target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4 mr-2" /> Ouvrir</a></DropdownMenuItem>
                            {m.source === "upload" && <><DropdownMenuSeparator /><DropdownMenuItem className="text-destructive" onClick={() => handleDelete(m)}><Trash2 className="w-4 h-4 mr-2" /> Supprimer</DropdownMenuItem></>}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="font-display">Importer un fichier</DialogTitle></DialogHeader>
          <FileUpload onUploadComplete={handleUploadComplete} className="mt-2" />
          <p className="text-[11px] text-muted-foreground font-body text-center">JPG, PNG, MP4, MP3, PDF — Max 50 MB</p>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewMedia} onOpenChange={() => setPreviewMedia(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle className="font-display truncate pr-8">{previewMedia?.name}</DialogTitle></DialogHeader>
          {previewMedia && (
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center min-h-[200px]">
                {previewMedia.type === "image" ? (
                  <img src={previewMedia.url} alt={previewMedia.name} className="max-w-full max-h-[60vh] object-contain" />
                ) : previewMedia.type === "video" && previewMedia.source !== "video" ? (
                  <video src={previewMedia.url} controls className="max-w-full max-h-[60vh]" />
                ) : previewMedia.thumbnail ? (
                  <img src={previewMedia.thumbnail} alt="" className="max-w-full max-h-[60vh] object-contain" />
                ) : (
                  <div className="p-8 text-center"><FileText className="w-16 h-16 text-muted-foreground mx-auto" /></div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="capitalize">{previewMedia.source}</Badge>
                <Badge variant="outline" className="capitalize">{previewMedia.type}</Badge>
                {previewMedia.meta && <Badge variant="outline">{previewMedia.meta}</Badge>}
                <Badge variant="outline">{formatDate(previewMedia.created_at)}</Badge>
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => copyUrl(previewMedia.url)}>
                  <Copy className="w-3.5 h-3.5" /> Copier l'URL
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" asChild>
                  <a href={previewMedia.url} target="_blank" rel="noreferrer"><ExternalLink className="w-3.5 h-3.5" /> Ouvrir</a>
                </Button>
                {previewMedia.source === "upload" && (
                  <Button variant="destructive" size="sm" className="gap-1.5 ml-auto" onClick={() => { handleDelete(previewMedia); setPreviewMedia(null); }}>
                    <Trash2 className="w-3.5 h-3.5" /> Supprimer
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediasManager;
