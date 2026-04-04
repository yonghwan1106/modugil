'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolResults?: unknown[];
  isLoading?: boolean;
  isError?: boolean;
}

interface ChatPanelProps {
  onToolResults?: (results: unknown[]) => void;
  userType?: string;
}

const SUGGESTED_QUESTIONS_BY_TYPE: Record<string, string[]> = {
  '휠체어': [
    '강남역 근처 저상버스와 교통약자 차량 현황',
    '종로구 도서관 중 엘리베이터가 있는 곳은?',
    '서울역 민원실 대기시간',
  ],
  '시각장애': [
    '강남역 횡단보도 신호등 잔여시간',
    '종로구 음향신호기 있는 교차로',
    '서울역 근처 민원실 안내',
  ],
  '고령자': [
    '종로구 도서관 빈자리',
    '서울역 민원실 대기시간이 짧은 곳',
    '강남역 신호등 잔여시간',
  ],
  '임산부': [
    '종로구 교통약자 이동지원 차량',
    '서울역 민원실 대기시간',
    '마포구 도서관 좌석 현황',
  ],
};

const DEFAULT_SUGGESTED_QUESTIONS = [
  '강남역 근처 신호등 잔여시간과 교통약자 차량 현황을 알려줘',
  '종로구 교통약자 이동지원 차량 현황 알려줘',
  '종로구 도서관 중 빈자리가 있는 곳은?',
  '서울역 근처 민원실 대기시간이 짧은 곳은?',
  '강남역 근처 저상버스 노선 알려줘',
];

export default function ChatPanel({ onToolResults, userType }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUserText, setLastUserText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const trimmed = text.trim();
    setLastUserText(trimmed);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
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
      const allHistory = messages.map((m) => ({ role: m.role, content: m.content }));
      allHistory.push({ role: 'user', content: trimmed });
      const history = allHistory.slice(-10);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, userType }),
      });

      const data = await res.json() as { message?: string; content?: string; toolResults?: unknown[]; error?: boolean };

      if (!res.ok || data.error) {
        const errContent = data.message ?? `서버 오류 (${res.status}). 다시 시도해 주세요.`;
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: errContent,
          isError: true,
        };
        setMessages((prev) => prev.filter((m) => !m.isLoading).concat(errorMessage));
        return;
      }

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
        isError: true,
      };
      setMessages((prev) => prev.filter((m) => !m.isLoading).concat(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, onToolResults, userType]);

  const handleRetry = useCallback(() => {
    if (lastUserText) {
      // Remove last error message then resend
      setMessages((prev) => {
        const withoutLastError = [...prev];
        for (let i = withoutLastError.length - 1; i >= 0; i--) {
          if (withoutLastError[i].isError) {
            withoutLastError.splice(i, 1);
            break;
          }
        }
        return withoutLastError;
      });
      void sendMessage(lastUserText);
    }
  }, [lastUserText, sendMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && input.trim()) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  const lastMessage = messages[messages.length - 1];
  const showRetry = lastMessage?.isError && !isLoading;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#ffffff', borderTop: '3px solid #f1efe9' }}>
      {/* 패널 헤더 */}
      <div className="px-4 py-3 shrink-0" style={{ backgroundColor: '#0f172a' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#d4a853' }} />
          <h2 className="text-sm font-semibold" style={{ color: '#d4a853' }}>AI 이동 어시스턴트</h2>
        </div>
        <p className="font-serif mt-0.5" style={{ color: '#faf9f7', fontSize: '11px', letterSpacing: '0.02em' }}>모두의 길</p>
      </div>

      {/* 메시지 목록 */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        style={{ backgroundColor: '#faf9f7' }}
        role="log"
        aria-label="대화 내역"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col gap-3">
            <div className="text-center py-6">
              {/* CSS-styled compass icon instead of emoji */}
              <div
                className="mx-auto mb-3 flex items-center justify-center"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  boxShadow: '0 2px 8px rgba(15,23,42,0.18)',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: '2px solid #d4a853',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '2px',
                      height: '10px',
                      backgroundColor: '#d4a853',
                      transform: 'translate(-50%, -70%) rotate(25deg)',
                      borderRadius: '1px',
                    }}
                  />
                </div>
              </div>
              <p className="font-serif font-medium" style={{ color: '#0f172a', fontSize: '15px' }}>무엇을 도와드릴까요?</p>
              <p className="mt-1" style={{ color: '#6b7280', fontSize: '12px' }}>아래 질문을 눌러 시작하세요</p>
            </div>
            <div className="space-y-2">
              {(userType ? (SUGGESTED_QUESTIONS_BY_TYPE[userType] ?? DEFAULT_SUGGESTED_QUESTIONS) : DEFAULT_SUGGESTED_QUESTIONS).map((q) => (
                <button
                  key={q}
                  onClick={() => void sendMessage(q)}
                  aria-label={`추천 질문: ${q}`}
                  className="w-full text-left text-sm rounded-xl px-4 py-3 font-medium transition-all duration-200"
                  style={{
                    backgroundColor: '#faf9f7',
                    border: '1px solid #1e293b',
                    color: '#0f172a',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#d4a853';
                    e.currentTarget.style.color = '#d4a853';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#1e293b';
                    e.currentTarget.style.color = '#0f172a';
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#d4a853';
                    e.currentTarget.style.color = '#d4a853';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#1e293b';
                    e.currentTarget.style.color = '#0f172a';
                  }}
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
        {showRetry && (
          <div className="flex justify-center">
            <button
              onClick={handleRetry}
              aria-label="마지막 질문 다시 시도"
              className="text-sm rounded-xl px-4 py-2 transition-all duration-200"
              style={{
                color: '#0f172a',
                border: '1px solid #0f172a',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#d4a853';
                e.currentTarget.style.color = '#d4a853';
                e.currentTarget.style.backgroundColor = 'rgba(212,168,83,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#0f172a';
                e.currentTarget.style.color = '#0f172a';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#d4a853';
                e.currentTarget.style.color = '#d4a853';
                e.currentTarget.style.backgroundColor = 'rgba(212,168,83,0.06)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#0f172a';
                e.currentTarget.style.color = '#0f172a';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              다시 시도
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <div className="shrink-0 p-3" style={{ backgroundColor: '#faf9f7', borderTop: '1px solid #f1efe9' }}>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="이동 관련 질문 입력"
            placeholder="이동 관련 질문을 입력하세요..."
            disabled={isLoading}
            className="flex-1 text-sm rounded-xl px-4 py-2.5 outline-none transition-all duration-200 disabled:opacity-50"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e4e0',
              color: '#0f172a',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#0f172a';
              e.currentTarget.style.boxShadow = '0 0 0 2px rgba(15,23,42,0.12)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e5e4e0';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <button
            type="submit"
            aria-label="메시지 전송"
            disabled={!input.trim() || isLoading}
            className="shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            style={{
              backgroundColor: '#d4a853',
              color: '#0f172a',
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = '#b8922f';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#d4a853';
            }}
          >
            {isLoading ? (
              <LoadingSpinner size="sm" className="border-[#0f172a] border-t-[#d4a853]" />
            ) : (
              <>
                {/* CSS arrow icon instead of text */}
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ display: 'block' }}>
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                전송
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
