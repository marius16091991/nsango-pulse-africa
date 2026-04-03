interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  gold?: boolean;
}

const SectionTitle = ({ title, subtitle, align = "left", gold = false }: SectionTitleProps) => (
  <div className={`mb-8 ${align === "center" ? "text-center" : ""}`}>
    {gold && (
      <div className={`w-12 h-0.5 bg-gold mb-4 ${align === "center" ? "mx-auto" : ""}`} />
    )}
    <h2 className="font-display text-2xl md:text-3xl font-bold">{title}</h2>
    {subtitle && (
      <p className="text-sm text-muted-foreground font-body mt-2">{subtitle}</p>
    )}
  </div>
);

export default SectionTitle;
