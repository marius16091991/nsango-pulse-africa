import { useState, useRef, useCallback } from "react";
import { Upload, X, FileImage, FileVideo, File, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface FileUploadProps {
  onUploadComplete: (url: string, file: { name: string; size: number; type: string }) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  compact?: boolean;
  bucket?: string;
  folder?: string;
}

type UploadState = "idle" | "dragging" | "uploading" | "done";

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) return FileImage;
  if (type.startsWith("video/")) return FileVideo;
  return File;
};

const FileUpload = ({
  onUploadComplete,
  accept = "image/*,video/*,audio/*,.pdf,.doc,.docx",
  maxSizeMB = 50,
  className,
  compact = false,
  bucket = "media-files",
  folder = "uploads",
}: FileUploadProps) => {
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setState("idle");
    setProgress(0);
    setPreview(null);
    setFileName("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const uploadFile = useCallback(async (file: globalThis.File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({ title: "Fichier trop volumineux", description: `Max ${maxSizeMB} MB`, variant: "destructive" });
      return;
    }

    setFileName(file.name);
    setState("uploading");

    // Preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }

    // Simulate progress (storage API doesn't provide progress)
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 10, 90));
    }, 200);

    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    clearInterval(progressInterval);

    if (error) {
      setState("idle");
      setProgress(0);
      toast({ title: "Erreur d'upload", description: error.message, variant: "destructive" });
      return;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    setProgress(100);
    setState("done");

    onUploadComplete(urlData.publicUrl, {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    toast({ title: "Fichier uploadé", description: file.name });
  }, [bucket, folder, maxSizeMB, onUploadComplete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("idle");
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("dragging");
  }, []);

  const handleDragLeave = useCallback(() => {
    setState("idle");
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  if (compact) {
    return (
      <div className={cn("relative", className)}>
        <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />
        {state === "uploading" ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{progress}%</span>
          </div>
        ) : state === "done" ? (
          <div className="flex items-center gap-2">
            {preview && <img src={preview} alt="" className="w-10 h-10 rounded object-cover" />}
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">{fileName}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={reset}><X className="w-3 h-3" /></Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="w-3.5 h-3.5" /> Choisir un fichier
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer",
        state === "dragging" && "border-gold bg-gold/5 scale-[1.01]",
        state === "uploading" && "border-gold/50 bg-muted/30",
        state === "done" && "border-green-400 bg-green-50/50",
        state === "idle" && "border-border hover:border-gold/40 hover:bg-muted/20",
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => state === "idle" && inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />

      {state === "uploading" && (
        <div className="p-6 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
          <p className="text-sm font-body text-muted-foreground">Upload de <strong>{fileName}</strong>...</p>
          <div className="w-full max-w-xs bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{progress}%</span>
        </div>
      )}

      {state === "done" && (
        <div className="p-6 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            {preview ? (
              <img src={preview} alt="" className="w-16 h-16 rounded-lg object-cover shadow-sm" />
            ) : (
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            )}
            <div>
              <p className="text-sm font-medium">{fileName}</p>
              <p className="text-xs text-green-600 font-body">Upload terminé ✓</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); reset(); }} className="text-xs">
            Remplacer le fichier
          </Button>
        </div>
      )}

      {(state === "idle" || state === "dragging") && (
        <div className="p-8 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
            <Upload className="w-6 h-6 text-gold" />
          </div>
          <div>
            <p className="text-sm font-medium font-display">
              {state === "dragging" ? "Déposez le fichier ici" : "Glissez-déposez ou cliquez"}
            </p>
            <p className="text-xs text-muted-foreground font-body mt-1">
              Images, vidéos, audio, documents · Max {maxSizeMB} MB
            </p>
          </div>
          <div className="flex gap-2 mt-1">
            <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
              <Upload className="w-3.5 h-3.5" /> Depuis l'appareil
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
