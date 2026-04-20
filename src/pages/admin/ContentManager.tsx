import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Save, Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, FileText, Image as ImageIcon, Palette, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import MediaUpload from "@/components/MediaUpload";

interface Page { id: string; slug: string; title: string; meta_description: string; visible: boolean; sort_order: number; }
interface Section {
  id: string; page_slug: string; section_key: string; section_type: string;
  title: string; subtitle: string; body: string; media_url: string;
  cta_label: string; cta_url: string;
  content_ids: any; style: any;
  sort_order: number; visible: boolean;
}

const SECTION_TYPES = [
  { value: "hero", label: "Hero (bannière)" },
  { value: "articles_grid", label: "Grille d'articles" },
  { value: "videos_grid", label: "Grille de vidéos" },
  { value: "newsletter", label: "Newsletter" },
  { value: "cta", label: "Appel à l'action" },
  { value: "text_block", label: "Bloc de texte" },
  { value: "generic", label: "Générique" },
];

const LAYOUTS = ["grid", "list", "carousel", "centered", "split"];
const ARTICLE_CATEGORIES = ["all", "Portraits", "Business", "Culture", "Interviews", "Politique", "Talents", "Sport"];

const ContentManager = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>("home");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPages = async () => {
    const { data } = await supabase.from("pages").select("*").order("sort_order");
    setPages((data || []) as any);
  };
  const fetchSections = async (slug: string) => {
    setLoading(true);
    const { data } = await supabase.from("page_sections").select("*").eq("page_slug", slug).order("sort_order");
    setSections((data || []) as any);
    if (data && data.length > 0 && !selectedSection) setSelectedSection(data[0].id);
    setLoading(false);
  };
  const fetchContent = async () => {
    const [{ data: a }, { data: v }] = await Promise.all([
      supabase.from("articles").select("id,title,category,status").order("created_at", { ascending: false }).limit(100),
      supabase.from("videos").select("id,title,category,status").order("created_at", { ascending: false }).limit(100),
    ]);
    setArticles(a || []);
    setVideos(v || []);
  };

  useEffect(() => { fetchPages(); fetchContent(); }, []);
  useEffect(() => { setSelectedSection(null); fetchSections(selectedPage); }, [selectedPage]);

  const currentPage = pages.find(p => p.slug === selectedPage);
  const currentSection = sections.find(s => s.id === selectedSection);

  const updateSectionField = (field: keyof Section, value: any) => {
    if (!currentSection) return;
    setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, [field]: value } : s));
  };

  const updateStyle = (key: string, value: any) => {
    if (!currentSection) return;
    const newStyle = { ...(currentSection.style || {}), [key]: value };
    updateSectionField("style", newStyle);
  };

  const saveSection = async () => {
    if (!currentSection) return;
    setSaving(true);
    const { id, ...patch } = currentSection;
    const { error } = await supabase.from("page_sections").update(patch).eq("id", id);
    setSaving(false);
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else toast({ title: "Section enregistrée ✓" });
  };

  const savePage = async (patch: Partial<Page>) => {
    if (!currentPage) return;
    const { error } = await supabase.from("pages").update(patch).eq("id", currentPage.id);
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else { toast({ title: "Page mise à jour" }); fetchPages(); }
  };

  const moveSection = async (sec: Section, dir: -1 | 1) => {
    const sorted = [...sections].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex(s => s.id === sec.id);
    const swap = sorted[idx + dir];
    if (!swap) return;
    await Promise.all([
      supabase.from("page_sections").update({ sort_order: swap.sort_order }).eq("id", sec.id),
      supabase.from("page_sections").update({ sort_order: sec.sort_order }).eq("id", swap.id),
    ]);
    fetchSections(selectedPage);
  };

  const toggleVisible = async (sec: Section) => {
    await supabase.from("page_sections").update({ visible: !sec.visible }).eq("id", sec.id);
    fetchSections(selectedPage);
  };

  const addSection = async () => {
    const key = prompt("Clé technique (ex: featured_articles) :");
    if (!key) return;
    const max = sections.reduce((m, s) => Math.max(m, s.sort_order), 0);
    const { error } = await supabase.from("page_sections").insert({
      page_slug: selectedPage, section_key: key, section_type: "generic",
      title: "Nouvelle section", sort_order: max + 1,
    });
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else { toast({ title: "Section ajoutée" }); fetchSections(selectedPage); }
  };

  const deleteSection = async (sec: Section) => {
    if (!confirm(`Supprimer la section "${sec.section_key}" ?`)) return;
    await supabase.from("page_sections").delete().eq("id", sec.id);
    if (selectedSection === sec.id) setSelectedSection(null);
    fetchSections(selectedPage);
  };

  const toggleContentId = (id: string) => {
    if (!currentSection) return;
    const ids: string[] = Array.isArray(currentSection.content_ids) ? currentSection.content_ids : [];
    const next = ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];
    updateSectionField("content_ids", next);
  };

  const isVideoSection = currentSection?.section_type === "videos_grid";
  const contentList = isVideoSection ? videos : articles;
  const selectedIds: string[] = Array.isArray(currentSection?.content_ids) ? currentSection!.content_ids : [];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Gestion de contenu</h1>
          <p className="text-sm text-muted-foreground font-body">Modifiez les sections de chaque page du site</p>
        </div>
        {currentPage && (
          <Link to={currentPage.slug === "home" ? "/" : currentPage.slug === "apropos" ? "/a-propos" : `/${currentPage.slug}`} target="_blank">
            <Button variant="outline" size="sm" className="gap-2"><Eye className="w-4 h-4" /> Voir la page</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Pages list */}
        <Card className="col-span-12 md:col-span-3">
          <CardContent className="p-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/80 font-bold px-2 mb-2">Pages</p>
            <div className="space-y-1">
              {pages.map(p => (
                <button key={p.id} onClick={() => setSelectedPage(p.slug)}
                  className={`w-full text-left px-3 py-2 rounded text-sm font-body transition-colors flex items-center justify-between ${selectedPage === p.slug ? "bg-gold/15 text-gold font-semibold" : "hover:bg-secondary/60"}`}>
                  <span>{p.title}</span>
                  {!p.visible && <EyeOff className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sections list */}
        <Card className="col-span-12 md:col-span-3">
          <CardContent className="p-3">
            <div className="flex items-center justify-between px-2 mb-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/80 font-bold">Sections</p>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={addSection}><Plus className="w-3.5 h-3.5" /></Button>
            </div>
            {loading ? <div className="text-xs text-muted-foreground p-3">Chargement…</div> : (
              <div className="space-y-1">
                {sections.map((s, i) => (
                  <div key={s.id} className={`group rounded border ${selectedSection === s.id ? "border-gold bg-gold/5" : "border-transparent"}`}>
                    <button onClick={() => setSelectedSection(s.id)}
                      className="w-full text-left px-2.5 py-2 text-xs font-body flex items-center gap-1.5">
                      <Layers className="w-3 h-3 shrink-0 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{s.title || s.section_key}</p>
                        <p className="text-[10px] text-muted-foreground font-mono truncate">{s.section_key}</p>
                      </div>
                      {!s.visible && <EyeOff className="w-3 h-3 text-muted-foreground" />}
                    </button>
                    <div className="hidden group-hover:flex items-center gap-0.5 px-1 pb-1">
                      <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => moveSection(s, -1)} disabled={i === 0}><ArrowUp className="w-3 h-3" /></Button>
                      <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => moveSection(s, 1)} disabled={i === sections.length - 1}><ArrowDown className="w-3 h-3" /></Button>
                      <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => toggleVisible(s)}>{s.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}</Button>
                      <Button size="icon" variant="ghost" className="h-5 w-5 text-destructive" onClick={() => deleteSection(s)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                ))}
                {sections.length === 0 && <p className="text-xs text-muted-foreground p-3 text-center">Aucune section</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Editor */}
        <div className="col-span-12 md:col-span-6 space-y-4">
          {/* Page meta */}
          {currentPage && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Page : {currentPage.title}</p>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Visible</Label>
                    <Switch checked={currentPage.visible} onCheckedChange={(v) => savePage({ visible: v })} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Titre</Label>
                  <Input value={currentPage.title} onChange={e => setPages(prev => prev.map(p => p.id === currentPage.id ? { ...p, title: e.target.value } : p))} onBlur={e => savePage({ title: e.target.value })} className="mt-1 h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Description SEO</Label>
                  <Textarea rows={2} value={currentPage.meta_description} onChange={e => setPages(prev => prev.map(p => p.id === currentPage.id ? { ...p, meta_description: e.target.value } : p))} onBlur={e => savePage({ meta_description: e.target.value })} className="mt-1 text-sm" />
                </div>
              </CardContent>
            </Card>
          )}

          {currentSection ? (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Section : {currentSection.section_key}</p>
                  <Button onClick={saveSection} disabled={saving} size="sm" className="bg-gold hover:bg-gold-dark text-primary gap-1.5">
                    <Save className="w-3.5 h-3.5" /> {saving ? "..." : "Enregistrer"}
                  </Button>
                </div>

                <Tabs defaultValue="content">
                  <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="content" className="text-xs gap-1"><FileText className="w-3 h-3" /> Contenu</TabsTrigger>
                    <TabsTrigger value="selection" className="text-xs gap-1"><ImageIcon className="w-3 h-3" /> Sélection</TabsTrigger>
                    <TabsTrigger value="style" className="text-xs gap-1"><Palette className="w-3 h-3" /> Style</TabsTrigger>
                  </TabsList>

                  <TabsContent value="content" className="space-y-3 mt-4">
                    <div>
                      <Label className="text-xs">Type de section</Label>
                      <Select value={currentSection.section_type} onValueChange={v => updateSectionField("section_type", v)}>
                        <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>{SECTION_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label className="text-xs">Titre</Label><Input value={currentSection.title} onChange={e => updateSectionField("title", e.target.value)} className="mt-1 h-8 text-sm" /></div>
                    <div><Label className="text-xs">Sous-titre</Label><Input value={currentSection.subtitle} onChange={e => updateSectionField("subtitle", e.target.value)} className="mt-1 h-8 text-sm" /></div>
                    <div><Label className="text-xs">Corps de texte</Label><Textarea rows={4} value={currentSection.body} onChange={e => updateSectionField("body", e.target.value)} className="mt-1 text-sm" /></div>
                    <div>
                      <Label className="text-xs">Média (image / vidéo)</Label>
                      <div className="mt-1">
                        <MediaUpload
                          accept="image/*,video/*"
                          initialUrl={currentSection.media_url}
                          initialSource={currentSection.media_url?.length === 11 || currentSection.media_url?.includes("youtu") ? "youtube" : "upload"}
                          onChange={({ url }) => updateSectionField("media_url", url)}
                        />
                        {currentSection.media_url && (
                          <p className="text-[11px] text-muted-foreground font-body mt-1 truncate">URL: {currentSection.media_url}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label className="text-xs">Libellé bouton</Label><Input value={currentSection.cta_label} onChange={e => updateSectionField("cta_label", e.target.value)} className="mt-1 h-8 text-sm" /></div>
                      <div><Label className="text-xs">URL bouton</Label><Input value={currentSection.cta_url} onChange={e => updateSectionField("cta_url", e.target.value)} className="mt-1 h-8 text-sm" /></div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Label className="text-xs">Section visible</Label>
                      <Switch checked={currentSection.visible} onCheckedChange={v => updateSectionField("visible", v)} />
                    </div>
                  </TabsContent>

                  <TabsContent value="selection" className="space-y-2 mt-4">
                    <p className="text-xs text-muted-foreground">Cochez les {isVideoSection ? "vidéos" : "articles"} à afficher dans cette section.</p>
                    <div className="max-h-80 overflow-y-auto border rounded divide-y">
                      {contentList.map((c: any) => (
                        <label key={c.id} className="flex items-center gap-2 px-3 py-2 hover:bg-secondary/50 cursor-pointer text-xs">
                          <input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => toggleContentId(c.id)} className="accent-gold" />
                          <span className="flex-1 truncate">{c.title}</span>
                          <span className="text-[10px] text-muted-foreground">{c.category}</span>
                        </label>
                      ))}
                      {contentList.length === 0 && <p className="text-xs text-muted-foreground p-4 text-center">Aucun contenu disponible</p>}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{selectedIds.length} sélectionné(s). Si aucun, la section affichera les derniers contenus automatiquement.</p>
                  </TabsContent>

                  <TabsContent value="style" className="space-y-3 mt-4">
                    <div>
                      <Label className="text-xs">Layout</Label>
                      <Select value={currentSection.style?.layout || "grid"} onValueChange={v => updateStyle("layout", v)}>
                        <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>{LAYOUTS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    {currentSection.section_type === "articles_grid" && (
                      <div>
                        <Label className="text-xs">Catégorie filtrée</Label>
                        <Select value={currentSection.style?.category || "all"} onValueChange={v => updateStyle("category", v)}>
                          <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ARTICLE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c === "all" ? "Toutes catégories" : c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <p className="text-[10px] text-muted-foreground mt-1">Ignoré si des articles sont sélectionnés manuellement.</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label className="text-xs">Colonnes</Label><Input type="number" min={1} max={6} value={currentSection.style?.columns || 3} onChange={e => updateStyle("columns", parseInt(e.target.value) || 3)} className="mt-1 h-8 text-sm" /></div>
                      <div><Label className="text-xs">Nombre d'éléments</Label><Input type="number" min={1} max={20} value={currentSection.style?.limit || 6} onChange={e => updateStyle("limit", parseInt(e.target.value) || 6)} className="mt-1 h-8 text-sm" /></div>
                    </div>
                    <div>
                      <Label className="text-xs">Couleur d'accent</Label>
                      <Select value={currentSection.style?.accent || "gold"} onValueChange={v => updateStyle("accent", v)}>
                        <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gold">Or (par défaut)</SelectItem>
                          <SelectItem value="primary">Primaire (sombre)</SelectItem>
                          <SelectItem value="muted">Neutre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Fond</Label>
                      <Select value={currentSection.style?.background || "default"} onValueChange={v => updateStyle("background", v)}>
                        <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Par défaut</SelectItem>
                          <SelectItem value="secondary">Secondaire</SelectItem>
                          <SelectItem value="dark">Sombre (gradient)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card><CardContent className="p-12 text-center text-sm text-muted-foreground">Sélectionnez une section pour l'éditer</CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentManager;
