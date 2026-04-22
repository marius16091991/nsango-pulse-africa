interface Props { title: string; description: string; url: string; }

const SerpPreview = ({ title, description, url }: Props) => {
  const displayTitle = (title || "Titre de la page").slice(0, 60);
  const displayDesc = (description || "Description meta de la page…").slice(0, 160);
  const displayUrl = url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <div className="rounded-lg border bg-card p-4 max-w-2xl">
      <p className="text-xs text-muted-foreground font-mono mb-1">{displayUrl}</p>
      <h3 className="text-[20px] leading-snug text-[#1a0dab] dark:text-blue-400 font-normal hover:underline cursor-pointer">{displayTitle}</h3>
      <p className="text-sm text-foreground/80 mt-1 leading-snug">{displayDesc}</p>
    </div>
  );
};

export default SerpPreview;