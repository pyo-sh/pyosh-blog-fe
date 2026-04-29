interface TotalViewCountProps {
  totalPageviews: number;
}

export function TotalViewCount({ totalPageviews }: TotalViewCountProps) {
  return (
    <div>
      <div className="text-[1.5rem] font-bold tabular-nums text-text-1">
        {totalPageviews.toLocaleString("ko-KR")}
      </div>
      <div className="mt-0.5 text-ui-xs text-text-4">Total Visitors</div>
    </div>
  );
}
