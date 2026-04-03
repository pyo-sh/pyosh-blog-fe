"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CategoryDeleteModal } from "./category-delete-modal";
import {
  CategoryFormModal,
  type CategoryFormValues,
  toCreateCategoryBody,
  toUpdateCategoryBody,
} from "./category-form-modal";
import { CategoryTree } from "./category-tree";
import {
  createCategory,
  deleteCategory,
  fetchCategoriesAdmin,
  updateCategoryTree,
  updateCategory,
  type Category,
  type CategoryTreeChange,
  type DeleteCategoryOptions,
} from "@entities/category";
import { getErrorMessage } from "@shared/lib/get-error-message";
import { Skeleton } from "@shared/ui/libs";

const QUERY_KEY = ["admin-categories"] as const;

type FormMode = "create" | "edit";

export function CategoryManager() {
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState<{
    open: boolean;
    mode: FormMode;
    category: Category | null;
  }>({
    open: false,
    mode: "create",
    category: null,
  });
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );

  const categoriesQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => fetchCategoriesAdmin(),
  });

  const categories = categoriesQuery.data ?? [];
  const parentOptions = useMemo(
    () => getParentOptions(categories, formState.category),
    [categories, formState.category],
  );

  const createMutation = useMutation({
    mutationFn: (values: CategoryFormValues) =>
      createCategory(toCreateCategoryBody(values)),
    onSuccess: async () => {
      setFormState({ open: false, mode: "create", category: null });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "카테고리 추가에 실패했습니다."));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: CategoryFormValues }) =>
      updateCategory(id, toUpdateCategoryBody(values)),
    onSuccess: async () => {
      setFormState({ open: false, mode: "create", category: null });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "카테고리 수정에 실패했습니다."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({
      id,
      options,
    }: {
      id: number;
      options: DeleteCategoryOptions;
    }) => deleteCategory(id, options),
    onSuccess: async () => {
      setCategoryToDelete(null);
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "카테고리 삭제에 실패했습니다."));
    },
  });

  const bulkVisibilityMutation = useMutation({
    mutationFn: async ({
      ids,
      isVisible,
    }: {
      ids: number[];
      isVisible: boolean;
    }) => {
      await Promise.all(ids.map((id) => updateCategory(id, { isVisible })));
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success(
        variables.isVisible
          ? "선택한 카테고리를 표시했습니다."
          : "선택한 카테고리를 숨겼습니다.",
      );
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(error, "카테고리 공개 상태 변경에 실패했습니다."),
      );
    },
  });

  const visibilityMutation = useMutation({
    mutationFn: (category: Category) =>
      updateCategory(category.id, { isVisible: !category.isVisible }),
    onSuccess: async (_data, category) => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success(
        category.isVisible
          ? "카테고리를 숨겼습니다."
          : "카테고리를 표시했습니다.",
      );
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(error, "카테고리 표시 상태 변경에 실패했습니다."),
      );
    },
  });

  const treeUpdateMutation = useMutation({
    mutationFn: (changes: CategoryTreeChange[]) => updateCategoryTree(changes),
    onSuccess: async (_data, changes) => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success(`배치 편집 변경사항 ${changes.length}건을 저장했습니다.`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "카테고리 트리 저장에 실패했습니다."));
    },
  });

  const handleCreate = () => {
    setFormState({ open: true, mode: "create", category: null });
  };

  const handleEdit = (category: Category) => {
    setFormState({ open: true, mode: "edit", category });
  };

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category);
  };

  const handleSubmit = (values: CategoryFormValues) => {
    if (formState.mode === "create") {
      createMutation.mutate(values);

      return;
    }

    if (!formState.category) {
      return;
    }

    updateMutation.mutate({
      id: formState.category.id,
      values,
    });
  };

  return (
    <div className="space-y-4">
      <section className="bg-background-1 p-0">
        <div>
          {categoriesQuery.isPending ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={index}
                  variant="rect"
                  height="6rem"
                  className="rounded-[1.25rem]"
                />
              ))}
            </div>
          ) : null}

          {!categoriesQuery.isPending && categoriesQuery.isError ? (
            <div className="rounded-[1.5rem] border border-negative-1/20 bg-negative-1/10 px-6 py-8 text-center">
              <p className="text-sm text-negative-1">
                {getErrorMessage(
                  categoriesQuery.error,
                  "카테고리 목록을 불러오지 못했습니다.",
                )}
              </p>
              <button
                type="button"
                onClick={() => void categoriesQuery.refetch()}
                className="mt-4 inline-flex rounded-[0.75rem] border border-negative-1/20 px-4 py-2 text-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/10"
              >
                다시 시도
              </button>
            </div>
          ) : null}

          {!categoriesQuery.isPending && !categoriesQuery.isError ? (
            <CategoryTree
              categories={categories}
              totalCount={countCategories(categories)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleVisibility={async (category) => {
                await visibilityMutation.mutateAsync(category);
              }}
              onCreate={handleCreate}
              onBulkVisibilityChange={async (ids, isVisible) => {
                await bulkVisibilityMutation.mutateAsync({ ids, isVisible });
              }}
              onSaveTree={async (changes) => {
                await treeUpdateMutation.mutateAsync(changes);
              }}
              isBulkUpdating={bulkVisibilityMutation.isPending}
              isSavingTree={treeUpdateMutation.isPending}
            />
          ) : null}
        </div>
      </section>

      <CategoryFormModal
        isOpen={formState.open}
        mode={formState.mode}
        category={formState.category}
        parentOptions={parentOptions}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onClose={() =>
          setFormState({ open: false, mode: "create", category: null })
        }
        onSubmit={handleSubmit}
      />

      <CategoryDeleteModal
        category={categoryToDelete}
        categories={categories}
        isDeleting={deleteMutation.isPending}
        onCancel={() => setCategoryToDelete(null)}
        onConfirm={(options) => {
          if (categoryToDelete) {
            deleteMutation.mutate({
              id: categoryToDelete.id,
              options,
            });
          }
        }}
      />
    </div>
  );
}

function countCategories(categories: Category[]): number {
  return categories.reduce((total, category) => {
    return total + 1 + countCategories(category.children ?? []);
  }, 0);
}

function getParentOptions(
  categories: Category[],
  editingCategory: Category | null,
): Array<{ id: number; label: string }> {
  const excludedIds = editingCategory
    ? new Set([editingCategory.id, ...collectDescendantIds(editingCategory)])
    : new Set<number>();

  return flattenCategories(categories)
    .filter((category) => !excludedIds.has(category.id))
    .map(({ id, name, depth }) => ({
      id,
      label: `${"— ".repeat(depth)}${name}`,
    }));
}

function flattenCategories(
  categories: Category[],
  depth = 0,
): Array<{ id: number; name: string; depth: number }> {
  return categories.flatMap((category) => [
    { id: category.id, name: category.name, depth },
    ...flattenCategories(category.children ?? [], depth + 1),
  ]);
}

function collectDescendantIds(category: Category): number[] {
  return (category.children ?? []).flatMap((child) => [
    child.id,
    ...collectDescendantIds(child),
  ]);
}
