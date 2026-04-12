export default function DashboardLoading() {
  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#faf9f7' }}>
      <div
        className="h-16 shrink-0"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #263348 100%)' }}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <div className="h-7 w-64 rounded bg-gray-200 animate-pulse mb-2" />
          <div style={{ width: 48, height: 3, backgroundColor: '#d4a853', borderRadius: 2 }} />
          <div className="h-4 w-48 rounded bg-gray-200 animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl p-4 animate-pulse" style={{ backgroundColor: '#0f172a' }}>
              <div className="h-4 w-24 rounded bg-slate-700 mb-3" />
              <div className="h-8 w-16 rounded bg-slate-700 mb-1" />
              <div className="h-3 w-20 rounded bg-slate-700" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="rounded-xl p-5 border animate-pulse" style={{ borderColor: '#e2e0dc' }}>
              <div className="h-5 w-40 rounded bg-gray-200 mb-4" />
              <div className="h-[240px] rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
