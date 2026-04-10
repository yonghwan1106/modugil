'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  isSttSupported,
  isTtsSupported,
  startStt,
  speak,
  stopSpeaking,
} from '@/lib/voice';

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
  const [isListening, setIsListening] = useState(false);
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState({ stt: false, tts: false });
  const [autoSpeak, setAutoSpeak] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sttControllerRef = useRef<{ stop: () => void } | null>(null);

  // 음성 지원 여부는 클라이언트 마운트 이후에만 체크 (SSR 안전)
  useEffect(() => {
    setVoiceSupported({ stt: isSttSupported(), tts: isTtsSupported() });
    // 시각장애 페르소나는 기본적으로 TTS 자동 재생 켜기
    if (userType === '시각장애') setAutoSpeak(true);
  }, [userType]);

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

      if (!res.ok || !res.body) {
        const errContent = `서버 오류 (${res.status}). 다시 시도해 주세요.`;
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: errContent,
          isError: true,
        };
        setMessages((prev) => prev.filter((m) => !m.isLoading).concat(errorMessage));
        return;
      }

      // SSE 스트림 파싱
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedText = '';
      let toolResults: unknown[] = [];
      const assistantId = `assistant-${Date.now()}`;

      // loading 메시지를 빈 assistant 메시지로 교체 (점진적 업데이트를 위해)
      setMessages((prev) => prev.filter((m) => !m.isLoading).concat({
        id: assistantId,
        role: 'assistant',
        content: '',
      }));

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
        }

        // SSE 이벤트 파싱: "data: {...}\n\n" 단위로 처리
        const lines = buffer.split('\n\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine.startsWith('data: ')) continue;
          const jsonStr = trimmedLine.slice(6);
          try {
            const event = JSON.parse(jsonStr) as { type: string; data?: unknown };

            if (event.type === 'toolResults') {
              toolResults = (event.data as unknown[]) ?? [];
              if (toolResults.length > 0 && onToolResults) {
                onToolResults(toolResults);
              }
            } else if (event.type === 'text') {
              accumulatedText += (event.data as string) ?? '';
              const currentText = accumulatedText;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: currentText, toolResults: toolResults.length > 0 ? toolResults : undefined }
                    : m,
                ),
              );
            } else if (event.type === 'error') {
              const errMsg = (event.data as string) ?? '오류가 발생했습니다.';
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: errMsg, isError: true }
                    : m,
                ),
              );
              done = true;
            } else if (event.type === 'done') {
              done = true;
            }
          } catch {
            // JSON 파싱 실패는 무시
          }
        }
      }

      // TTS 자동 재생 — stream 완료 후 전체 텍스트로 1회 호출
      if (autoSpeak && voiceSupported.tts && accumulatedText) {
        setIsTtsPlaying(true);
        speak(accumulatedText, {
          onEnd: () => setIsTtsPlaying(false),
          onError: () => setIsTtsPlaying(false),
        });
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

  // 마이크 버튼: STT 시작/중단 토글
  const handleMicToggle = useCallback(() => {
    if (isListening) {
      sttControllerRef.current?.stop();
      sttControllerRef.current = null;
      setIsListening(false);
      return;
    }

    setIsListening(true);
    const controller = startStt({
      onResult: (transcript, isFinal) => {
        setInput(transcript);
        if (isFinal && transcript.trim()) {
          // 최종 결과가 나오면 자동 전송
          setIsListening(false);
          sttControllerRef.current = null;
          void sendMessage(transcript);
        }
      },
      onError: (errMsg) => {
        setIsListening(false);
        sttControllerRef.current = null;
        const errorMessage: Message = {
          id: `voice-error-${Date.now()}`,
          role: 'assistant',
          content: errMsg,
          isError: true,
        };
        setMessages((prev) => prev.concat(errorMessage));
      },
      onEnd: () => {
        setIsListening(false);
        sttControllerRef.current = null;
      },
    });
    if (controller) {
      sttControllerRef.current = controller;
    } else {
      setIsListening(false);
    }
  }, [isListening, sendMessage]);

  // 스피커 토글: TTS 자동 재생 on/off + 현재 재생 중단
  const handleTtsToggle = useCallback(() => {
    const next = !autoSpeak;
    setAutoSpeak(next);
    if (!next) {
      stopSpeaking();
      setIsTtsPlaying(false);
    }
  }, [autoSpeak]);

  // 언마운트 시 음성 세션 정리
  useEffect(() => {
    return () => {
      sttControllerRef.current?.stop();
      stopSpeaking();
    };
  }, []);

  const lastMessage = messages[messages.length - 1];
  const showRetry = lastMessage?.isError && !isLoading;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#ffffff', borderTop: '3px solid #f1efe9' }}>
      {/* 패널 헤더 */}
      <div className="px-4 py-3 shrink-0 flex items-center justify-between" style={{ backgroundColor: '#0f172a' }}>
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#d4a853' }} />
            <h2 className="text-sm font-semibold" style={{ color: '#d4a853' }}>AI 이동 어시스턴트</h2>
          </div>
          <p className="font-serif mt-0.5" style={{ color: '#faf9f7', fontSize: '11px', letterSpacing: '0.02em' }}>모두의 길 · Powered by Claude Sonnet 4.6</p>
        </div>
        {voiceSupported.tts && (
          <button
            type="button"
            onClick={handleTtsToggle}
            aria-label={autoSpeak ? '음성 안내 끄기' : '음성 안내 켜기'}
            aria-pressed={autoSpeak}
            title={autoSpeak ? '음성 안내 켜짐 — 클릭해 끄기' : '음성 안내 꺼짐 — 클릭해 켜기'}
            className="shrink-0 rounded-full p-1.5 transition-all duration-200"
            style={{
              backgroundColor: autoSpeak ? '#d4a853' : 'transparent',
              border: `1px solid ${autoSpeak ? '#d4a853' : '#d4a853'}`,
              color: autoSpeak ? '#0f172a' : '#d4a853',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              {autoSpeak ? (
                <>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                </>
              ) : (
                <line x1="23" y1="9" x2="17" y2="15"/>
              )}
              {!autoSpeak && <line x1="17" y1="9" x2="23" y2="15"/>}
            </svg>
          </button>
        )}
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
        {(isListening || isTtsPlaying) && (
          <div
            className="mb-2 text-xs flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
            aria-live="polite"
          >
            <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#d97706' }} />
            {isListening ? '음성을 듣고 있습니다... 말씀해 주세요.' : '음성으로 안내 중...'}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
          {voiceSupported.stt && (
            <button
              type="button"
              onClick={handleMicToggle}
              aria-label={isListening ? '음성 입력 중단' : '음성으로 질문하기'}
              aria-pressed={isListening}
              disabled={isLoading}
              className="shrink-0 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: isListening ? '#dc2626' : '#ffffff',
                border: `1px solid ${isListening ? '#dc2626' : '#1e293b'}`,
                color: isListening ? '#ffffff' : '#0f172a',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>
          )}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="이동 관련 질문 입력"
            placeholder={isListening ? '듣고 있습니다...' : '이동 관련 질문을 입력하세요...'}
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
