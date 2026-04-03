import type { Category, CategoryTreeChange } from "@entities/category";

export type CategoryTreeMode = "view" | "select" | "edit";
export type DropPosition = "before" | "inside" | "after";
export type ChangeMarker = "moved" | "new-parent";

export interface FlatCategoryNode {
  category: Category;
  depth: number;
  hasVisibleChildren: boolean;
}

export interface DropTarget {
  targetId: number;
  position: DropPosition;
  invalid: boolean;
}

const ROW_DROP_PREFIX = "category-row";

export function cloneCategoryTree(categories: Category[]): Category[] {
  return categories.map((category) => ({
    ...category,
    children: cloneCategoryTree(category.children ?? []),
  }));
}

export function filterVisibleCategories(
  categories: Category[],
  showHidden: boolean,
): Category[] {
  return categories.flatMap((category) => {
    if (!showHidden && !category.isVisible) {
      return [];
    }

    return [
      {
        ...category,
        children: filterVisibleCategories(category.children ?? [], showHidden),
      },
    ];
  });
}

export function collectExpandableIds(
  categories: Category[],
  showHidden: boolean,
): Set<number> {
  const ids = new Set<number>();

  const traverse = (nodes: Category[]) => {
    for (const node of nodes) {
      const visibleChildren = filterVisibleCategories(
        node.children ?? [],
        showHidden,
      );

      if (visibleChildren.length > 0) {
        ids.add(node.id);
        traverse(visibleChildren);
      }
    }
  };

  traverse(filterVisibleCategories(categories, showHidden));

  return ids;
}

export function flattenCategoryTree(
  categories: Category[],
  expandedIds: Set<number>,
  showHidden: boolean,
): FlatCategoryNode[] {
  const flattened: FlatCategoryNode[] = [];

  const traverse = (nodes: Category[], depth: number) => {
    for (const node of nodes) {
      const visibleChildren = filterVisibleCategories(
        node.children ?? [],
        showHidden,
      );

      flattened.push({
        category: node,
        depth,
        hasVisibleChildren: visibleChildren.length > 0,
      });

      if (visibleChildren.length > 0 && expandedIds.has(node.id)) {
        traverse(visibleChildren, depth + 1);
      }
    }
  };

  traverse(filterVisibleCategories(categories, showHidden), 0);

  return flattened;
}

export function getDisplayedCategoryIds(
  categories: Category[],
  expandedIds: Set<number>,
  showHidden: boolean,
): number[] {
  return flattenCategoryTree(categories, expandedIds, showHidden).map(
    ({ category }) => category.id,
  );
}

