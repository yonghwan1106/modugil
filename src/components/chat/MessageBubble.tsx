interface ToolResult {
  toolName: string;
  input?: Record<string, unknown>;
  output?: {
    source?: string;
    region?: string;
    count?: number;
    items?: Record<string, unknown>[];
  };
}

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  toolResults?: unknown[];
  isLoading?: boolean;
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-2 mt-1">
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: '#1e293b' }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: '#d4a853' }} />
      </div>
      <span className="text-[10px] w-8 text-right" style={{ color: '#6b7280' }}>{pct}%</span>
    </div>
  );
}

/* Shared card wrapper with gold top accent */
function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="article"
      className="rounded-xl p-3 text-xs space-y-1.5"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #f1efe9',
        borderTop: '3px solid #d4a853',
      }}
    >
      {children}
    </div>
  );
}

/* Small gold circle behind emoji icon */
function CardIcon({ emoji }: { emoji: string }) {
  return (
    <span
      className="inline-flex items-center justify-center"
      style={{
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        backgroundColor: 'rgba(212,168,83,0.15)',
        fontSize: '12px',
        lineHeight: 1,
      }}
    >
      {emoji}
    </span>
  );
}

function TransportCard({ item }: { item: Record<string, unknown> }) {
  const available = Number(item.availableVehicles ?? 0);
  const total = Number(item.totalVehicles ?? 0);
  return (
    <CardShell>
      <div className="font-semibold flex items-center gap-1.5" style={{ color: '#0f172a' }}>
        <CardIcon emoji="🚐" />
        <span>{String(item.centerName ?? '이동지원센터')}</span>
      </div>
      <div style={{ color: '#4b5563' }}>
        운영 차량: <span className="font-medium" style={{ color: '#0f172a' }}>{total}대</span>
        {' · '}
        사용 가능: <span className="font-medium" style={{ color: '#0f172a' }}>{available}대</span>
      </div>
      {total > 0 && <ProgressBar value={available} max={total} />}
      <div style={{ color: '#6b7280' }}>
        예약 {String(item.reservations ?? 0)}건 · 대기 {String(item.waiting ?? 0)}명
      </div>
    </CardShell>
  );
}

function signalToKorean(signal: string): { label: string; color: string } {
  const s = signal.toLowerCase().replace(/-/g, ' ');
  if (s.includes('protected movement') || s.includes('green') || s.includes('녹') || s === 'g')
    return { label: '녹색(진행)', color: '#22c55e' };
  if (s.includes('yellow') || s.includes('caution') || s.includes('황') || s === 'y')
    return { label: '황색(주의)', color: '#eab308' };
  if (s.includes('stop and remain') || s.includes('red') || s.includes('적') || s === 'r')
    return { label: '적색(정지)', color: '#ef4444' };
  if (s.includes('stop then proceed'))
    return { label: '적색(정지 후 진행)', color: '#ef4444' };
  return { label: signal || '정보없음', color: '#94a3b8' };
}

function TrafficLightCard({ item }: { item: Record<string, unknown> }) {
  const directions = Array.isArray(item.directions) ? (item.directions as Record<string, unknown>[]) : [];
  // 보행자 신호만 우선 표시 (최대 8개)
  const filtered = directions.filter((_, i) => i < 8);
  return (
    <CardShell>
      <div className="font-semibold flex items-center gap-1.5" style={{ color: '#0f172a' }}>
        <CardIcon emoji="🚦" />
        <span>{String(item.crossroadName ?? '신호등')}</span>
      </div>
      {filtered.length > 0 ? (
        filtered.map((dir, i) => {
          const { label, color: dotColor } = signalToKorean(String(dir.signal ?? ''));
          return (
            <div key={i} className="flex items-center gap-1.5" style={{ color: '#4b5563' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: dotColor,
                  boxShadow: `0 0 4px ${dotColor}`,
                }}
              />
              {String(dir.direction ?? '')}: {label} {String(dir.remainSeconds ?? '')}초
            </div>
          );
        })
      ) : (
        <div style={{ color: '#6b7280' }}>신호 정보 없음</div>
      )}
    </CardShell>
  );
}

