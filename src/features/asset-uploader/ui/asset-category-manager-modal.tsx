"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react/offline";
import closeCircleLinear from "@iconify-icons/solar/close-circle-linear";
import trashBinMinimalisticLinear from "@iconify-icons/solar/trash-bin-minimalistic-linear";
import type { AssetCategory } from "@entities/asset";
import { getAssetCategoryTone } from "@entities/asset";
import { cn } from "@shared/lib/style-utils";
import { Modal, Spinner } from "@shared/ui/libs";

interface AssetCategoryManagerModalProps {
  isOpen: boolean;
  categories: AssetCategory[];
  pendingCategoryId: number | null;
  isMutating: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
  onRename: (category: AssetCategory, name: string) => void;
  onDelete: (category: AssetCategory) => void;
}

export function AssetCategoryManagerModal({
  isOpen,
  categories,
  pendingCategoryId,
  isMutating,
  onClose,
  onCreate,
  onRename,
  onDelete,
}: AssetCategoryManagerModalProps) {
  const [newName, setNewName] = useState("");
  const [draftNames, setDraftNames] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!isOpen) {
      setNewName("");
      setDraftNames({});

      return;
    }

    setDraftNames(
      Object.fromEntries(
        categories.map((category) => [category.id, category.name]),
      ),
    );
  }, [categories, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      withBackground
      aria-label="에셋 카테고리 관리"
      className="w-[min(100%,38rem)] p-0 text-left"
    >
      <div className="flex max-h-[86vh] flex-col overflow-hidden rounded-3xl bg-background-1">
        <div className="flex items-start justify-between gap-4 border-b border-border-3 px-6 py-5">
          <div>
            <p className="text-body-xs uppercase tracking-[0.2em] text-text-4">
              Asset categories
            </p>
            <h2 className="mt-2 text-xl font-semibold text-text-1">
              에셋 카테고리 관리
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-3 transition-colors hover:bg-background-2 hover:text-text-1"
            aria-label="카테고리 관리 닫기"
          >
            <Icon icon={closeCircleLinear} width="22" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <form
            className="mb-5 flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const trimmed = newName.trim();
              if (!trimmed) {
                return;
              }
              onCreate(trimmed);
              setNewName("");
            }}
          >
            <input
              type="text"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              disabled={isMutating}
              placeholder="새 카테고리 이름"
              className="h-10 min-w-0 flex-1 rounded-xl border border-border-3 bg-background-1 px-3 text-sm text-text-2 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isMutating || newName.trim().length === 0}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary-1 px-4 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            >
              추가
            </button>
          </form>

          <div className="space-y-3">
            {categories.map((category) => {
              const draft = draftNames[category.id] ?? category.name;
              const isPending = pendingCategoryId === category.id;
              const isChanged = draft.trim() !== category.name;

              return (
                <div
                  key={category.id}
                  className="rounded-2xl border border-border-4 bg-background-2 p-3"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full border px-2 py-1 text-[11px] font-semibold",
                        getAssetCategoryTone(category),
                      )}
                    >
                      {category.name}
                    </span>
                    {category.isProtected ? (
                      <span className="rounded-full border border-border-3 px-2 py-1 text-[11px] text-text-4">
                        고정
                      </span>
                    ) : null}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
                    <input
                      type="text"
                      value={draft}
                      onChange={(event) =>
                        setDraftNames((current) => ({
                          ...current,
                          [category.id]: event.target.value,
                        }))
                      }
                      disabled={isMutating}
                      className="h-10 rounded-xl border border-border-3 bg-background-1 px-3 text-sm text-text-2 outline-none transition-colors focus:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label={`${category.name} 이름`}
                    />
                    <button
                      type="button"
                      onClick={() => onRename(category, draft.trim())}
                      disabled={isMutating || !isChanged || !draft.trim()}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-border-3 px-3 text-sm font-medium text-text-2 transition-colors hover:border-border-2 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isPending ? <Spinner size="sm" /> : null}
                      저장
                    </button>
                    {!category.isProtected ? (
                      <button
                        type="button"
                        onClick={() => onDelete(category)}
                        disabled={isMutating}
                        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-negative-1/25 px-3 text-sm font-medium text-negative-1 transition-colors hover:bg-negative-1/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Icon icon={trashBinMinimalisticLinear} width="15" />
                        삭제
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
