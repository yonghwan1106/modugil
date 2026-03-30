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
  '1': { label: '북', arrow: '↑' },
  '2': { label: '동', arrow: '→' },
  '3': { label: '남', arrow: '↓' },
  '4': { label: '서', arrow: '←' },
  '5': { label: '북동', arrow: '↗' },
  '6': { label: '남동', arrow: '↘' },
  '7': { label: '남서', arrow: '↙' },
  '8': { label: '북서', arrow: '↖' },
};

function SignalBulb({ signal, remainSeconds }: { signal: string; remainSeconds: number }) {
  const isWarning = remainSeconds <= 10;

  const colorClass =
    signal === 'G'
      ? 'bg-green-500'
      : signal === 'Y'
        ? 'bg-yellow-400'
        : 'bg-red-500';

  const textColorClass = isWarning ? 'text-red-600 font-bold' : 'text-gray-700';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-10 h-10 rounded-full ${colorClass} shadow-md`} />
      <span className={`text-sm ${textColorClass}`}>
        {remainSeconds}초
        {isWarning && <span className="ml-0.5">!</span>}
      </span>
    </div>
  );
}

function getSafetyMessage(directions: Direction[]): { text: string; colorClass: string } {
  // 녹색 신호가 있는 방향 중 최솟값을 기준으로 판단
  const greenDirs = directions.filter((d) => d.signal === 'G');
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

  // 십자형 레이아웃: 북(1), 동(2), 남(3), 서(4). 나머지 방향은 별도 행에 표시.
  const primaryDirs = ['1', '2', '3', '4'];
  const secondaryDirs = ['5', '6', '7', '8'].filter((d) => byDirection[d]);

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-72 text-sm">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="font-bold text-gray-900 text-base">{crossroadName}</span>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 rounded transition-colors"
          aria-label="닫기"
        >
          ✕
        </button>
      </div>

      {/* 십자형 신호등 레이아웃 */}
      <div className="px-4 py-4">
        {/* 북 */}
        <div className="flex justify-center mb-2">
          {byDirection['1'] ? (
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1">
                {DIRECTION_LABELS['1'].arrow} {DIRECTION_LABELS['1'].label}
              </span>
              <SignalBulb
                signal={byDirection['1'].signal}
                remainSeconds={byDirection['1'].remainSeconds}
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
            {byDirection['4'] ? (
              <>
                <span className="text-xs text-gray-500 mb-1">
                  {DIRECTION_LABELS['4'].arrow} {DIRECTION_LABELS['4'].label}
                </span>
                <SignalBulb
                  signal={byDirection['4'].signal}
                  remainSeconds={byDirection['4'].remainSeconds}
                />
              </>
            ) : (
              <div className="w-10" />
            )}
          </div>

          {/* 중앙 교차로 표시 */}
          <div className="w-10 h-10 rounded-full border-2 border-gray-300 bg-gray-50 flex items-center justify-center">
            <span className="text-gray-400 text-xs">교차</span>
          </div>

          {/* 동(2) */}
          <div className="flex flex-col items-center">
            {byDirection['2'] ? (
              <>
                <span className="text-xs text-gray-500 mb-1">
                  {DIRECTION_LABELS['2'].arrow} {DIRECTION_LABELS['2'].label}
                </span>
                <SignalBulb
                  signal={byDirection['2'].signal}
                  remainSeconds={byDirection['2'].remainSeconds}
                />
              </>
            ) : (
              <div className="w-10" />
            )}
          </div>
        </div>

        {/* 남(3) */}
        <div className="flex justify-center mt-2">
          {byDirection['3'] ? (
            <div className="flex flex-col items-center">
              <SignalBulb
                signal={byDirection['3'].signal}
                remainSeconds={byDirection['3'].remainSeconds}
              />
              <span className="text-xs text-gray-500 mt-1">
                {DIRECTION_LABELS['3'].arrow} {DIRECTION_LABELS['3'].label}
              </span>
            </div>
          ) : (
            <div className="w-10 h-14" />
          )}
        </div>

        {/* 대각선 방향 (있을 때만) */}
        {secondaryDirs.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-3 justify-center">
            {secondaryDirs.map((dir) => {
              const d = byDirection[dir];
              return (
                <div key={dir} className="flex flex-col items-center">
                  <span className="text-xs text-gray-500 mb-1">
                    {DIRECTION_LABELS[dir]?.arrow} {DIRECTION_LABELS[dir]?.label}
                  </span>
                  <SignalBulb signal={d.signal} remainSeconds={d.remainSeconds} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 교통약자 안전 메시지 */}
      <div className="px-4 py-3 bg-gray-50 rounded-b-xl border-t border-gray-100">
        <p className="text-xs text-gray-500 mb-0.5">⚠ 교통약자 안전 안내</p>
        <p className={`text-sm font-semibold ${safety.colorClass}`}>{safety.text}</p>
      </div>
    </div>
  );
}
