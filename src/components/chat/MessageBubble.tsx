interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  toolResults?: unknown[];
  isLoading?: boolean;
}

export default function MessageBubble({ role, content, toolResults, isLoading }: MessageBubbleProps) {
  const isUser = role === 'user';

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

      {toolResults && toolResults.length > 0 && (
        <div className="max-w-[90%] bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs">
          <div className="flex items-center gap-1.5 mb-2 font-semibold text-blue-700">
            <span>📊</span>
            <span>데이터 조회 결과</span>
          </div>
          <div className="space-y-1.5">
            {toolResults.map((result, idx) => (
              <div key={idx} className="bg-white rounded-lg p-2 border border-blue-100 text-gray-700">
                <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-all">
                  {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
