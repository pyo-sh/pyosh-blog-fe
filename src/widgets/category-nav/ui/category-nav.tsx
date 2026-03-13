import type { ReactNode } from "react";
import Link from "next/link";
import type { Category } from "@entities/category";
import { cn } from "@shared/lib/style-utils";

interface CategoryNavProps {
  categories: Category[];
  activeSlug?: string | null;
  className?: string;
}

export function CategoryNav({
  categories,
  activeSlug,
  className,
}: CategoryNavProps) {
  const visibleCategories = categories.filter((category) => category.isVisible);

  return (
    <nav
      aria-label="카테고리 네비게이션"
      className={cn("flex flex-wrap gap-2", className)}
    >
      <CategoryNavItem href="/" isActive={!activeSlug}>
        전체
      </CategoryNavItem>
      {visibleCategories.map((category) => (
        <CategoryNavItem
          key={category.id}
          href={`/categories/${category.slug}`}
          isActive={category.slug === activeSlug}
        >
          {category.name}
        </CategoryNavItem>
      ))}
    </nav>
  );
}

interface CategoryNavItemProps {
  href: string;
  isActive: boolean;
  children: ReactNode;
}

function CategoryNavItem({ href, isActive, children }: CategoryNavItemProps) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "inline-flex items-center rounded-full border px-4 py-2 text-body-sm transition-colors",
        isActive
          ? "border-primary-1 bg-primary-1 text-white"
          : "border-border-3 bg-background-2 text-text-3 hover:border-border-2 hover:text-text-1",
      )}
    >
      {children}
    </Link>
  );
}
