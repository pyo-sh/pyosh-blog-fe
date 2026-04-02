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
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-[1.75rem] border border-border-3 bg-background-2 p-6 shadow-[0px_18px_60px_0px_rgba(0,0,0,0.06)] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-body-xs uppercase tracking-[0.24em] text-text-4">
            Categories
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-text-1">
            카테고리 관리
          </h1>
          <p className="mt-2 text-sm text-text-3">
            카테고리 구조를 확인하고, 노출 여부와 부모 관계를 조정할 수
            있습니다.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center justify-center rounded-[0.9rem] bg-primary-1 px-4 py-3 text-sm font-medium text-text-1"
        >
          카테고리 추가
        </button>
      </header>

      <section className="rounded-[1.75rem] border border-border-3 bg-background-2 p-6">
        <div className="flex flex-col gap-4 border-b border-border-3 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-1">카테고리 트리</h2>
            <p className="mt-1 text-sm text-text-3">
              숨김 상태와 계층 구조를 한 번에 확인할 수 있습니다.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-[1rem] border border-border-3 bg-background-1 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-4">
                Total
              </p>
              <p className="mt-1 text-lg font-semibold text-text-1">
                {countCategories(categories)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
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
              onEdit={handleEdit}
              onDelete={handleDelete}
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
