interface Props { title: string; description: string; image: string; url: string; }

const SocialPreview = ({ title, description, image, url }: Props) => {
  const domain = url.replace(/^https?:\/\//, "").split("/")[0];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Facebook / LinkedIn style */}
      <div className="rounded-lg overflow-hidden border bg-card">
        <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground px-3 pt-2">Facebook / LinkedIn</p>
        <div className="aspect-[1.91/1] bg-muted overflow-hidden border-y">
          {image ? <img src={image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Aucune image OG</div>}
        </div>
        <div className="p-3 bg-secondary/40">
          <p className="text-[10px] text-muted-foreground uppercase">{domain || "votre-site.com"}</p>
          <p className="text-sm font-semibold leading-tight mt-0.5 line-clamp-2">{title || "Titre de la page"}</p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description || "Description…"}</p>
        </div>
      </div>
      {/* Twitter card */}
      <div className="rounded-2xl overflow-hidden border bg-card">
        <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground px-3 pt-2">Twitter / X</p>
        <div className="aspect-[2/1] bg-muted overflow-hidden border-y">
          {image ? <img src={image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Aucune image OG</div>}
        </div>
        <div className="p-3">
          <p className="text-sm font-semibold leading-tight line-clamp-2">{title || "Titre de la page"}</p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description || "Description…"}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{domain || "votre-site.com"}</p>
        </div>
      </div>
    </div>
  );
};

export default SocialPreview;