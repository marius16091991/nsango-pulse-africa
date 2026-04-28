import { useState } from "react";
import { Youtube, Upload as UploadIcon, Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import FileUpload from "@/components/FileUpload";
import { cn } from "@/lib/utils";

interface MediaUploadProps {
  onChange: (value: { source: "upload" | "youtube"; url: string; thumbnail?: string }) => void;
  accept?: string;
  className?: string;
  initialUrl?: string;
  initialSource?: "upload" | "youtube";
}

const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
  return null;
};

export const getYouTubeThumbnail = (urlOrId: string): string => {
  const id = extractYouTubeId(urlOrId) || urlOrId;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
};

export const getYouTubeEmbed = (urlOrId: string): string => {
  const id = extractYouTubeId(urlOrId) || urlOrId;
  return `https://www.youtube.com/embed/${id}`;
};

const MediaUpload = ({ onChange, accept = "video/*,image/*", className, initialUrl = "", initialSource = "upload" }: MediaUploadProps) => {
  const [tab, setTab] = useState<"upload" | "youtube">(initialSource);
  const [ytUrl, setYtUrl] = useState(initialSource === "youtube" ? initialUrl : "");

  const handleYoutubeChange = (val: string) => {
    setYtUrl(val);
    const id = extractYouTubeId(val);
    if (id) {
      onChange({ source: "youtube", url: id, thumbnail: getYouTubeThumbnail(id) });
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList className="grid grid-cols-2 w-full mb-3">
          <TabsTrigger value="upload" className="text-xs gap-1.5">
            <UploadIcon className="w-3.5 h-3.5" /> Importer un fichier
          </TabsTrigger>
          <TabsTrigger value="youtube" className="text-xs gap-1.5">
            <Youtube className="w-3.5 h-3.5" /> Depuis YouTube
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="m-0">
          <FileUpload
            accept={accept}
            maxSizeMB={500}
            onUploadComplete={(url) => onChange({ source: "upload", url })}
          />
        </TabsContent>
        <TabsContent value="youtube" className="m-0 space-y-2">
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="https://youtube.com/watch?v=... ou ID vidéo"
              className="pl-9 text-sm"
              value={ytUrl}
              onChange={(e) => handleYoutubeChange(e.target.value)}
            />
          </div>
          {extractYouTubeId(ytUrl) && (
            <div className="aspect-video rounded-lg overflow-hidden border border-border">
              <img src={getYouTubeThumbnail(ytUrl)} alt="Aperçu" className="w-full h-full object-cover" />
            </div>
          )}
          <p className="text-[11px] text-muted-foreground font-body">
            Collez l'URL d'une vidéo YouTube — l'aperçu et la miniature seront générés automatiquement.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MediaUpload;
