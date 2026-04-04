'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8" style={{ background: '#0f172a' }}>
      <div className="text-5xl mb-4" style={{ color: '#d4a853' }}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9v4m0 4h.01M12 2L2 20h20L12 2z" stroke="#d4a853" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 className="text-xl font-bold mb-2" style={{ color: '#ffffff', fontFamily: 'Georgia, "Times New Roman", serif' }}>
        오류가 발생했습니다
      </h2>
      <p className="text-sm mb-6 text-center max-w-md" style={{ color: 'rgba(250,249,247,0.7)' }}>
        {error.message || '일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.'}
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 rounded-xl font-semibold transition-all hover:opacity-90"
        style={{ background: '#d4a853', color: '#0f172a' }}
      >
        다시 시도
      </button>
    </div>
  );
}
