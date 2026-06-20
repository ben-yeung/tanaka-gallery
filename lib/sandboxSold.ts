const KEY = "sandbox_sold";

export function markSandboxSold(slug: string): void {
  if (typeof window === "undefined") return;
  const current = getSandboxSold();
  if (!current.includes(slug)) {
    localStorage.setItem(KEY, JSON.stringify([...current, slug]));
  }
}

export function getSandboxSold(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}
