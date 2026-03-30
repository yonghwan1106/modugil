export default function Header() {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-lg">🚶</span>
        </div>
        <h1 className="text-lg font-bold text-gray-900">모두의 길</h1>
        <span className="text-xs text-gray-500">AI 교통약자 이동 어시스턴트</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
          전국 통합데이터 활용
        </span>
      </div>
    </header>
  );
}
