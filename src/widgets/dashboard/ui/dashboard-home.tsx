import { PostStatusSection } from "./post-status-section";
import { RecentCommentsSection } from "./recent-comments-section";
import { StatsSection } from "./stats-section";

export function DashboardHome() {
  return (
    <div className="space-y-8">
      <StatsSection />
      <PostStatusSection />
      <RecentCommentsSection />
    </div>
  );
}
