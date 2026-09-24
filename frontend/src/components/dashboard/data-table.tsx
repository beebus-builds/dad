"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/dashboard/empty-state";

export type DataTableColumn<T> = {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
};

export type DataTablePagination = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  showingLabel?: string;
  previousLabel: string;
  nextLabel: string;
};

export function DataTable<T>({
  columns,
  data,
  rowKey,
  isLoading,
  isError,
  errorMessage,
  loadingLabel,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  pagination,
  onRowClick,
}: {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  loadingLabel?: string;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  pagination?: DataTablePagination;
  onRowClick?: (row: T) => void;
}) {
  if (isLoading) {
    return (
      <div className="border-border/70 bg-card text-muted-foreground shadow-soft flex items-center justify-center rounded-2xl border py-16">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {loadingLabel}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border-destructive/30 bg-destructive/5 text-destructive shadow-soft rounded-2xl border p-4 text-sm">
        {errorMessage}
      </div>
    );
  }

  if (data.length === 0 && emptyTitle) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <>
      <div className="border-border/70 bg-card shadow-soft overflow-hidden rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground py-14 text-center"
                >
                  {emptyTitle}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={onRowClick ? "cursor-pointer" : undefined}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="text-muted-foreground flex flex-col gap-3 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span>{pagination.showingLabel}</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1}
            >
              {pagination.previousLabel}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                pagination.onPageChange(Math.min(pagination.totalPages, pagination.page + 1))
              }
              disabled={pagination.page >= pagination.totalPages}
            >
              {pagination.nextLabel}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
