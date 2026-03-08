import {
  Item,
  PaginatedResponse,
  SearchResponse,
  SortField,
  SortOrder,
  ItemType,
} from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface ListParams {
  page?: number;
  limit?: number;
  sort?: SortField;
  order?: SortOrder;
}

export const api = {
  getRootItems(params: ListParams = {}): Promise<PaginatedResponse> {
    const qs = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 10),
      sort: params.sort ?? 'createdAt',
      order: params.order ?? 'asc',
    });
    return request<PaginatedResponse>(`/items?${qs}`);
  },

  getChildren(id: number, params: ListParams = {}): Promise<PaginatedResponse> {
    const qs = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 10),
      sort: params.sort ?? 'createdAt',
      order: params.order ?? 'asc',
    });
    return request<PaginatedResponse>(`/items/${id}/children?${qs}`);
  },

  createItem(data: {
    name: string;
    type: ItemType;
    parentId?: number | null;
    mimeType?: string;
    size?: number;
    createdBy: string;
  }): Promise<Item> {
    return request<Item>('/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteItem(id: number): Promise<void> {
    return request<void>(`/items/${id}`, { method: 'DELETE' });
  },

  deleteItems(ids: number[]): Promise<void> {
    return request<void>('/items', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    });
  },

  search(q: string): Promise<SearchResponse> {
    const qs = new URLSearchParams({ q });
    return request<SearchResponse>(`/items/search?${qs}`);
  },
};
