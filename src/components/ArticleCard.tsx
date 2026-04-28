import { Link } from "react-router-dom";

interface ArticleCardProps {
  image: string;
  category: string;
  title: string;
  excerpt?: string;
  author?: string;
  date?: string;
  readTime?: string;
  size?: "small" | "medium" | "large";
  premium?: boolean;
  href?: string;
}

const ArticleCard = ({
  image,
  category,
  title,
  excerpt,
  author,
  date,
  readTime,
  size = "medium",
  premium = false,
  href,
}: ArticleCardProps) => {
  const isLarge = size === "large";
  const isSmall = size === "small";

  const Wrapper: any = href ? Link : "article";
  const wrapperProps = href ? { to: href } : {};

  return (
    <Wrapper {...wrapperProps} className="group cursor-pointer block">
      <div className={`relative overflow-hidden rounded-lg ${isLarge ? "aspect-[16/9]" : isSmall ? "aspect-[4/3]" : "aspect-[3/2]"}`}>
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 gradient-hero opacity-60" />
        {premium && (
          <span className="absolute top-3 right-3 bg-gold text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded font-body">
            Premium
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <span className="text-gold text-[10px] font-bold uppercase tracking-[0.2em] font-body">
            {category}
          </span>
          <h3 className={`font-display font-bold leading-tight mt-1 text-primary-foreground ${isLarge ? "text-xl md:text-2xl" : isSmall ? "text-sm" : "text-base md:text-lg"}`}>
            {title}
          </h3>
        </div>
      </div>
      {(excerpt || author) && (
        <div className="mt-3">
          {excerpt && <p className="text-sm text-muted-foreground font-body line-clamp-2">{excerpt}</p>}
          {(author || date) && (
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground/70 font-body">
              {author && <span>{author}</span>}
              {author && date && <span>·</span>}
              {date && <span>{date}</span>}
              {readTime && <><span>·</span><span>{readTime}</span></>}
            </div>
          )}
        </div>
      )}
    </Wrapper>
  );
};

export default ArticleCard;