function LibraryCard({ item }: { item: Record<string, unknown> }) {
  const rooms = Array.isArray(item.readingRooms) ? (item.readingRooms as Record<string, unknown>[]) : [];
  return (
    <CardShell>
      <div className="font-semibold flex items-center gap-1.5" style={{ color: '#0f172a' }}>
        <CardIcon emoji="📚" />
        <span>{String(item.libraryName ?? '도서관')}</span>
      </div>
      {rooms.length > 0 ? (
        rooms.map((room, i) => {
          const used = Number(room.used ?? 0);
          const total = Number(room.total ?? 0);
          return (
            <div key={i} className="space-y-0.5">
              <div className="font-medium" style={{ color: '#0f172a' }}>{String(room.name ?? `열람실 ${i + 1}`)}</div>
              <div style={{ color: '#4b5563' }}>
                사용: <span className="font-medium">{used}/{total}석</span>
              </div>
              {total > 0 && <ProgressBar value={used} max={total} />}
            </div>
          );
        })
      ) : (
        <div style={{ color: '#6b7280' }}>좌석 정보 없음</div>
      )}
    </CardShell>
  );
}

function CivilOfficeCard({ item }: { item: Record<string, unknown> }) {
  const tasks = Array.isArray(item.tasks) ? (item.tasks as Record<string, unknown>[]) : [];
  return (
    <CardShell>
      <div className="font-semibold flex items-center gap-1.5" style={{ color: '#0f172a' }}>
        <CardIcon emoji="🏢" />
        <span>{String(item.officeName ?? '민원실')}</span>
      </div>
      {tasks.length > 0 ? (
        tasks.map((task, i) => (
          <div key={i} style={{ color: '#4b5563' }}>
            {String(task.taskName ?? `업무 ${i + 1}`)}: <span className="font-medium" style={{ color: '#0f172a' }}>{String(task.waitingCount ?? 0)}명 대기</span>
          </div>
        ))
      ) : (
        <div style={{ color: '#6b7280' }}>대기 정보 없음</div>
      )}
    </CardShell>
  );
}

function BusCard({ item }: { item: Record<string, unknown> }) {
  const locations = Array.isArray(item.realtimeLocations) ? item.realtimeLocations : [];
  return (
    <CardShell>
      <div className="font-semibold flex items-center gap-1.5" style={{ color: '#0f172a' }}>
        <CardIcon emoji="🚌" />
        <span>{String(item.routeNo ?? item.routeName ?? '버스')}</span>
        {item.routeType != null && (
          <span
            className="ml-1 text-[10px] rounded px-1"
            style={{ backgroundColor: 'rgba(212,168,83,0.15)', color: '#0f172a' }}
          >
            {String(item.routeType)}
          </span>
        )}
      </div>
      {item.startStop != null && (
        <div className="text-[10px]" style={{ color: '#6b7280' }}>
          {String(item.startStop)} → {String(item.endStop ?? '')}
        </div>
      )}
      <div style={{ color: '#4b5563' }}>
        운행 차량: <span className="font-medium" style={{ color: '#0f172a' }}>{locations.length}대</span>
      </div>
    </CardShell>
  );
}

function BicycleCard({ item }: { item: Record<string, unknown> }) {
  const available = Number(item.availableBikes ?? item.available ?? 0);
  const total = Number(item.totalSlots ?? item.totalDocks ?? 0);
  return (
    <CardShell>
      <div className="font-semibold flex items-center gap-1.5" style={{ color: '#0f172a' }}>
        <CardIcon emoji="🚲" />
        <span>{String(item.stationName ?? item.name ?? '대여소')}</span>
      </div>
      {item.address ? (
        <div className="text-[10px]" style={{ color: '#6b7280' }}>{String(item.address)}</div>
      ) : null}
      <div style={{ color: '#4b5563' }}>
        대여 가능: <span className="font-medium" style={{ color: '#0f172a' }}>{available}대</span>
        {' · '}
        전체 거치대: <span className="font-medium" style={{ color: '#0f172a' }}>{total}대</span>
      </div>
      {total > 0 && <ProgressBar value={available} max={total} />}
    </CardShell>
  );
}

function LockerCard({ item }: { item: Record<string, unknown> }) {
  const avail = item.available && typeof item.available === 'object'
    ? (item.available as Record<string, unknown>)
    : {};
  const large = Number(avail.large ?? 0);
  const medium = Number(avail.medium ?? 0);
  const small = Number(avail.small ?? 0);
  const total = large + medium + small;
  return (
    <CardShell>
      <div className="font-semibold flex items-center gap-1.5" style={{ color: '#0f172a' }}>
        <CardIcon emoji="🔒" />
        <span>{String(item.lockerName ?? '물품보관함')}</span>
      </div>
      <div className="space-y-0.5" style={{ color: '#4b5563' }}>
        <div>대형: <span className="font-medium" style={{ color: '#0f172a' }}>{large}개</span></div>
        <div>중형: <span className="font-medium" style={{ color: '#0f172a' }}>{medium}개</span></div>
        <div>소형: <span className="font-medium" style={{ color: '#0f172a' }}>{small}개</span></div>
      </div>
      <div style={{ color: '#6b7280' }}>
        전체 사용 가능: <span className="font-medium" style={{ color: '#0f172a' }}>{total}개</span>
      </div>
    </CardShell>
  );
}

