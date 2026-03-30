'use client';

import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolResults?: unknown[];
  isLoading?: boolean;
}

interface ChatPanelProps {
  onToolResults?: (results: unknown[]) => void;
}

const SUGGESTED_QUESTIONS = [
  '종로구 교통약자 이동지원 차량 현황 알려줘',
  '강남역 근처 신호등 잔여시간 보여줘',
  '주변 도서관 빈자리 확인해줘',
];

export default function ChatPanel({ onToolResults }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
    };

    const loadingMessage: Message = {
      id: `loading-${Date.now()}`,
      role: 'assistant',
      content: '',
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      history.push({ role: 'user', content: text.trim() });

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok) throw new Error(`서버 오류: ${res.status}`);

      const data = await res.json();
      const assistantContent: string = data.content ?? data.message ?? '응답을 받지 못했습니다.';
      const toolResults: unknown[] = data.toolResults ?? [];

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: assistantContent,
        toolResults: toolResults.length > 0 ? toolResults : undefined,
      };

      setMessages((prev) => prev.filter((m) => !m.isLoading).concat(assistantMessage));

      if (toolResults.length > 0 && onToolResults) {
        onToolResults(toolResults);
      }
    } catch (err) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: err instanceof Error ? err.message : '오류가 발생했습니다. 다시 시도해주세요.',
      };
      setMessages((prev) => prev.filter((m) => !m.isLoading).concat(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* 패널 헤더 */}
      <div className="px-4 py-3 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <h2 className="text-sm font-semibold text-gray-800">AI 이동 상담</h2>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">교통약자 맞춤 이동 정보를 알려드립니다</p>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col gap-3">
            <div className="text-center py-6">
              <div className="text-4xl mb-2">🗺️</div>
              <p className="text-sm font-medium text-gray-700">무엇을 도와드릴까요?</p>
              <p className="text-xs text-gray-500 mt-1">아래 질문을 눌러 시작하세요</p>
            </div>
            <div className="space-y-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="w-full text-left text-sm bg-white border border-blue-100 text-blue-700 rounded-xl px-4 py-3 hover:bg-blue-50 hover:border-blue-300 transition-colors font-medium shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              toolResults={msg.toolResults}
              isLoading={msg.isLoading}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <div className="shrink-0 bg-white border-t border-gray-200 p-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="이동 관련 질문을 입력하세요..."
            disabled={isLoading}
            className="flex-1 text-sm rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-50 disabled:bg-gray-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {isLoading ? <LoadingSpinner size="sm" className="border-white border-t-blue-200" /> : '전송'}
          </button>
        </form>
      </div>
    </div>
  );
}
