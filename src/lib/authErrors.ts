/**
 * Détecte un mot de passe rejeté par la protection HIBP (Have I Been Pwned)
 * activée côté Lovable Cloud, et renvoie un message d'erreur sécurisé.
 */
export function describeAuthPasswordError(error: { message?: string; code?: string } | null | undefined): {
  title: string;
  description: string;
  isCompromised: boolean;
} {
  const msg = (error?.message || "").toLowerCase();
  const code = (error as any)?.code || "";
  const isCompromised =
    code === "weak_password" ||
    msg.includes("pwned") ||
    msg.includes("compromised") ||
    msg.includes("data breach") ||
    msg.includes("has been found") ||
    msg.includes("weak_password");

  if (isCompromised) {
    return {
      title: "Mot de passe non sécurisé",
      description:
        "Ce mot de passe figure dans une base publique de fuites de données. Choisissez un mot de passe unique, jamais utilisé sur un autre site.",
      isCompromised: true,
    };
  }

  return {
    title: "Échec",
    description: error?.message || "Une erreur est survenue.",
    isCompromised: false,
  };
}