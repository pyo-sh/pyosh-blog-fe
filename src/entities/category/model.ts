export interface Category {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
}

export interface CreateCategoryBody {
  name: string;
  parentId?: number | null;
  isVisible?: boolean;
}

export interface UpdateCategoryBody {
  name?: string;
  parentId?: number | null;
  isVisible?: boolean;
}

export interface UpdateCategoryOrderBody {
  items: Array<{
    id: number;
    sortOrder: number;
  }>;
}
