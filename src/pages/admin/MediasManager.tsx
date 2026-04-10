import { useState } from "react";
import { Upload, Search, Grid, List, Image, Video, Music, FileText, Trash2, Download, Eye, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface Media {
  id: number;
  name: string;
  type: string;
  size: string;
  date: string;
  url: string;
}

const initialMedias: Media[] = [
  { id: 1, name: "hero-personality.jpg", type: "image", size: "2.4 MB", date: "2026-04-02", url: "/src/assets/hero-personality.jpg" },
  { id: 2, name: "business-leadership.jpg", type: "image", size: "1.8 MB", date: "2026-04-01", url: "/src/assets/business-leadership.jpg" },
  { id: 3, name: "interview-dangote.mp4", type: "video", size: "45.2 MB", date: "2026-03-30", url: "#" },
  { id: 4, name: "podcast-ep12.mp3", type: "audio", size: "32.1 MB", date: "2026-03-28", url: "#" },
  { id: 5, name: "culture-lifestyle.jpg", type: "image", size: "2.1 MB", date: "2026-03-25", url: "/src/assets/culture-lifestyle.jpg" },
  { id: 6, name: "magazine-avril.pdf", type: "document", size: "8.5 MB", date: "2026-04-01", url: "#" },
  { id: 7, name: "talent-emergent.jpg", type: "image", size: "1.9 MB", date: "2026-03-22", url: "/src/assets/talent-emergent.jpg" },
  { id: 8, name: "magazine-cover.jpg", type: "image", size: "3.2 MB", date: "2026-04-01", url: "/src/assets/magazine-cover.jpg" },
];

const typeIcons: Record<string, typeof Image> = { image: Image, video: Video, audio: Music, document: FileText };
const typeColors: Record<string, string> = { image: "text-blue-500", video: "text-red-500", audio: "text-purple-500", document: "text-amber-500" };

const MediasManager = () => {
  const [medias, setMedias] = useState<Media[]>(initialMedias);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploadType, setUploadType] = useState("image");

  const handleUpload = () => {
    if (!uploadName.trim()) { toast({ title: "Erreur", description: "Le nom est requis", variant: "destructive" }); return; }
    const newMedia: Media = {
      id: Date.now(), name: uploadName, type: uploadType, size: "1.0 MB",
      date: new Date().toISOString().split("T")[0], url: uploadUrl || "#",
    };
    setMedias(prev => [newMedia, ...prev]);
    toast({ title: "Fichier ajouté", description: `"${uploadName}" a été ajouté à la bibliothèque` });
    setUploadName(""); setUploadUrl(""); setUploadOpen(false);
  };

  const handleDelete = (id: number) => {
    const m = medias.find(x => x.id === id);
    setMedias(prev => prev.filter(x => x.id !== id));
    toast({ title: "Fichier supprimé", description: `"${m?.name}" a été supprimé` });
  };

  const filtered = medias.filter((m) => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== "all" && m.type !== filterType) return false;
    return true;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Bibliothèque médias</h1>
          <p className="text-sm text-muted-foreground font-body">{medias.length} fichiers</p>
        </div>
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gold hover:bg-gold-dark text-primary font-body text-sm gap-1"><Upload className="w-4 h-4" /> Uploader</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">Ajouter un fichier</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label className="font-body text-sm">Nom du fichier</Label><Input className="mt-1" placeholder="photo-portrait.jpg" value={uploadName} onChange={e => setUploadName(e.target.value)} /></div>
              <div><Label className="font-body text-sm">Type</Label>
                <Select value={uploadType} onValueChange={setUploadType}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Vidéo</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="font-body text-sm">URL du fichier</Label><Input className="mt-1" placeholder="https://..." value={uploadUrl} onChange={e => setUploadUrl(e.target.value)} /></div>
              <Button className="w-full bg-gold hover:bg-gold-dark text-primary font-body" onClick={handleUpload}>Ajouter</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Rechercher un fichier..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Vidéos</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button variant={view === "grid" ? "default" : "ghost"} size="icon" className="h-9 w-9" onClick={() => setView("grid")}><Grid className="w-4 h-4" /></Button>
              <Button variant={view === "list" ? "default" : "ghost"} size="icon" className="h-9 w-9" onClick={() => setView("list")}><List className="w-4 h-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {view === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((m) => {
            const Icon = typeIcons[m.type];
            return (
              <Card key={m.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="aspect-square bg-muted rounded-md flex items-center justify-center mb-2 relative overflow-hidden">
                    {m.type === "image" && m.url !== "#" ? (
                      <img src={m.url} alt={m.name} className="w-full h-full object-cover rounded-md" />
                    ) : (
                      <Icon className={`w-12 h-12 ${typeColors[m.type]}`} />
                    )}
                    <div className="absolute inset-0 bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-primary-foreground" onClick={() => toast({ title: "Aperçu", description: m.name })}><Eye className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(m.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <p className="text-xs font-medium truncate">{m.name}</p>
                  <p className="text-[10px] text-muted-foreground font-body">{m.size} · {m.date}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-left text-muted-foreground font-body">
                <th className="p-4">Fichier</th><th className="p-4">Type</th><th className="p-4 hidden md:table-cell">Taille</th><th className="p-4 hidden md:table-cell">Date</th><th className="p-4 w-10"></th>
              </tr></thead>
              <tbody>
                {filtered.map((m) => {
                  const Icon = typeIcons[m.type];
                  return (
                    <tr key={m.id} className="border-b border-border hover:bg-muted/30">
                      <td className="p-4 flex items-center gap-3"><Icon className={`w-5 h-5 ${typeColors[m.type]}`} /><span className="font-medium">{m.name}</span></td>
                      <td className="p-4 capitalize text-muted-foreground font-body">{m.type}</td>
                      <td className="p-4 hidden md:table-cell text-muted-foreground font-body">{m.size}</td>
                      <td className="p-4 hidden md:table-cell text-muted-foreground font-body">{m.date}</td>
                      <td className="p-4"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(m.id)}><Trash2 className="w-4 h-4" /></Button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MediasManager;
