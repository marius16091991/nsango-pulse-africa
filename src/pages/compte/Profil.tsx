import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, Save, User as UserIcon } from "lucide-react";

const Profil = () => {
  const { user, profile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, bio, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name || "");
          setBio(data.bio || "");
          setAvatarUrl(data.avatar_url || null);
        }
      });
  }, [user]);

  const handleAvatar = async (file: File) => {
    if (!user) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image trop lourde (max 2 Mo)");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `avatars/${user.id}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("media-files").upload(path, file, { upsert: true });
    if (upErr) {
      setUploading(false);
      toast.error(upErr.message);
      return;
    }
    const { data } = supabase.storage.from("media-files").getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
    setUploading(false);
    toast.success("Avatar téléversé — n'oubliez pas d'enregistrer.");
  };

  const save = async () => {
    if (!user) return;
    if (displayName.trim().length < 2) {
      toast.error("Le nom doit contenir au moins 2 caractères");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert(
      { user_id: user.id, display_name: displayName.trim(), bio: bio.trim() || null, avatar_url: avatarUrl },
      { onConflict: "user_id" },
    );
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profil mis à jour");
  };

  const initials = (displayName || user?.email || "?").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card/80 backdrop-blur-sm shadow-card">
        <CardContent className="p-6 md:p-8 space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-gold" /> Informations personnelles
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Visibles dans vos commentaires et votre profil public.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Avatar className="h-20 w-20 border-2 border-gold/40 shadow-card">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" />}
              <AvatarFallback className="bg-gold/15 text-gold font-display font-bold text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleAvatar(e.target.files[0])}
                />
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gold/40 text-gold hover:bg-gold/10 transition-colors text-sm font-body">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? "Téléversement…" : "Changer l'avatar"}
                </span>
              </label>
              <p className="text-[11px] text-muted-foreground">JPG / PNG · max 2 Mo</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-wider font-body">Nom affiché</Label>
              <Input
                className="mt-1.5"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={100}
                placeholder="Votre nom"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider font-body">Biographie</Label>
              <Textarea
                className="mt-1.5 min-h-[100px]"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                placeholder="Quelques mots sur vous (optionnel)…"
              />
              <p className="text-[10px] text-muted-foreground mt-1 text-right">{bio.length}/500</p>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider font-body">Email</Label>
              <Input className="mt-1.5 bg-muted" value={user?.email || ""} disabled />
              <p className="text-[10px] text-muted-foreground mt-1">
                Pour changer votre email, contactez un administrateur.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={save} disabled={saving} className="bg-gold hover:bg-gold-dark text-primary font-semibold gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Enregistrer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profil;