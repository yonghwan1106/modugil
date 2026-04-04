'use client';

interface Direction {
  direction: string;
  remainSeconds: number;
  signal: string;
}

interface TrafficLightDetailProps {
  crossroadName: string;
  directions: Direction[];
  onClose: () => void;
}

const DIRECTION_LABELS: Record<string, { label: string; arrow: string }> = {
  '북_보행자': { label: '북 보행', arrow: '↑' },
  '북_차량': { label: '북 차량', arrow: '↑' },
  '동_보행자': { label: '동 보행', arrow: '→' },
  '동_차량': { label: '동 차량', arrow: '→' },
  '남_보행자': { label: '남 보행', arrow: '↓' },
  '남_차량': { label: '남 차량', arrow: '↓' },
  '서_보행자': { label: '서 보행', arrow: '←' },
  '서_차량': { label: '서 차량', arrow: '←' },
  '북동_보행자': { label: '북동 보행', arrow: '↗' },
  '북동_차량': { label: '북동 차량', arrow: '↗' },
  '남동_보행자': { label: '남동 보행', arrow: '↘' },
  '남동_차량': { label: '남동 차량', arrow: '↘' },
  '남서_보행자': { label: '남서 보행', arrow: '↙' },
  '남서_차량': { label: '남서 차량', arrow: '↙' },
  '북서_보행자': { label: '북서 보행', arrow: '↖' },
  '북서_차량': { label: '북서 차량', arrow: '↖' },
};

function SignalBulb({ signal, remainSeconds, direction }: { signal: string; remainSeconds: number; direction?: string }) {
  const isWarning = remainSeconds <= 10;
  const sig = signal.toLowerCase();

  const bulbColor =
    sig.includes('녹') || sig === 'g' || sig.includes('green')
      ? '#22c55e'
      : sig.includes('황') || sig === 'y' || sig.includes('yellow')
        ? '#facc15'
        : '#ef4444';

  const textColorClass = isWarning ? 'font-bold' : '';
  const textColor = isWarning ? '#ef4444' : '#0f172a';

  const signalLabel = sig.includes('녹') || sig === 'g' || sig.includes('green')
    ? '녹색'
    : sig.includes('황') || sig === 'y' || sig.includes('yellow')
      ? '황색'
      : '적색';

  const ariaLabel = direction
    ? `${direction} ${signalLabel} 신호 ${remainSeconds}초 남음`
    : `${signalLabel} 신호 ${remainSeconds}초 남음`;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-10 h-10 rounded-full"
        aria-label={ariaLabel}
        style={{
          backgroundColor: bulbColor,
          boxShadow: `inset 0 2px 4px rgba(0,0,0,0.3), 0 0 8px ${bulbColor}80`,
        }}
      />
      <span className={`text-sm ${textColorClass}`} style={{ color: textColor }}>
        {remainSeconds}초
        {isWarning && <span className="ml-0.5">!</span>}
      </span>
    </div>
  );
}

function getSafetyMessage(directions: Direction[]): { text: string; colorClass: string } {
  // 녹색 신호가 있는 방향 중 최솟값을 기준으로 판단
  const greenDirs = directions.filter((d) => {
    const s = d.signal.toLowerCase();
    return s.includes('녹') || s === 'g' || s.includes('green');
  });
  if (greenDirs.length === 0) {
    return { text: '대기해 주세요', colorClass: 'text-red-600' };
  }
  const minGreenSecs = Math.min(...greenDirs.map((d) => d.remainSeconds));
  if (minGreenSecs >= 20) {
    return { text: '안전하게 횡단하세요', colorClass: 'text-green-600' };
  }
  if (minGreenSecs >= 10) {
    return { text: '서둘러 횡단하세요', colorClass: 'text-yellow-600' };
  }
  return { text: '횡단을 삼가세요', colorClass: 'text-red-600' };
}

