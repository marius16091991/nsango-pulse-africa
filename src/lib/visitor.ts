// Identifiant pseudo-anonyme stable pour visiteurs non connectés
// (utilisé pour empêcher le double-vote / double-like / double-réaction)
export const getVisitorId = (): string => {
  let id = localStorage.getItem("nsango_visitor_id");
  if (!id) {
    id = (crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    localStorage.setItem("nsango_visitor_id", id);
  }
  return id;
};

export const exportToCSV = (filename: string, rows: Record<string, any>[]) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map(r => headers.map(h => {
      const v = r[h] ?? "";
      const s = typeof v === "string" ? v : JSON.stringify(v);
      return `"${s.replace(/"/g, '""')}"`;
    }).join(",")),
  ].join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};