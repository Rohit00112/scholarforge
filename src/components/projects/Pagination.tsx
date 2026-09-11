import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}

export function Pagination({ currentPage, totalPages, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null;

  function pageHref(page: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== "") params.set(key, value);
    }
    params.set("page", String(page));
    return `/projects?${params.toString()}`;
  }

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      {currentPage > 1 ? (
        <Link
          href={pageHref(currentPage - 1)}
          rel="prev"
          className="rounded-md border border-line bg-ink-800 px-3 py-1.5 text-xs text-muted transition-colors hover:border-brass/40 hover:text-brass"
        >
          Prev
        </Link>
      ) : (
        <span className="rounded-md border border-line bg-ink-800 px-3 py-1.5 text-xs text-muted/40">Prev</span>
      )}

      <span className="font-mono text-xs text-muted">
        {currentPage} / {totalPages}
      </span>

      {currentPage < totalPages ? (
        <Link
          href={pageHref(currentPage + 1)}
          rel="next"
          className="rounded-md border border-line bg-ink-800 px-3 py-1.5 text-xs text-muted transition-colors hover:border-brass/40 hover:text-brass"
        >
          Next
        </Link>
      ) : (
        <span className="rounded-md border border-line bg-ink-800 px-3 py-1.5 text-xs text-muted/40">Next</span>
      )}
    </nav>
  );
}