# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"모두의 길" — AI 교통약자 이동 어시스턴트. 행정안전부 전국 통합개방 데이터(7종)와 Claude AI를 결합하여 교통약자(장애인, 고령자, 임산부)에게 실시간 이동 정보를 제공하는 Next.js 웹 서비스.

## Commands

```bash
npm run dev      # 개발 서버 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint (eslint-config-next core-web-vitals + typescript)
```

테스트 프레임워크는 아직 설정되어 있지 않음.

## Environment Variables

`.env.example` 참조. 필수 키 3개:
- `ANTHROPIC_API_KEY` — Claude API (서버 사이드)
- `DATA_API_KEY` — 공공데이터포털 서비스키 (apis.data.go.kr/B551982)
- `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` — 네이버 지도 클라이언트 ID

## Architecture

### Tech Stack
- Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4, Recharts 3
- AI: `@anthropic-ai/sdk` → Claude Haiku 4.5 (`claude-haiku-4-5-20251001`)
- 지도: Naver Maps API v3 (Script in layout.tsx, `beforeInteractive`)
- Path alias: `@/*` → `./src/*`

### Data Flow (핵심 패턴)

채팅 API는 **서버 사이드 도구 선실행(pre-execution)** 패턴을 사용함:

1. 프론트(`ChatPanel`) → `POST /api/chat` (메시지 배열 전송)
2. `route.ts`가 사용자 메시지에서 **키워드 기반으로 필요한 도구를 결정** (`TOOL_ROUTING` 정규식)하고 **지역명을 추출** (`extractRegion`)
3. `tool-executor.ts`가 해당 도구들을 **공공데이터 API에 병렬 호출** (실패 시 mock 데이터 폴백)
4. 조회된 데이터를 사용자 메시지에 텍스트로 첨부하여 Claude에게 전달 (tool_use 미사용, 텍스트 컨텍스트 방식)
5. 응답: `{ message: string, toolResults: ToolResult[] }` — toolResults는 프론트에서 지도 마커 생성에 사용

즉, Claude는 도구를 직접 호출하지 않고, 서버가 미리 실행한 데이터를 받아 자연어 응답만 생성함.

### 공공데이터 API 구조 (`src/lib/api/`)

- `endpoints.ts` — 7종 API 엔드포인트 상수 (B551982 기반)
- `client.ts` — `fetchPublicData<T>()` 공통 호출기 (응답 포맷 3가지 자동 감지, 5분 메모리 캐시)
- `types.ts` — 7종 API 응답 타입 정의 (한국어 필드명 약어 주의: `lot`=경도, `lat`=위도)
- `mock-data.ts` — API 실패 시 폴백용 하드코딩 데이터

7종 데이터: 공영자전거(pbdo), 교통약자이동지원(tsdo), 공공도서관열람실(plr), 물품보관함(psl), 신호등(rti), 민원실(cso), 버스(rte)

### Tool Executor (`src/app/api/chat/tool-executor.ts`)

- 지역명 → 지자체코드 매핑 (`REGION_CODES`, `BIKE_REGION_CODES`)
- `fetchWithFallback<T>()` — 실제 API 호출 실패 시 mock 폴백
- 각 도구는 정보 API + 실시간 API를 병렬 호출하여 조인 (예: 도서관 정보 + 좌석 현황)
- 자전거 API는 응답 구조가 다른 API와 달라 전용 `fetchBikeApi()` 사용

### 프론트엔드 (`src/app/`, `src/components/`)

- 메인 페이지(`page.tsx`): 지도(70%) + 채팅패널(30%) split layout, 모바일은 50vh/50vh
- `/dashboard`: Recharts 기반 통계 대시보드 (mock 데이터 직접 사용)
- `NaverMap`: window.naver.maps 직접 사용, `useEffect`로 마커/인포윈도우 관리
- `ChatPanel`/`MessageBubble`: AI 채팅 UI, 도구 결과 카드 렌더링
- `TrafficLightDetail`: 신호등 마커 클릭 시 방향별 상세 오버레이

### 좌표 필드 주의사항

공공데이터 API는 경도를 `lot` (longitude의 오타 관행)으로 반환함. tool-executor에서 `lng` 필드를 추가로 계산하여 프론트에 전달. 프론트의 `MapMarker` 타입은 `lat`/`lng` 사용.

## Conventions

- 한국어 UI, 한국어 주석
- AI 응답은 마크다운 미사용 (시스템 프롬프트에서 명시적 금지)
- 디자인 컬러: 다크 네이비(#0f172a) + 골드(#d4a853), Noto Sans KR 폰트
- `docs/공모전제출/` — 공모전 제출용 문서 (HTML→PDF), 코드와 무관
