interface SkeletonCardProps {
  height?: string
  lines?: number
}

export function SkeletonCard({ height = "h-32", lines = 2 }: SkeletonCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-4 ${height} flex animate-pulse`}>
      <div className="w-20 h-20 bg-gray-200 rounded-lg shrink-0 mr-4"></div>
      <div className="flex-1 space-y-3 py-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={`h-3 bg-gray-200 rounded ${i === lines - 1 ? 'w-1/2' : 'w-full'}`}></div>
        ))}
      </div>
    </div>
  )
}
