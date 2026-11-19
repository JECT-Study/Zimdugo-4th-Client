import { createServer } from "node:http";

/**
 * 프리뷰 서버(SSR)가 부르는 가짜 백엔드.
 *
 * 스펙의 `page.route` 는 브라우저에서 나가는 요청만 가로챈다. 보관함 상세 문서는
 * 서버 로더가 상세를 먼저 가져오는데(`loadLockerDetail`), 이 요청은 브라우저를
 * 거치지 않아 스텁에 닿지 않는다. 주소가 없으면 로더가 에러를 남기고 빈 상세로
 * 물러서서, e2e 는 늘 폴백 경로만 밟았다.
 *
 * 프리뷰 서버를 `API_BASE_URL` 로 이곳에 묶어 서버 요청도 답을 받게 한다.
 * `VITE_` 접두사를 쓰지 않는다. 그 값은 클라이언트 번들에도 박혀 브라우저 요청까지
 * 이리로 돌려 버린다.
 *
 * 노드가 타입을 걷어 내고 바로 실행한다. 타입 전용 문법 밖의 TS 기능은 쓰지 않는다.
 */

const PORT = Number(process.env.SSR_STUB_API_PORT ?? 4174);

/**
 * 서버가 그린 상세임을 화면에서 가를 수 있게 스펙들의 브라우저 스텁과 다른 이름을 둔다.
 * 같은 이름이면 서버 요약 카드가 떠도 "클라이언트 상세가 떴다" 는 단언이 통과한다.
 */
const SERVER_LOCKER_NAME = "서버 렌더링 보관함";

const createLockerDetailRaw = (lockerId: number) => ({
  lockerId,
  lockerName: SERVER_LOCKER_NAME,
  roadAddress: "서울 강남구 강남대로 지하 396",
  latitude: 37.4979,
  longitude: 127.0276,
  lockerType: "SUBWAY",
  updatedAt: "2026-08-01T00:00:00",
  distanceMeters: 120,
  minPrice: 2000,
  maxPrice: 4000,
  isFavorite: false,
  floor: 1,
  groundLevelType: "UNDERGROUND",
  lockerSizes: ["SMALL", "MEDIUM"],
  detailInfo: "개찰구를 지나 왼쪽",
  accurateVoteCount: 10,
  inaccurateVoteCount: 1,
});

const createEnvelope = (status: number, data: unknown) => ({
  code: status === 200 ? "SUCCESS" : "NOT_FOUND",
  message: status === 200 ? "ok" : "not found",
  status,
  timestamp: new Date().toISOString(),
  data,
});

const LOCKER_DETAIL_PATH = /^\/api\/v1\/lockers\/(\d+)$/;

const server = createServer((request, response) => {
  const { pathname } = new URL(request.url ?? "/", "http://localhost");
  const lockerIdMatch = pathname.match(LOCKER_DETAIL_PATH);

  // 모르는 경로는 404 로 답한다. 서버가 새 API 를 부르기 시작하면 여기 로그로 드러난다.
  const status = request.method === "GET" && lockerIdMatch ? 200 : 404;
  const data = lockerIdMatch
    ? createLockerDetailRaw(Number(lockerIdMatch[1]))
    : null;

  if (status === 404) {
    console.warn(`[ssr-stub-api] 스텁이 없는 요청: ${request.method} ${pathname}`);
  }

  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(createEnvelope(status, data)));
});

server.listen(PORT, () => {
  console.log(`[ssr-stub-api] http://localhost:${PORT}`);
});
