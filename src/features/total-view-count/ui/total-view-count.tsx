interface TotalViewCountProps {
  totalPageviews: number;
}

export function TotalViewCount({ totalPageviews }: TotalViewCountProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-body-sm text-text-3">블로그 조회수</span>
      <span className="text-body-sm font-medium text-text-1">
        {totalPageviews.toLocaleString("ko-KR")}
      </span>
    </div>
  );
}
