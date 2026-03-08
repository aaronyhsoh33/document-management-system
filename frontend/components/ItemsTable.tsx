'use client';

import { useState } from 'react';
import { Item, SortField, SortOrder, formatFileSize, formatDate } from '@/lib/types';
import { Folder, FileText, MoreHorizontal, ArrowUpDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ItemsTableProps {
  items: Item[];
  total: number;
  page: number;
  limit: number;
  sort: SortField;
  order: SortOrder;
  onFolderClick: (item: Item) => void;
  onDelete: (item: Item) => void;
  onSortChange: (field: SortField) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onDeleteMany: (ids: number[]) => void;
}

export function ItemsTable({
  items,
  total,
  page,
  limit,
  sort,
  order,
  onFolderClick,
  onDelete,
  onSortChange,
  onPageChange,
  onLimitChange,
  onDeleteMany,
}: ItemsTableProps) {
  const totalPages = Math.ceil(total / limit);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const allSelected = items.length > 0 && items.every((i) => selectedIds.has(i.id));
  const someSelected = items.some((i) => selectedIds.has(i.id));

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  }

  function toggleOne(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function SortButton({ field, label }: { field: SortField; label: string }) {
    const isActive = sort === field;
    return (
      <button
        onClick={() => onSortChange(field)}
        className="flex items-center gap-1 hover:text-white/80 transition-colors"
      >
        {label}
        <ArrowUpDown className={`w-3 h-3 ${isActive ? 'opacity-100' : 'opacity-50'}`} />
      </button>
    );
  }

  return (
    <div>
      {selectedIds.size > 0 && (
        <div className="flex justify-end mb-2">
          <Button
            variant="destructive"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => {
              onDeleteMany(Array.from(selectedIds));
              setSelectedIds(new Set());
            }}
          >
            <Trash2 className="w-4 h-4" />
            Delete selected ({selectedIds.size})
          </Button>
        </div>
      )}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-blue-900 text-white">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-4 py-3 text-left font-bold">
                <SortButton field="name" label="Name" />
              </th>
              <th className="px-4 py-3 text-left font-bold">Created by</th>
              <th className="px-4 py-3 text-left font-bold">
                <SortButton field="createdAt" label="Date" />
              </th>
              <th className="px-4 py-3 text-left font-bold">File size</th>
              <th className="w-12 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No items found
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleOne(item.id)}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {item.type === 'folder' ? (
                      <Folder className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    )}
                    {item.type === 'folder' ? (
                      <button
                        onClick={() => onFolderClick(item)}
                        className="hover:text-blue-600 hover:underline text-left font-medium"
                      >
                        {item.name}
                      </button>
                    ) : (
                      <span>{item.name}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{item.createdBy}</td>
                <td className="px-4 py-3 text-gray-600">{formatDate(item.createdAt)}</td>
                <td className="px-4 py-3 text-gray-600">{formatFileSize(item.size)}</td>
                <td className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md p-0 hover:bg-accent focus-visible:outline-none">
                      <MoreHorizontal className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-red-600 cursor-pointer"
                        onClick={() => onDelete(item)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            {[10, 25, 50].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <span>rows per page</span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            &lt;
          </Button>
          {Array.from({ length: Math.max(totalPages, 1) }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === page ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onPageChange(p)}
              className="w-8 h-8 p-0"
            >
              {p}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            &gt;
          </Button>
        </div>
      </div>
    </div>
  );
}
