export interface SavedResource {
  id: string;
  url: string;
  type: 'article' | 'youtube' | 'pdf' | 'other';
  title?: string;
  thumbnail?: string;
  description?: string;
  tags: string[];
  folder?: string;
  notes?: string;
  isRead: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LibraryListResponse {
  data: SavedResource[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
