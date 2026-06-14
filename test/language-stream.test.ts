import { afterEach, describe, expect, it, vi } from "vitest";
import { languageStream } from "../apps/shared/language";

describe("languageStream", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("replays the current language to later subscribers", () => {
    const listeners: Record<string, Array<(event: any) => void>> = {};
    const storage = new Map<string, string>();

    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value)
      },
      addEventListener: (eventName: string, listener: (event: any) => void) => {
        listeners[eventName] = [...(listeners[eventName] ?? []), listener];
      },
      removeEventListener: (eventName: string, listener: (event: any) => void) => {
        listeners[eventName] = (listeners[eventName] ?? []).filter((item) => item !== listener);
      }
    });

    const stream = languageStream();
    const first: string[] = [];
    const second: string[] = [];

    const firstListener = {
      next: (language: string) => first.push(language),
      error: () => {},
      complete: () => {}
    };
    const secondListener = {
      next: (language: string) => second.push(language),
      error: () => {},
      complete: () => {}
    };

    stream.addListener(firstListener);
    stream.addListener(secondListener);

    expect(first).toEqual(["zh"]);
    expect(second).toEqual(["zh"]);

    stream.removeListener(firstListener);
    stream.removeListener(secondListener);
  });
});