export default function TrafficLightDetail({
  crossroadName,
  directions,
  onClose,
}: TrafficLightDetailProps) {
  const byDirection = Object.fromEntries(directions.map((d) => [d.direction, d]));

  const safety = getSafetyMessage(directions);

  // 십자형 레이아웃: 보행자 신호 우선 표시. 나머지는 별도 행.
  const primaryDirs = ['북_보행자', '동_보행자', '남_보행자', '서_보행자'];
  const secondaryDirs = Object.keys(byDirection).filter((d) => !primaryDirs.includes(d));

  return (
    <div className="rounded-xl shadow-2xl w-72 text-sm overflow-hidden" style={{ background: '#ffffff', borderTop: '3px solid #d4a853' }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3" style={{ background: '#0f172a' }}>
        <span className="font-bold text-base" style={{ color: '#d4a853' }}>{crossroadName}</span>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:opacity-80"
          style={{ color: '#d4a853' }}
          aria-label="닫기"
        >
          ✕
        </button>
      </div>

      {/* 십자형 신호등 레이아웃 */}
      <div className="px-4 py-4">
        {/* 북 */}
        <div className="flex justify-center mb-2">
          {byDirection['북_보행자'] ? (
            <div className="flex flex-col items-center">
              <span className="text-xs mb-1" style={{ color: '#0f172a' }}>
                {DIRECTION_LABELS['북_보행자'].arrow} {DIRECTION_LABELS['북_보행자'].label}
              </span>
              <SignalBulb
                signal={byDirection['북_보행자'].signal}
                remainSeconds={byDirection['북_보행자'].remainSeconds}
                direction="북 보행"
              />
            </div>
          ) : (
            <div className="w-10 h-14" />
          )}
        </div>

        {/* 서 / 중앙 / 동 */}
        <div className="flex items-center justify-between mb-2">
          {/* 서(4) */}
          <div className="flex flex-col items-center">
            {byDirection['서_보행자'] ? (
              <>
                <span className="text-xs mb-1" style={{ color: '#0f172a' }}>
                  {DIRECTION_LABELS['서_보행자'].arrow} {DIRECTION_LABELS['서_보행자'].label}
                </span>
                <SignalBulb
                  signal={byDirection['서_보행자'].signal}
                  remainSeconds={byDirection['서_보행자'].remainSeconds}
                  direction="서 보행"
                />
              </>
            ) : (
              <div className="w-10" />
            )}
          </div>

          {/* 중앙 교차로 표시 */}
          <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center" style={{ borderColor: '#d4a853', background: '#faf9f7' }}>
            <span className="text-xs" style={{ color: '#0f172a' }}>교차</span>
          </div>

          {/* 동(2) */}
          <div className="flex flex-col items-center">
            {byDirection['동_보행자'] ? (
              <>
                <span className="text-xs mb-1" style={{ color: '#0f172a' }}>
                  {DIRECTION_LABELS['동_보행자'].arrow} {DIRECTION_LABELS['동_보행자'].label}
                </span>
                <SignalBulb
                  signal={byDirection['동_보행자'].signal}
                  remainSeconds={byDirection['동_보행자'].remainSeconds}
                  direction="동 보행"
                />
              </>
            ) : (
              <div className="w-10" />
            )}
          </div>
        </div>

        {/* 남(3) */}
        <div className="flex justify-center mt-2">
          {byDirection['남_보행자'] ? (
            <div className="flex flex-col items-center">
              <SignalBulb
                signal={byDirection['남_보행자'].signal}
                remainSeconds={byDirection['남_보행자'].remainSeconds}
                direction="남 보행"
              />
              <span className="text-xs mt-1" style={{ color: '#0f172a' }}>
                {DIRECTION_LABELS['남_보행자'].arrow} {DIRECTION_LABELS['남_보행자'].label}
              </span>
            </div>
          ) : (
            <div className="w-10 h-14" />
          )}
        </div>

        {/* 대각선 방향 (있을 때만) */}
        {secondaryDirs.length > 0 && (
          <div className="mt-3 pt-3 flex flex-wrap gap-3 justify-center" style={{ borderTop: '1px solid rgba(212,168,83,0.3)' }}>
            {secondaryDirs.map((dir) => {
              const d = byDirection[dir];
              return (
                <div key={dir} className="flex flex-col items-center">
                  <span className="text-xs mb-1" style={{ color: '#0f172a' }}>
                    {DIRECTION_LABELS[dir]?.arrow} {DIRECTION_LABELS[dir]?.label}
                  </span>
                  <SignalBulb signal={d.signal} remainSeconds={d.remainSeconds} direction={DIRECTION_LABELS[dir]?.label} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 교통약자 안전 메시지 */}
      <div className="px-4 py-3 rounded-b-xl" style={{ background: '#f5e6c8', borderTop: '1px solid rgba(212,168,83,0.3)' }}>
        <p className="text-xs mb-0.5" style={{ color: '#0f172a' }}>⚠ 교통약자 안전 안내</p>
        <p className={`text-sm font-semibold ${safety.colorClass}`}>{safety.text}</p>
      </div>
    </div>
  );
}
