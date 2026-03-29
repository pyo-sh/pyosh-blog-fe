interface TotalViewCountProps {
  totalPageviews: number;
}

export function TotalViewCount({ totalPageviews }: TotalViewCountProps) {
  return (
    <div>
      <div className="font-['Outfit','Gothic_A1',ui-sans-serif,sans-serif] text-[1.5rem] font-bold tracking-[-0.02em] text-text-1">
        {totalPageviews.toLocaleString("ko-KR")}
      </div>
      <div className="mt-0.5 text-ui-xs text-text-4">Total Visitors</div>
    </div>
  );
}