function ToolResultCard({ result }: { result: ToolResult }) {
  const allItems = result.output?.items ?? [];
  const items = allItems.slice(0, 5);
  const hiddenCount = allItems.length - items.length;

  const labelMap: Record<string, string> = {
    get_accessible_transport: '교통약자 이동지원 현황',
    get_traffic_light_status: '신호등 현황',
    get_bus_realtime_location: '버스 실시간 위치',
    get_library_seats: '도서관 좌석 현황',
    get_civil_office_wait: '민원실 대기 현황',
    get_locker_availability: '물품보관함 현황',
    get_bicycle_availability: '공영자전거 대여 현황',
  };

  const label = labelMap[result.toolName] ?? result.toolName;

  const renderItem = (item: Record<string, unknown>, idx: number) => {
    switch (result.toolName) {
      case 'get_accessible_transport': return <TransportCard key={idx} item={item} />;
      case 'get_traffic_light_status': return <TrafficLightCard key={idx} item={item} />;
      case 'get_library_seats': return <LibraryCard key={idx} item={item} />;
      case 'get_civil_office_wait': return <CivilOfficeCard key={idx} item={item} />;
      case 'get_bus_realtime_location': return <BusCard key={idx} item={item} />;
      case 'get_locker_availability': return <LockerCard key={idx} item={item} />;
      case 'get_bicycle_availability': return <BicycleCard key={idx} item={item} />;
      default:
        return (
          <CardShell key={idx}>
            <pre className="overflow-x-auto whitespace-pre-wrap break-all" style={{ color: '#4b5563' }}>
              {JSON.stringify(item, null, 2)}
            </pre>
          </CardShell>
        );
    }
  };

  return (
    <div className="space-y-1.5">
      {/* Section header: serif font, navy text, gold left accent */}
      <div
        className="font-serif font-semibold text-[11px] px-2 py-0.5"
        style={{
          color: '#0f172a',
          borderLeft: '3px solid #d4a853',
        }}
      >
        {label}
      </div>
      {items.length > 0 ? (
        <>
          {items.map((item, idx) => renderItem(item, idx))}
          {hiddenCount > 0 && (
            <div className="text-center text-[10px] py-1" style={{ color: '#94a3b8' }}>
              외 {hiddenCount}건 (총 {allItems.length}건 조회)
            </div>
          )}
        </>
      ) : (
        <CardShell>
          <div style={{ color: '#6b7280' }}>조회된 항목이 없습니다.</div>
        </CardShell>
      )}
    </div>
  );
}

export default function MessageBubble({ role, content, toolResults, isLoading }: MessageBubbleProps) {
  const isUser = role === 'user';

  const typedResults = (toolResults ?? []).filter(
    (r): r is ToolResult =>
      r != null && typeof r === 'object' && 'toolName' in (r as object),
  ) as ToolResult[];

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1`}>
      <div
        className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
        style={
          isUser
            ? {
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: '#ffffff',
                borderBottomRightRadius: '4px',
              }
            : {
                backgroundColor: '#faf9f7',
                color: '#0f172a',
                borderBottomLeftRadius: '4px',
                borderLeft: '3px solid #0f172a',
                boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
              }
        }
      >
        {isLoading ? (
          <div className="flex items-center gap-1.5 py-0.5">
            <span
              className="w-2 h-2 rounded-full animate-bounce [animation-delay:0ms]"
              style={{ backgroundColor: '#0f172a' }}
            />
            <span
              className="w-2 h-2 rounded-full animate-bounce [animation-delay:150ms]"
              style={{ backgroundColor: '#0f172a' }}
            />
            <span
              className="w-2 h-2 rounded-full animate-bounce [animation-delay:300ms]"
              style={{ backgroundColor: '#0f172a' }}
            />
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{content}</p>
        )}
      </div>

      {typedResults.length > 0 && (
        <div className="max-w-[90%] w-full space-y-3">
          {typedResults.map((result, idx) => (
            <ToolResultCard key={idx} result={result} />
          ))}
        </div>
      )}
    </div>
  );
}
