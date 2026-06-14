import xs, { type Stream } from "xstream";
import dropRepeats from "xstream/extra/dropRepeats";

export type Language = "zh" | "en";

export const LANGUAGE_STORAGE_KEY = "statistics-platform-language";
const LANGUAGE_MESSAGE_TYPE = "statistics-platform-language";

export function normalizeLanguage(value: unknown): Language {
  return value === "en" ? "en" : "zh";
}

export function getInitialLanguage(): Language {
  try {
    return normalizeLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
  } catch {
    return "zh";
  }
}

export function languageStream(): Stream<Language> {
  return xs
    .create<Language>({
      start(listener) {
        listener.next(getInitialLanguage());

        const onMessage = (event: MessageEvent): void => {
          if (event.data?.type !== LANGUAGE_MESSAGE_TYPE) return;

          const nextLanguage = normalizeLanguage(event.data.language);

          try {
            window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
          } catch {
            // Embedded contexts can block localStorage.
          }

          listener.next(nextLanguage);
        };

        const onStorage = (event: StorageEvent): void => {
          if (event.key === LANGUAGE_STORAGE_KEY) {
            listener.next(normalizeLanguage(event.newValue));
          }
        };

        window.addEventListener("message", onMessage);
        window.addEventListener("storage", onStorage);

        this.stop = () => {
          window.removeEventListener("message", onMessage);
          window.removeEventListener("storage", onStorage);
        };
      },
      stop() {}
    })
    .compose(dropRepeats())
    .remember();
}
