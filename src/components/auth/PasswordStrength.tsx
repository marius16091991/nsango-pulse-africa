import { Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  password: string;
  showHibpHint?: boolean;
}

const score = (pw: string): number => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
};

const labels = ["Très faible", "Faible", "Correct", "Bon", "Excellent"];
const colors = [
  "bg-destructive",
  "bg-destructive/70",
  "bg-bordeaux",
  "bg-gold/80",
  "bg-gold",
];

const PasswordStrength = ({ password, showHibpHint = true }: Props) => {
  if (!password) return null;
  const s = score(password);
  const Icon = s >= 3 ? ShieldCheck : s >= 2 ? Shield : ShieldAlert;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i < s ? colors[s] : "bg-muted",
            )}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="flex items-center gap-1 text-muted-foreground">
          <Icon className={cn("w-3 h-3", s >= 3 ? "text-gold" : s >= 2 ? "text-bordeaux" : "text-destructive")} />
          Force : <span className="font-semibold text-foreground">{labels[s]}</span>
        </span>
        {showHibpHint && (
          <span className="text-muted-foreground hidden sm:inline">
            🔒 Vérifié contre les fuites publiques (HIBP)
          </span>
        )}
      </div>
    </div>
  );
};

export default PasswordStrength;