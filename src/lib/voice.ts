/**
 * voice.ts — Web Speech API wrapper for STT (Speech-to-Text) and TTS (Text-to-Speech).
 *
 * 교통약자 접근성을 위한 음성 입출력 유틸리티. 시각장애 사용자의 실사용성을 위해 설계.
 * - STT: SpeechRecognition (Chrome/Edge 기반), 한국어(ko-KR) 기본
 * - TTS: SpeechSynthesis (모든 주요 브라우저), 한국어 우선 선택
 *
 * 브라우저 미지원 시 isSupported() === false. UI에서 우아하게 숨김 처리해야 함.
 */

// =============================================
// Type shims — Web Speech API가 lib.dom.d.ts에 없는 환경 대비
// =============================================

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): { transcript: string; confidence: number };
  [index: number]: { transcript: string; confidence: number };
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

interface WindowWithSpeech extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

// =============================================
// STT — Speech Recognition
// =============================================

function getRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const w = window as WindowWithSpeech;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSttSupported(): boolean {
  return getRecognitionCtor() !== null;
}

export interface SttHandlers {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
  lang?: string;
}

/**
 * 음성 인식 세션을 시작한다. 호출자는 반환된 controller로 중단 가능.
 * 한 번의 발화(final result) 후 자동 종료되도록 continuous=false로 설정.
 */
export function startStt(handlers: SttHandlers): { stop: () => void } | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) {
    handlers.onError?.('이 브라우저는 음성 인식을 지원하지 않습니다. (Chrome 또는 Edge 권장)');
    return null;
  }

  const recognition = new Ctor();
  recognition.lang = handlers.lang ?? 'ko-KR';
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const result = event.results[event.resultIndex];
    if (!result) return;
    const transcript = result[0]?.transcript ?? '';
    handlers.onResult(transcript, result.isFinal);
  };

  recognition.onerror = (event) => {
    const errorMap: Record<string, string> = {
      'no-speech': '음성이 감지되지 않았습니다. 다시 시도해 주세요.',
      'audio-capture': '마이크를 사용할 수 없습니다. 마이크 권한을 확인해 주세요.',
      'not-allowed': '마이크 권한이 거부되었습니다. 브라우저 설정에서 허용해 주세요.',
      'network': '네트워크 오류로 음성 인식을 수행할 수 없습니다.',
      'aborted': '',
    };
    const msg = errorMap[event.error] ?? `음성 인식 오류: ${event.error}`;
    if (msg) handlers.onError?.(msg);
  };

  recognition.onend = () => {
    handlers.onEnd?.();
  };

  try {
    recognition.start();
  } catch (err) {
    handlers.onError?.(err instanceof Error ? err.message : '음성 인식을 시작할 수 없습니다.');
    return null;
  }

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch {
        // ignore — already stopped
      }
    },
  };
}

// =============================================
// TTS — Speech Synthesis
// =============================================

export function isTtsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

let cachedKoreanVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;

function pickKoreanVoice(): SpeechSynthesisVoice | null {
  if (!isTtsSupported()) return null;
  if (cachedKoreanVoice) return cachedKoreanVoice;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  // 우선순위: ko-KR > ko > 아무거나
  const korean =
    voices.find((v) => v.lang === 'ko-KR') ??
    voices.find((v) => v.lang.startsWith('ko')) ??
    null;

  cachedKoreanVoice = korean;
  voicesLoaded = true;
  return korean;
}

// 브라우저마다 voices 로딩 타이밍이 다름 — voiceschanged 이벤트로 재시도
if (typeof window !== 'undefined' && isTtsSupported()) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedKoreanVoice = null;
    voicesLoaded = false;
    pickKoreanVoice();
  };
}

export interface TtsOptions {
  rate?: number; // 0.1 ~ 10, default 1
  pitch?: number; // 0 ~ 2, default 1
  volume?: number; // 0 ~ 1, default 1
  onEnd?: () => void;
  onError?: (error: string) => void;
}

/**
 * 텍스트를 한국어로 음성 합성해 재생한다. 이전 재생은 자동 중단.
 * 교통약자 안내 목적이므로 rate를 약간 느리게(0.95) 기본값 지정.
 */
export function speak(text: string, options: TtsOptions = {}): void {
  if (!isTtsSupported()) {
    options.onError?.('이 브라우저는 음성 합성을 지원하지 않습니다.');
    return;
  }
  if (!text.trim()) return;

  // 이전 발화 중단
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  utterance.rate = options.rate ?? 0.95;
  utterance.pitch = options.pitch ?? 1;
  utterance.volume = options.volume ?? 1;

  const voice = pickKoreanVoice();
  if (voice) utterance.voice = voice;

  utterance.onend = () => options.onEnd?.();
  utterance.onerror = (event) => {
    options.onError?.(`음성 합성 오류: ${event.error}`);
  };

  // 일부 브라우저에서 voices가 늦게 로드되는 경우 대기 후 재시도
  if (!voicesLoaded && window.speechSynthesis.getVoices().length === 0) {
    setTimeout(() => {
      pickKoreanVoice();
      const v = cachedKoreanVoice;
      if (v) utterance.voice = v;
      window.speechSynthesis.speak(utterance);
    }, 150);
  } else {
    window.speechSynthesis.speak(utterance);
  }
}

export function stopSpeaking(): void {
  if (!isTtsSupported()) return;
  window.speechSynthesis.cancel();
}

export function isSpeaking(): boolean {
  if (!isTtsSupported()) return false;
  return window.speechSynthesis.speaking;
}
