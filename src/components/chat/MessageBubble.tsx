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
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-gray-500 text-[10px] w-8 text-right">{pct}%</span>
    </div>
  );
}

function TransportCard({ item }: { item: Record<string, unknown> }) {
  const available = Number(item.availableVehicles ?? 0);
  const total = Number(item.totalVehicles ?? 0);
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs space-y-1.5">
      <div className="font-semibold text-gray-800 flex items-center gap-1">
        <span>🚐</span>
        <span>{String(item.centerName ?? '이동지원센터')}</span>
      </div>
      <div className="text-gray-600">
        운영 차량: <span className="font-medium text-gray-800">{total}대</span>
        {' · '}
        사용 가능: <span className="font-medium text-green-700">{available}대</span>
      </div>
      {total > 0 && <ProgressBar value={available} max={total} />}
      <div className="text-gray-500">
        예약 {String(item.reservations ?? 0)}건 · 대기 {String(item.waiting ?? 0)}명
      </div>
    </div>
  );
}

function TrafficLightCard({ item }: { item: Record<string, unknown> }) {
  const phases = Array.isArray(item.phases) ? (item.phases as Record<string, unknown>[]) : [];
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs space-y-1.5">
      <div className="font-semibold text-gray-800 flex items-center gap-1">
        <span>🚦</span>
        <span>{String(item.crossroadName ?? '신호등')}</span>
      </div>
      {phases.length > 0 ? (
        phases.map((phase, i) => {
          const color = String(phase.color ?? '').toLowerCase();
          const dot = color === 'green' || color === '녹색' ? '🟢' : color === 'yellow' || color === '황색' ? '🟡' : '🔴';
          return (
            <div key={i} className="text-gray-600">
              {i + 1}방향: {dot} {String(phase.colorKo ?? phase.color ?? '')} {String(phase.duration ?? '')}초
            </div>
          );
        })
      ) : (
        <div className="text-gray-500">신호 정보 없음</div>
      )}
    </div>
  );
}

function LibraryCard({ item }: { item: Record<string, unknown> }) {
  const rooms = Array.isArray(item.rooms) ? (item.rooms as Record<string, unknown>[]) : [];
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs space-y-1.5">
      <div className="font-semibold text-gray-800 flex items-center gap-1">
        <span>📚</span>
        <span>{String(item.libraryName ?? '도서관')}</span>
      </div>
      {rooms.length > 0 ? (
        rooms.map((room, i) => {
          const occupied = Number(room.occupiedSeats ?? 0);
          const total = Number(room.totalSeats ?? 0);
          return (
            <div key={i} className="space-y-0.5">
              <div className="text-gray-700 font-medium">{String(room.roomName ?? `열람실 ${i + 1}`)}</div>
              <div className="text-gray-600">
                사용: <span className="font-medium">{occupied}/{total}석</span>
              </div>
              {total > 0 && <ProgressBar value={occupied} max={total} />}
            </div>
          );
        })
      ) : (
        <div className="text-gray-500">좌석 정보 없음</div>
      )}
    </div>
  );
}

function CivilOfficeCard({ item }: { item: Record<string, unknown> }) {
  const services = Array.isArray(item.services) ? (item.services as Record<string, unknown>[]) : [];
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs space-y-1.5">
      <div className="font-semibold text-gray-800 flex items-center gap-1">
        <span>🏢</span>
        <span>{String(item.officeName ?? '민원실')}</span>
      </div>
      {services.length > 0 ? (
        services.map((svc, i) => (
          <div key={i} className="text-gray-600">
            {String(svc.serviceName ?? `서비스 ${i + 1}`)}: <span className="font-medium text-gray-800">{String(svc.waitingCount ?? 0)}명 대기</span>
          </div>
        ))
      ) : (
        <div className="text-gray-500">대기 정보 없음</div>
      )}
    </div>
  );
}

function BusCard({ item }: { item: Record<string, unknown> }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs space-y-1.5">
      <div className="font-semibold text-gray-800 flex items-center gap-1">
        <span>🚌</span>
        <span>{String(item.routeNo ?? item.routeName ?? '버스')}</span>
        {item.routeType != null && (
          <span className="ml-1 text-[10px] bg-blue-100 text-blue-700 rounded px-1">{String(item.routeType)}</span>
        )}
      </div>
      <div className="text-gray-600">
        {String(item.plateNo ?? item.vehicleNo ?? '')}
        {item.speed != null && (
          <span> · 속도 {String(item.speed)}km/h</span>
        )}
      </div>
    </div>
  );
}

function LockerCard({ item }: { item: Record<string, unknown> }) {
  const available = Number(item.availableLockers ?? 0);
  const total = Number(item.totalLockers ?? 0);
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs space-y-1.5">
      <div className="font-semibold text-gray-800 flex items-center gap-1">
        <span>🔒</span>
        <span>{String(item.lockerName ?? '물품보관함')}</span>
      </div>
      <div className="text-gray-600">
        사용 가능: <span className="font-medium text-green-700">{available}개</span> / 전체 {total}개
      </div>
      {total > 0 && <ProgressBar value={available} max={total} />}
    </div>
  );
}

function ToolResultCard({ result }: { result: ToolResult }) {
  const items = result.output?.items ?? [];

  const labelMap: Record<string, string> = {
    get_accessible_transport: '🚐 교통약자 이동지원 현황',
    get_traffic_light_status: '🚦 신호등 현황',
    get_bus_realtime_location: '🚌 버스 실시간 위치',
    get_library_seats: '📚 도서관 좌석 현황',
    get_civil_office_wait: '🏢 민원실 대기 현황',
    get_locker_availability: '🔒 물품보관함 현황',
  };

  const label = labelMap[result.toolName] ?? `📊 ${result.toolName}`;

  const renderItem = (item: Record<string, unknown>, idx: number) => {
    switch (result.toolName) {
      case 'get_accessible_transport': return <TransportCard key={idx} item={item} />;
      case 'get_traffic_light_status': return <TrafficLightCard key={idx} item={item} />;
      case 'get_library_seats': return <LibraryCard key={idx} item={item} />;
      case 'get_civil_office_wait': return <CivilOfficeCard key={idx} item={item} />;
      case 'get_bus_realtime_location': return <BusCard key={idx} item={item} />;
      case 'get_locker_availability': return <LockerCard key={idx} item={item} />;
      default:
        return (
          <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-700">
            <pre className="overflow-x-auto whitespace-pre-wrap break-all">
              {JSON.stringify(item, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="text-[11px] font-semibold text-gray-500 px-0.5">{label}</div>
      {items.length > 0 ? (
        items.map((item, idx) => renderItem(item, idx))
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-500">
          조회된 항목이 없습니다.
        </div>
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
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-white text-gray-900 rounded-bl-sm border border-gray-100 shadow-sm'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center gap-1.5 py-0.5">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
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
