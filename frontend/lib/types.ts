export type ItemType = 'folder' | 'document';

export interface Item {
  id: number;
  name: string;
  type: ItemType;
  parentId: number | null;
  mimeType: string | null;
  size: number | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse {
  items: Item[];
  total: number;
  page: number;
  limit: number;
  parent?: Item;
}

export interface SearchResponse {
  items: Item[];
}

export type SortField = 'name' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export const MIME_TYPE_OPTIONS = [
  { label: 'PDF', value: 'application/pdf' },
  { label: 'Word Document', value: 'application/msword' },
  { label: 'Excel Spreadsheet', value: 'application/vnd.ms-excel' },
  { label: 'Image (PNG)', value: 'image/png' },
  { label: 'Image (JPEG)', value: 'image/jpeg' },
  { label: 'Text File', value: 'text/plain' },
] as const;

export function formatFileSize(bytes: number | null): string {
  if (bytes === null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
