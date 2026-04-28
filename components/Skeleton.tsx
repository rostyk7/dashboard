export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded bg-gray-200 ${className ?? ""}`}
    />
  );
}

export function StatsBarSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading stats"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <Skeleton className="h-3 w-24 mb-3" />
          <Skeleton className="h-7 w-16 mb-2" />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  );
}

export function OrdersTableSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading orders"
      className="rounded-xl border border-gray-200 overflow-hidden bg-white"
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500 w-36">Order ID</th>
            <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Customer</th>
            <th scope="col" className="text-right px-4 py-3 font-medium text-gray-500">Amount</th>
            <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
            <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Created</th>
            <th scope="col" className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i}>
              <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
              <td className="px-4 py-3 hidden sm:table-cell"><Skeleton className="h-4 w-36" /></td>
              <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
              <td className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
              <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-24" /></td>
              <td className="px-4 py-3"><Skeleton className="h-4 w-8 ml-auto" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading order" className="p-8 max-w-4xl">
      <Skeleton className="h-4 w-20 mb-6" />
      <div className="flex items-start justify-between mt-4 mb-8">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1].map((i) => (
          <div key={i}>
            <Skeleton className="h-4 w-28 mb-3" />
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-10" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
