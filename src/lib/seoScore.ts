export interface SeoScoreInput {
  title?: string;
  description?: string;
  image?: string;
  slug?: string;
}

export interface SeoScoreResult {
  score: number; // 0-100
  level: "good" | "warn" | "bad";
  issues: string[];
  positives: string[];
}

export const computeSeoScore = (i: SeoScoreInput): SeoScoreResult => {
  const issues: string[] = [];
  const positives: string[] = [];
  let score = 0;

  const t = (i.title || "").trim();
  if (!t) issues.push("Titre manquant");
  else if (t.length < 30) { issues.push(`Titre court (${t.length}c, idéal 30-60)`); score += 10; }
  else if (t.length > 65) { issues.push(`Titre trop long (${t.length}c)`); score += 15; }
  else { positives.push("Titre optimal"); score += 30; }

  const d = (i.description || "").trim();
  if (!d) issues.push("Description manquante");
  else if (d.length < 110) { issues.push(`Description courte (${d.length}c, idéal 120-160)`); score += 10; }
  else if (d.length > 170) { issues.push(`Description trop longue (${d.length}c)`); score += 15; }
  else { positives.push("Description optimale"); score += 30; }

  if (i.image) { positives.push("Image OG présente"); score += 25; }
  else issues.push("Image Open Graph manquante");

  if (i.slug) {
    if (/^[a-z0-9-]+$/.test(i.slug)) { positives.push("Slug propre"); score += 15; }
    else issues.push("Slug non standard (utiliser a-z, 0-9, -)");
  } else score += 15; // slug géré par UUID

  const level: SeoScoreResult["level"] = score >= 75 ? "good" : score >= 50 ? "warn" : "bad";
  return { score, level, issues, positives };
};