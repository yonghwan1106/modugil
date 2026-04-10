export default function Footer() {
  return (
    <footer
      role="contentinfo"
      aria-label="서비스 정보"
      style={{
        backgroundColor: '#0f172a',
        borderTop: '1px solid #1e293b',
        padding: '12px 24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
      }}
    >
      {/* Anthropic Claude 브랜딩 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Anthropic 로고 아이콘 (단순 SVG 다이아몬드) */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        >
          <path
            d="M12 2L22 12L12 22L2 12L12 2Z"
            fill="#d4a853"
            stroke="#d4a853"
            strokeWidth="1"
          />
          <path
            d="M12 6L18 12L12 18L6 12L12 6Z"
            fill="#0f172a"
          />
        </svg>
        <span style={{ fontSize: '12px', color: '#94a3b8', letterSpacing: '0.02em' }}>
          Powered by{' '}
          <strong style={{ color: '#d4a853', fontWeight: 600 }}>
            Anthropic Claude Sonnet 4.6
          </strong>
        </span>
      </div>

      {/* 데이터 출처 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#64748b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        >
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
        <span style={{ fontSize: '11px', color: '#64748b', letterSpacing: '0.01em' }}>
          공공데이터포털 (data.go.kr) · 한국지역정보개발원
        </span>
      </div>
    </footer>
  );
}
