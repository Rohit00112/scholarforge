import { nanoid } from "nanoid";

export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Keep only alphanumeric and hyphen
    .replace(/^-+|-+$/g, "")     // Trim hyphens
    .substring(0, 40);           // Limit length

  return `${base}-${nanoid(4).toLowerCase()}`;
}
