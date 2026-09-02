import { afterEach, describe, expect, it, vi } from "vitest";

// 판별 결과를 모듈에 캐시하므로 검증마다 모듈을 새로 불러온다.
const importWebglSupport = async () => {
  vi.resetModules();
  return await import("./webgl-support");
};

const importDetectWebglSupport = async () =>
  (await importWebglSupport()).detectWebglSupport;

const stubGetContext = (getContext: (contextId: string) => unknown) =>
  vi
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockImplementation(getContext as never);

const createContext = (loseContext = vi.fn()) => ({
  getExtension: vi.fn(() => ({ loseContext })),
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("detectWebglSupport", () => {
  it("컨텍스트를 얻으면 WebGL 을 쓸 수 있다고 본다", async () => {
    stubGetContext((contextId) =>
      contextId === "webgl2" ? createContext() : null,
    );

    expect(await (await importDetectWebglSupport())()).toBe(true);
  });

  it("webgl2 가 없으면 webgl 로 한 번 더 물어본다", async () => {
    const getContext = vi.fn((contextId: string) =>
      contextId === "webgl" ? createContext() : null,
    );
    stubGetContext(getContext);

    expect(await (await importDetectWebglSupport())()).toBe(true);
    expect(getContext.mock.calls.map(([contextId]) => contextId)).toEqual([
      "webgl2",
      "webgl",
    ]);
  });

  it("컨텍스트를 하나도 못 얻으면 미지원으로 본다", async () => {
    stubGetContext(() => null);

    expect(await (await importDetectWebglSupport())()).toBe(false);
  });

  it("컨텍스트를 얻다가 예외가 나도 미지원으로 흘린다", async () => {
    stubGetContext(() => {
      throw new Error("WebGL is disabled.");
    });

    expect(await (await importDetectWebglSupport())()).toBe(false);
  });

  it("판별하려고 만든 컨텍스트는 바로 반납한다", async () => {
    const loseContext = vi.fn();
    stubGetContext(() => createContext(loseContext));

    await (await importDetectWebglSupport())();

    expect(loseContext).toHaveBeenCalledOnce();
  });

  it("한 번 판별하면 다시 캔버스를 만들지 않는다", async () => {
    const getContext = vi.fn(() => createContext());
    stubGetContext(getContext);
    const detectWebglSupport = await importDetectWebglSupport();

    detectWebglSupport();
    detectWebglSupport();

    expect(getContext).toHaveBeenCalledOnce();
  });
});

describe("disableWebglSupport", () => {
  it("판별을 통과했더라도 못 쓴다고 뒤집는다", async () => {
    stubGetContext(() => createContext());
    const { detectWebglSupport, disableWebglSupport } =
      await importWebglSupport();
    expect(detectWebglSupport()).toBe(true);

    disableWebglSupport();

    expect(detectWebglSupport()).toBe(false);
  });

  it("뒤집힌 것을 구독자에게 알린다", async () => {
    stubGetContext(() => createContext());
    const { disableWebglSupport, subscribeWebglSupport } =
      await importWebglSupport();
    const listener = vi.fn();
    subscribeWebglSupport(listener);

    disableWebglSupport();

    expect(listener).toHaveBeenCalledOnce();
  });

  it("이미 못 쓰는 상태면 다시 알리지 않는다", async () => {
    stubGetContext(() => null);
    const { detectWebglSupport, disableWebglSupport, subscribeWebglSupport } =
      await importWebglSupport();
    expect(detectWebglSupport()).toBe(false);
    const listener = vi.fn();
    subscribeWebglSupport(listener);

    disableWebglSupport();

    expect(listener).not.toHaveBeenCalled();
  });

  it("한 번 알린 뒤로는 다시 알리지 않는다", async () => {
    stubGetContext(() => createContext());
    const { disableWebglSupport, subscribeWebglSupport } =
      await importWebglSupport();
    const listener = vi.fn();
    subscribeWebglSupport(listener);

    disableWebglSupport();
    disableWebglSupport();

    expect(listener).toHaveBeenCalledOnce();
  });

  it("구독을 끊으면 더 알리지 않는다", async () => {
    stubGetContext(() => createContext());
    const { disableWebglSupport, subscribeWebglSupport } =
      await importWebglSupport();
    const listener = vi.fn();
    subscribeWebglSupport(listener)();

    disableWebglSupport();

    expect(listener).not.toHaveBeenCalled();
  });
});
