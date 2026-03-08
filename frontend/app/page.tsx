'use client';

import { useState, useEffect, useCallback } from 'react';
import { Item, SortField, SortOrder } from '@/lib/types';
import { api, ListParams } from '@/lib/api';
import { BreadcrumbNav } from '@/components/BreadcrumbNav';
import { ItemsTable } from '@/components/ItemsTable';
import { AddItemModal } from '@/components/AddItemModal';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FolderPlus, Search } from 'lucide-react';

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState<SortField>('createdAt');
  const [order, setOrder] = useState<SortOrder>('asc');
  const [trail, setTrail] = useState<Item[]>([]);
  const currentFolderId = trail.length > 0 ? trail[trail.length - 1].id : null;
  const [modalMode, setModalMode] = useState<'folder' | 'document' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Item[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ ids: number[]; label: string } | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: ListParams = { page, limit, sort, order };
      const data = currentFolderId
        ? await api.getChildren(currentFolderId, params)
        : await api.getRootItems(params);
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
    } finally {
      setLoading(false);
    }
  }, [currentFolderId, page, limit, sort, order]);

  useEffect(() => {
    if (searchResults === null) {
      fetchItems();
    }
  }, [fetchItems, searchResults]);

  async function handleSearch(q: string) {
    setSearchQuery(q);
    if (q.trim() === '') {
      setSearchResults(null);
      return;
    }
    try {
      const data = await api.search(q);
      setSearchResults(data.items);
    } catch {
      setSearchResults([]);
    }
  }

  function handleFolderClick(item: Item) {
    setTrail((prev) => [...prev, item]);
    setPage(1);
    setSearchResults(null);
    setSearchQuery('');
  }

  function handleNavigate(item: Item | null) {
    if (item === null) {
      setTrail([]);
    } else {
      const idx = trail.findIndex((t) => t.id === item.id);
      setTrail(trail.slice(0, idx + 1));
    }
    setPage(1);
  }

  function handleDelete(item: Item) {
    const extra = item.type === 'folder' ? ' All contents will be deleted.' : '';
    setDeleteTarget({ ids: [item.id], label: `Delete "${item.name}"?${extra}` });
  }

  function handleDeleteMany(ids: number[]) {
    setDeleteTarget({
      ids,
      label: `Delete ${ids.length} item${ids.length > 1 ? 's' : ''}? Folders and all their contents will be deleted.`,
    });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.ids.length === 1) {
        await api.deleteItem(deleteTarget.ids[0]);
      } else {
        await api.deleteItems(deleteTarget.ids);
      }
      fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleteTarget(null);
    }
  }

  function handleSortChange(field: SortField) {
    if (sort === field) {
      setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSort(field);
      setOrder('asc');
    }
    setPage(1);
  }

  const displayItems = searchResults !== null ? searchResults : items;
  const displayTotal = searchResults !== null ? searchResults.length : total;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setModalMode('document')}
                className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold"
              >
                <Upload className="w-4 h-4" />
                Upload files
              </Button>
              <Button
                onClick={() => setModalMode('folder')}
                className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold"
              >
                <FolderPlus className="w-4 h-4" />
                Add new folder
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6 w-64">
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pr-9"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
          </div>

          {/* Breadcrumb */}
          {trail.length > 0 && (
            <BreadcrumbNav trail={trail} onNavigate={handleNavigate} />
          )}

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          {/* Table */}
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : (
            <ItemsTable
              items={displayItems}
              total={displayTotal}
              page={page}
              limit={limit}
              sort={sort}
              order={order}
              onFolderClick={handleFolderClick}
              onDelete={handleDelete}
              onSortChange={handleSortChange}
              onPageChange={setPage}
              onLimitChange={(l) => { setLimit(l); setPage(1); }}
              onDeleteMany={handleDeleteMany}
            />
          )}
        </div>
      </div>

      {modalMode && (
        <AddItemModal
          open={true}
          mode={modalMode}
          parentId={currentFolderId}
          onClose={() => setModalMode(null)}
          onCreated={fetchItems}
        />
      )}

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Confirm Delete"
        description={deleteTarget?.label ?? ''}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
