import { PostStatusSection } from "./post-status-section";
import { RecentCommentsSection } from "./recent-comments-section";
import { StatsSection } from "./stats-section";
import type { AdminCommentItem } from "@entities/comment";
import type { DashboardStats } from "@entities/stat";
import type { PaginatedResponse } from "@shared/api";

export function DashboardHome({
  statsOverride,
  recentCommentsOverride,
}: {
  statsOverride?: DashboardStats;
  recentCommentsOverride?: PaginatedResponse<AdminCommentItem>;
}) {
  return (
    <div className="space-y-8">
      <StatsSection dataOverride={statsOverride} />
      <PostStatusSection dataOverride={statsOverride} />
      <RecentCommentsSection commentsOverride={recentCommentsOverride} />
    </div>
  );
}
