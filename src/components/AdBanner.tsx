interface AdBannerProps {
  variant?: "horizontal" | "sidebar" | "inline";
  className?: string;
}

const AdBanner = ({ variant = "horizontal", className = "" }: AdBannerProps) => {
  const styles: Record<string, string> = {
    horizontal: "w-full h-20 md:h-24",
    sidebar: "w-full h-64",
    inline: "w-full h-32 md:h-40",
  };

  return (
    <div className={`${styles[variant]} bg-secondary border border-border rounded-lg flex items-center justify-center ${className}`}>
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-body">Espace publicitaire</p>
        <p className="text-[10px] text-muted-foreground/50 font-body mt-1">Annoncez ici — {variant === "sidebar" ? "300x250" : variant === "horizontal" ? "728x90" : "468x60"}</p>
      </div>
    </div>
  );
};

export default AdBanner;
