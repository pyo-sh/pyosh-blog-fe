export const adminDashboardKeys = {
  all: () => ["admin", "dashboard"] as const,
  stats: () => [...adminDashboardKeys.all(), "stats"] as const,
};
