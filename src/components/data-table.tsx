import { useMemo, useState, type ReactNode } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type Column<T> = {
  key: string;
  header: string;
  accessor?: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
  sortable?: boolean;
};

export function DataTable<T extends { id: string }>({
  data,
  columns,
  isLoading,
  searchKeys,
  filters,
  pageSize = 8,
  emptyTitle = "No records",
  emptyDescription = "Nothing here yet.",
  emptyIcon,
}: {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  searchKeys?: (keyof T)[];
  filters?: ReactNode;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;
}) {
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let rows = data;
    if (q && searchKeys?.length) {
      const needle = q.toLowerCase();
      rows = rows.filter((r) =>
        searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(needle)),
      );
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col?.sortValue) {
        rows = [...rows].sort((a, b) => {
          const av = col.sortValue!(a);
          const bv = col.sortValue!(b);
          if (av < bv) return sortDir === "asc" ? -1 : 1;
          if (av > bv) return sortDir === "asc" ? 1 : -1;
          return 0;
        });
      }
    }
    return rows;
  }, [data, q, sortKey, sortDir, columns, searchKeys]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {searchKeys?.length ? (
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
        ) : <div />}
        {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-container-low hover:bg-surface-container-low">
              {columns.map((c) => (
                <TableHead key={c.key} className={cn("text-xs uppercase tracking-wider", c.className)}>
                  {c.sortable ? (
                    <button
                      className="inline-flex items-center gap-1 hover:text-primary"
                      onClick={() => toggleSort(c.key)}
                    >
                      {c.header}
                      <ArrowUpDown className="h-3 w-3 opacity-60" />
                    </button>
                  ) : (
                    c.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((c) => (
                    <TableCell key={c.key}>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {!isLoading && paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className="py-12 text-center">
                    {emptyIcon && <div className="mx-auto mb-3 text-muted-foreground">{emptyIcon}</div>}
                    <p className="text-sm font-semibold">{emptyTitle}</p>
                    <p className="text-xs text-muted-foreground mt-1">{emptyDescription}</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              paged.map((row) => (
                <TableRow key={row.id} className="hover:bg-surface-container-low/60">
                  {columns.map((c) => (
                    <TableCell key={c.key} className={c.className}>
                      {c.accessor ? c.accessor(row) : String((row as Record<string, unknown>)[c.key] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <div className="p-3 border-t flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing {paged.length ? (currentPage - 1) * pageSize + 1 : 0}–
          {(currentPage - 1) * pageSize + paged.length} of {filtered.length}
        </span>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" disabled={currentPage <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-2 font-medium text-foreground">
            {currentPage} / {pageCount}
          </span>
          <Button size="sm" variant="outline" disabled={currentPage >= pageCount} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