export function calculateTreeChanges(
  originalTree: Category[],
  currentTree: Category[],
): CategoryTreeChange[] {
  const originalMap = buildTreeIndex(originalTree);
  const currentMap = buildTreeIndex(currentTree);

  return Array.from(currentMap.entries())
    .flatMap(([id, currentNode]) => {
      const originalNode = originalMap.get(id);

      if (!originalNode) {
        return [];
      }

      if (
        originalNode.parentId === currentNode.parentId &&
        originalNode.sortOrder === currentNode.sortOrder
      ) {
        return [];
      }

      return [
        {
          id,
          parentId: currentNode.parentId,
          sortOrder: currentNode.sortOrder,
        },
      ];
    })
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export function getChangeMarkerMap(
  originalTree: Category[],
  currentTree: Category[],
): Map<number, ChangeMarker> {
  const markerMap = new Map<number, ChangeMarker>();
  const originalMap = buildTreeIndex(originalTree);
  const currentMap = buildTreeIndex(currentTree);

  for (const [id, currentNode] of currentMap.entries()) {
    const originalNode = originalMap.get(id);

    if (!originalNode) {
      continue;
    }

    if (originalNode.parentId !== currentNode.parentId) {
      markerMap.set(id, "new-parent");
      continue;
    }

    if (originalNode.sortOrder !== currentNode.sortOrder) {
      markerMap.set(id, "moved");
    }
  }

  return markerMap;
}

export function isDropBlocked(
  categories: Category[],
  activeId: number,
  targetId: number,
): boolean {
  if (activeId === targetId) {
    return true;
  }

  return isDescendant(categories, activeId, targetId);
}

export function moveCategory(
  categories: Category[],
  activeId: number,
  target: Pick<DropTarget, "targetId" | "position">,
): Category[] {
  const clonedTree = cloneCategoryTree(categories);
  const removed = removeCategory(clonedTree, activeId);

  if (!removed) {
    return clonedTree;
  }

  const { removedCategory } = removed;

  if (target.position === "inside") {
    const parentNode = findCategory(clonedTree, target.targetId);

    if (!parentNode) {
      return categories;
    }

    const nextChildren = [...(parentNode.children ?? []), removedCategory];
    parentNode.children = nextChildren;
    normalizeSiblingOrder(nextChildren, parentNode.id);

    return normalizeTree(clonedTree, null);
  }

  const parentChildren = findSiblingList(clonedTree, target.targetId);

  if (!parentChildren) {
    return categories;
  }

  const targetIndex = parentChildren.items.findIndex(
    (item) => item.id === target.targetId,
  );

  if (targetIndex === -1) {
    return categories;
  }

  const insertIndex =
    target.position === "before" ? targetIndex : targetIndex + 1;

  parentChildren.items.splice(insertIndex, 0, removedCategory);
  normalizeSiblingOrder(parentChildren.items, parentChildren.parentId);

  return normalizeTree(clonedTree, null);
}

export function buildRowDropId(categoryId: number): string {
  return `${ROW_DROP_PREFIX}:${categoryId}`;
}

export function parseRowDropId(value: string): { targetId: number } | null {
  const [prefix, categoryId] = value.split(":");

  if (prefix !== ROW_DROP_PREFIX) {
    return null;
  }

  const targetId = Number(categoryId);

  if (!Number.isFinite(targetId)) {
    return null;
  }

  return {
    targetId,
  };
}

function buildTreeIndex(
  categories: Category[],
  parentId: number | null = null,
  map = new Map<number, { parentId: number | null; sortOrder: number }>(),
): Map<number, { parentId: number | null; sortOrder: number }> {
  categories.forEach((category, index) => {
    map.set(category.id, {
      parentId,
      sortOrder: category.sortOrder ?? index,
    });
    buildTreeIndex(category.children ?? [], category.id, map);
  });

  return map;
}

function isDescendant(
  categories: Category[],
  ancestorId: number,
  targetId: number,
): boolean {
  const ancestor = findCategory(categories, ancestorId);

  if (!ancestor) {
    return false;
  }

  const stack = [...(ancestor.children ?? [])];

  while (stack.length > 0) {
    const current = stack.pop();

    if (!current) {
      continue;
    }

    if (current.id === targetId) {
      return true;
    }

    stack.push(...(current.children ?? []));
  }

  return false;
}

function findCategory(
  categories: Category[],
  targetId: number,
): Category | null {
  for (const category of categories) {
    if (category.id === targetId) {
      return category;
    }

    const childMatch = findCategory(category.children ?? [], targetId);

    if (childMatch) {
      return childMatch;
    }
  }

  return null;
}

function removeCategory(
  categories: Category[],
  targetId: number,
  parentId: number | null = null,
): {
  tree: Category[];
  removedCategory: Category;
  parentId: number | null;
} | null {
  const index = categories.findIndex((category) => category.id === targetId);

  if (index !== -1) {
    const [removedCategory] = categories.splice(index, 1);
    normalizeSiblingOrder(categories, parentId);

    return {
      tree: categories,
      removedCategory,
      parentId,
    };
  }

  for (const category of categories) {
    const result = removeCategory(
      category.children ?? [],
      targetId,
      category.id,
    );

    if (result) {
      category.children = result.tree;

      return result;
    }
  }

  return null;
}

function findSiblingList(
  categories: Category[],
  targetId: number,
  parentId: number | null = null,
): { items: Category[]; parentId: number | null } | null {
  const containsTarget = categories.some(
    (category) => category.id === targetId,
  );

  if (containsTarget) {
    return { items: categories, parentId };
  }

  for (const category of categories) {
    const result = findSiblingList(
      category.children ?? [],
      targetId,
      category.id,
    );

    if (result) {
      return result;
    }
  }

  return null;
}

function normalizeTree(
  categories: Category[],
  parentId: number | null,
): Category[] {
  normalizeSiblingOrder(categories, parentId);

  categories.forEach((category) => {
    category.children = normalizeTree(category.children ?? [], category.id);
  });

  return categories;
}

function normalizeSiblingOrder(
  categories: Category[],
  parentId: number | null,
): void {
  categories.forEach((category, index) => {
    category.parentId = parentId;
    category.sortOrder = index;
  });
}
