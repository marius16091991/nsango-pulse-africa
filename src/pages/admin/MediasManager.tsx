import { useState, useEffect, useMemo } from "react";
import {
  Upload, Search, Grid, List, Image, Video, Music, FileText, Trash2, Eye,
  Download, MoreHorizontal, RefreshCw, Loader2, CheckSquare, Square, Info,
  Copy, ExternalLink, SlidersHorizontal, X, Calendar, HardDrive
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import FileUpload from "@/components/FileUpload";
import { cn } from "@/lib/utils";

interface Media {
  id: string;
  name: string;
  type: string;
  size: string | null;
  url: string;
  uploaded_by: string | null;
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
const formatSize = (s: string | null) => s || "—";

const getMediaType = (mimeOrName: string): string => {
  const lower = mimeOrName.toLowerCase();
  if (lower.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(lower)) return "image";
  if (lower.startsWith("video/") || /\.(mp4|mov|avi|webm)$/i.test(lower)) return "video";
  if (lower.startsWith("audio/") || /\.(mp3|wav|ogg|m4a)$/i.test(lower)) return "audio";
  return "document";
};

const MediasManager = () => {
  const { user } = useAuth();
  const [medias, setMedias] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "name" | "size">("date");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<Media | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const fetchMedias = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("media").select("*").order("created_at", { ascending: false });
    if (!error && data) setMedias(data);
    setLoading(false);
  };

  useEffect(() => { fetchMedias(); }, []);

  const handleUploadComplete = async (url: string, file: { name: string; size: number; type: string }) => {
    const sizeStr = file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(0)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    const { error } = await supabase.from("media").insert({
      name: file.name,
      type: getMediaType(file.type || file.name),
      size: sizeStr,
      url,
      uploaded_by: user?.id || null,
    });

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      fetchMedias();
      setUploadOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    const m = medias.find((x) => x.id === id);
    const { error } = await supabase.from("media").delete().eq("id", id);
    if (!error) {
      setMedias((prev) => prev.filter((x) => x.id !== id));
      setSelectedIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
      toast({ title: "Supprimé", description: m?.name });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setDeleting(true);
    const { error } = await supabase.from("media").delete().in("id", Array.from(selectedIds));
    if (!error) {
      setMedias((prev) => prev.filter((x) => !selectedIds.has(x.id)));
      toast({ title: `${selectedIds.size} fichier(s) supprimé(s)` });
      setSelectedIds(new Set());
    }
    setDeleting(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((m) => m.id)));
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "URL copiée" });
  };

  const filtered = useMemo(() => {
    let result = medias.filter((m) => {
      if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterType !== "all" && m.type !== filterType) return false;
      return true;
    });
    if (sortBy === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "date") result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return result;
  }, [medias, search, filterType, sortBy]);

  const stats = useMemo(() => ({
    total: medias.length,
    images: medias.filter((m) => m.type === "image").length,
    videos: medias.filter((m) => m.type === "video").length,
    audio: medias.filter((m) => m.type === "audio").length,
    docs: medias.filter((m) => m.type === "document").length,
  }), [medias]);

  return (
    <div className="p-4 lg:p-8 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Bibliothèque médias</h1>
          <p className="text-sm text-muted-foreground font-body mt-0.5">
            Gérez tous vos fichiers multimédias
          </p>
        </div>
        <Button
          className="bg-gold hover:bg-gold-dark text-primary font-body text-sm gap-1.5 shadow-sm"
          onClick={() => setUploadOpen(true)}
        >
          <Upload className="w-4 h-4" /> Uploader un fichier
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, icon: HardDrive, color: "text-foreground" },
          { label: "Images", value: stats.images, icon: Image, color: "text-blue-500" },
          { label: "Vidéos", value: stats.videos, icon: Video, color: "text-red-500" },
          { label: "Audio", value: stats.audio, icon: Music, color: "text-purple-500" },
          { label: "Documents", value: stats.docs, icon: FileText, color: "text-amber-500" },
        ].map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-3 flex items-center gap-3">
              <s.icon className={cn("w-5 h-5", s.color)} />
              <div>
                <p className="text-lg font-bold font-display leading-none">{s.value}</p>
                <p className="text-[11px] text-muted-foreground font-body">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <Card className="border-border/50">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un fichier..."
                className="pl-9 h-9 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setSearch("")}>
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="video">Vidéos</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="w-28 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Récent</SelectItem>
                  <SelectItem value="name">Nom A-Z</SelectItem>
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
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={fetchMedias}>
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              </Button>
            </div>
          </div>

          {/* Bulk actions */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
              <span className="text-xs font-body text-muted-foreground">
                {selectedIds.size} sélectionné(s)
              </span>
              <Button
                variant="destructive"
                size="sm"
                className="text-xs h-7 gap-1"
                disabled={deleting}
                onClick={handleBulkDelete}
              >
                {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                Supprimer
              </Button>
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setSelectedIds(new Set())}>
                Désélectionner
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gold" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Image className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg">Aucun fichier</h3>
            <p className="text-sm text-muted-foreground font-body mt-1">
              {search ? "Aucun résultat pour votre recherche" : "Commencez par uploader vos premiers fichiers"}
            </p>
            {!search && (
              <Button className="mt-4 bg-gold hover:bg-gold-dark text-primary" onClick={() => setUploadOpen(true)}>
                <Upload className="w-4 h-4 mr-1.5" /> Uploader
              </Button>
            )}
          </CardContent>
        </Card>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((m) => {
            const Icon = typeIcons[m.type] || FileText;
            const isSelected = selectedIds.has(m.id);
            return (
              <Card
                key={m.id}
                className={cn(
                  "group relative hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden",
                  isSelected && "ring-2 ring-gold"
                )}
                onClick={() => toggleSelect(m.id)}
              >
                <CardContent className="p-0">
                  <div className="aspect-square bg-muted/50 flex items-center justify-center relative overflow-hidden">
                    {m.type === "image" && m.url !== "#" ? (
                      <img src={m.url} alt={m.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center", typeColors[m.type])}>
                        <Icon className="w-7 h-7" />
                      </div>
                    )}

                    {/* Checkbox overlay */}
                    <div className={cn(
                      "absolute top-2 left-2 transition-opacity",
                      isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}>
                      {isSelected
                        ? <CheckSquare className="w-5 h-5 text-gold drop-shadow" />
                        : <Square className="w-5 h-5 text-primary-foreground drop-shadow" />
                      }
                    </div>

                    {/* Actions overlay */}
                    <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-lg"
                        onClick={(e) => { e.stopPropagation(); setPreviewMedia(m); }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-lg"
                        onClick={(e) => { e.stopPropagation(); copyUrl(m.url); }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8 rounded-lg"
                        onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-medium truncate">{m.name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-body capitalize">{m.type}</Badge>
                      <span className="text-[10px] text-muted-foreground font-body">{formatSize(m.size)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-border/50 overflow-hidden">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left text-muted-foreground font-body text-xs">
                  <th className="p-3 w-10">
                    <button onClick={toggleSelectAll}>
                      {selectedIds.size === filtered.length && filtered.length > 0
                        ? <CheckSquare className="w-4 h-4 text-gold" />
                        : <Square className="w-4 h-4" />
                      }
                    </button>
                  </th>
                  <th className="p-3">Fichier</th>
                  <th className="p-3 w-24">Type</th>
                  <th className="p-3 w-24 hidden md:table-cell">Taille</th>
                  <th className="p-3 w-32 hidden md:table-cell">Date</th>
                  <th className="p-3 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const Icon = typeIcons[m.type] || FileText;
                  const isSelected = selectedIds.has(m.id);
                  return (
                    <tr
                      key={m.id}
                      className={cn(
                        "border-b border-border/50 hover:bg-muted/20 transition-colors",
                        isSelected && "bg-gold/5"
                      )}
                    >
                      <td className="p-3">
                        <button onClick={() => toggleSelect(m.id)}>
                          {isSelected ? <CheckSquare className="w-4 h-4 text-gold" /> : <Square className="w-4 h-4 text-muted-foreground" />}
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {m.type === "image" && m.url !== "#" ? (
                            <img src={m.url} alt="" className="w-9 h-9 rounded-md object-cover" loading="lazy" />
                          ) : (
                            <div className={cn("w-9 h-9 rounded-md flex items-center justify-center", typeColors[m.type])}>
                              <Icon className="w-4 h-4" />
                            </div>
                          )}
                          <span className="font-medium text-sm truncate max-w-[200px]">{m.name}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-[10px] capitalize font-body">{m.type}</Badge>
                      </td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground font-body text-xs">{formatSize(m.size)}</td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground font-body text-xs">{formatDate(m.created_at)}</td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setPreviewMedia(m)}>
                              <Eye className="w-4 h-4 mr-2" /> Aperçu
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyUrl(m.url)}>
                              <Copy className="w-4 h-4 mr-2" /> Copier l'URL
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a href={m.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 mr-2" /> Ouvrir
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(m.id)}>
                              <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                            </DropdownMenuItem>
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
          <DialogHeader>
            <DialogTitle className="font-display">Uploader un fichier</DialogTitle>
          </DialogHeader>
          <FileUpload onUploadComplete={handleUploadComplete} className="mt-2" />
          <p className="text-[11px] text-muted-foreground font-body text-center mt-1">
            Formats acceptés : JPG, PNG, GIF, WebP, MP4, MP3, PDF, DOC · Max 50 MB
          </p>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewMedia} onOpenChange={() => setPreviewMedia(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display truncate pr-8">{previewMedia?.name}</DialogTitle>
          </DialogHeader>
          {previewMedia && (
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center min-h-[200px]">
                {previewMedia.type === "image" ? (
                  <img src={previewMedia.url} alt={previewMedia.name} className="max-w-full max-h-[60vh] object-contain" />
                ) : previewMedia.type === "video" ? (
                  <video src={previewMedia.url} controls className="max-w-full max-h-[60vh]" />
                ) : previewMedia.type === "audio" ? (
                  <div className="p-8 w-full">
                    <audio src={previewMedia.url} controls className="w-full" />
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground mt-3 font-body">Aperçu non disponible</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-body">Type</p>
                  <p className="font-medium capitalize">{previewMedia.type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-body">Taille</p>
                  <p className="font-medium">{formatSize(previewMedia.size)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-body">Date d'ajout</p>
                  <p className="font-medium">{formatDate(previewMedia.created_at)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-body">URL</p>
                  <button onClick={() => copyUrl(previewMedia.url)} className="text-gold text-xs hover:underline flex items-center gap-1">
                    <Copy className="w-3 h-3" /> Copier l'URL
                  </button>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
                  <a href={previewMedia.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5" /> Ouvrir
                  </a>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1.5 text-xs ml-auto"
                  onClick={() => { handleDelete(previewMedia.id); setPreviewMedia(null); }}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Supprimer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediasManager;
