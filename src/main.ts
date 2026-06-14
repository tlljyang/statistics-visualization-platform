import "./styles.css";
import {
  getDefaultVisualizer,
  getVisualizerById,
  resolveVisualizerPath,
  visualizers,
  type VisualizerLink
} from "./visualizers";
import { PLATFORM_LANGUAGE_KEY, platformCopy, type PlatformLanguage } from "./i18n/platform-copy";

const app = document.querySelector<HTMLMainElement>("#app");
const PLATFORM_SIDEBAR_WIDTH_KEY = "statistics-platform-sidebar-width";
const MODULE_TEACHING_WIDTH_KEY = "statistics-module-teaching-width";
let platformShell: HTMLElement | null = null;
let visualizerFrame: HTMLIFrameElement | null = null;
let activeTitleElement: HTMLElement | null = null;
let platformLanguage: PlatformLanguage = getInitialLanguage();

if (!app) {
  throw new Error("Missing #app mount point.");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getHashId(): string {
  return window.location.hash.replace(/^#\/?/, "");
}

function setHashId(id: string): void {
  const currentId = getHashId();

  if (currentId !== id) {
    window.location.hash = id;
  }
}

function getInitialLanguage(): PlatformLanguage {
  try {
    return window.localStorage.getItem(PLATFORM_LANGUAGE_KEY) === "en" ? "en" : "zh";
  } catch {
    return "zh";
  }
}

function getVisualizerCopy(visualizer: VisualizerLink): [string, string] {
  return platformCopy[platformLanguage].visualizers[visualizer.id] ?? [
    visualizer.label,
    visualizer.pageTitle
  ];
}

function getVisualizerPageTitle(visualizer: VisualizerLink): string {
  return getVisualizerCopy(visualizer)[1];
}

function setPlatformLanguage(language: PlatformLanguage): void {
  platformLanguage = language;

  try {
    window.localStorage.setItem(PLATFORM_LANGUAGE_KEY, language);
  } catch {
    // localStorage can be unavailable in embedded browser contexts.
  }

  syncActiveVisualizer(getVisualizerById(getHashId()));
}

function createLanguageTabs(): HTMLElement {
  const tabs = document.createElement("div");
  tabs.className = "platform-language-tabs";
  tabs.setAttribute("role", "tablist");
  tabs.setAttribute("aria-label", "Language");

  for (const [language, label] of [
    ["zh", "中文"],
    ["en", "English"]
  ] as const) {
    const button = document.createElement("button");
    button.className = "platform-language-tab";
    button.type = "button";
    button.dataset.language = language;
    button.dataset.active = String(platformLanguage === language);
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(platformLanguage === language));
    button.textContent = label;
    button.addEventListener("click", () => setPlatformLanguage(language));
    tabs.append(button);
  }

  return tabs;
}

function createNavButton(visualizer: VisualizerLink, isActive: boolean): HTMLButtonElement {
  const button = document.createElement("button");
  button.className = "visualizer-nav__button";
  button.type = "button";
  button.dataset.visualizerId = visualizer.id;
  button.dataset.active = String(isActive);
  button.setAttribute("aria-pressed", String(isActive));
  button.addEventListener("click", () => setHashId(visualizer.id));

  const label = document.createElement("span");
  label.className = "visualizer-nav__label";
  label.textContent = getVisualizerCopy(visualizer)[0];

  const detail = document.createElement("span");
  detail.className = "visualizer-nav__detail";
  detail.textContent = getVisualizerCopy(visualizer)[1];

  const icon = document.createElement("span");
  icon.className = "visualizer-nav__icon";
  icon.textContent = iconForVisualizer(visualizer.id);

  const copy = document.createElement("span");
  copy.className = "visualizer-nav__copy";
  copy.append(label, detail);

  const marker = document.createElement("span");
  marker.className = "visualizer-nav__marker";
  marker.textContent = isActive ? "✦" : "";

  button.append(icon, copy, marker);

  return button;
}

function iconForVisualizer(id: string): string {
  if (id.includes("confidence")) return "∫";
  if (id.includes("type-error")) return "α";
  if (id.includes("regression")) return "β";
  if (id.includes("random-variable")) return "ξ";
  if (id.includes("resampling")) return "⟳";
  if (id.includes("mcmc")) return "π";
  if (id.includes("anova")) return "F";
  if (id.includes("distribution")) return "φ";
  if (id.includes("variance")) return "σ²";
  return "μ";
}

function displayGroupName(groupName: VisualizerLink["group"]): string {
  return platformCopy[platformLanguage].groups[groupName];
}

function createNavGroup(
  groupName: VisualizerLink["group"],
  activeVisualizer: VisualizerLink
): HTMLElement {
  const group = document.createElement("section");
  group.className = "visualizer-nav__group";
  group.dataset.groupName = groupName;

  const heading = document.createElement("h2");
  heading.className = "visualizer-nav__group-title";
  heading.textContent = displayGroupName(groupName);

  const buttons = document.createElement("div");
  buttons.className = "visualizer-nav__button-row";

  for (const visualizer of visualizers.filter((item) => item.group === groupName)) {
    buttons.append(createNavButton(visualizer, visualizer.id === activeVisualizer.id));
  }

  group.append(heading, buttons);

  return group;
}

function syncActiveVisualizer(activeVisualizer: VisualizerLink): void {
  const copy = platformCopy[platformLanguage];
  const activePageTitle = getVisualizerPageTitle(activeVisualizer);

  document.documentElement.lang = platformLanguage === "zh" ? "zh-CN" : "en";
  document.title = `${activePageTitle} | ${copy.documentSuffix}`;

  document.querySelectorAll<HTMLButtonElement>(".platform-language-tab").forEach((button) => {
    const isActive = button.dataset.language === platformLanguage;

    button.dataset.active = String(isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  const brandTitle = document.querySelector<HTMLElement>(".platform-sidebar__title");
  const brandSubtitle = document.querySelector<HTMLElement>(".platform-sidebar__subtitle");
  const nav = document.querySelector<HTMLElement>(".visualizer-nav");
  const tipTitle = document.querySelector<HTMLElement>(".platform-sidebar__tip strong");
  const tipBody = document.querySelector<HTMLElement>(".platform-sidebar__tip span");

  if (brandTitle) brandTitle.textContent = copy.brandTitle;
  if (brandSubtitle) brandSubtitle.textContent = copy.brandSubtitle;
  if (nav) nav.setAttribute("aria-label", copy.navLabel);
  if (tipTitle) tipTitle.textContent = copy.tipTitle;
  if (tipBody) tipBody.textContent = copy.tipBody;

  document.querySelectorAll<HTMLElement>(".visualizer-nav__group").forEach((group) => {
    const groupName = group.dataset.groupName as VisualizerLink["group"] | undefined;
    const heading = group.querySelector<HTMLElement>(".visualizer-nav__group-title");

    if (groupName && heading) {
      heading.textContent = displayGroupName(groupName);
    }
  });

  if (activeTitleElement) {
    activeTitleElement.textContent = activePageTitle;
  }

  document.querySelectorAll<HTMLButtonElement>(".visualizer-nav__button").forEach((button) => {
    const isActive = button.dataset.visualizerId === activeVisualizer.id;
    const marker = button.querySelector<HTMLElement>(".visualizer-nav__marker");
    const label = button.querySelector<HTMLElement>(".visualizer-nav__label");
    const detail = button.querySelector<HTMLElement>(".visualizer-nav__detail");
    const visualizer = getVisualizerById(button.dataset.visualizerId ?? null);
    const [translatedLabel, translatedDetail] = getVisualizerCopy(visualizer);

    button.dataset.active = String(isActive);
    button.setAttribute("aria-pressed", String(isActive));
    if (label) label.textContent = translatedLabel;
    if (detail) detail.textContent = translatedDetail;

    if (marker) {
      marker.textContent = isActive ? "✦" : "";
    }
  });

  if (visualizerFrame) {
    const nextSrc = resolveVisualizerPath(import.meta.env.BASE_URL, activeVisualizer.path);

    visualizerFrame.title = activePageTitle;

    if (visualizerFrame.getAttribute("src") !== nextSrc) {
      visualizerFrame.dataset.loading = "true";
      visualizerFrame.src = nextSrc;
    } else {
      syncFrameLanguage(visualizerFrame);
    }
  }
}

function syncFrameLanguage(frame: HTMLIFrameElement): void {
  try {
    frame.contentWindow?.postMessage(
      { type: "statistics-platform-language", language: platformLanguage },
      window.location.origin
    );

    if (frame.contentDocument?.documentElement) {
      frame.contentDocument.documentElement.lang =
        platformLanguage === "zh" ? "zh-CN" : "en";
    }

  } catch {
    // The frame can be temporarily unavailable while loading.
  }
}

function enablePlatformResize(shell: HTMLElement, handle: HTMLElement): void {
  const savedWidth = window.localStorage.getItem(PLATFORM_SIDEBAR_WIDTH_KEY);

  if (savedWidth) {
    shell.style.setProperty("--platform-sidebar-width", savedWidth);
  }

  handle.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    handle.setPointerCapture(event.pointerId);
    document.body.classList.add("is-resizing-panels");

    const onPointerMove = (moveEvent: PointerEvent): void => {
      const rect = shell.getBoundingClientRect();
      const maxWidth = Math.min(380, rect.width * 0.38);
      const width = clamp(moveEvent.clientX - rect.left, 230, maxWidth);
      const cssWidth = `${Math.round(width)}px`;

      shell.style.setProperty("--platform-sidebar-width", cssWidth);
      window.localStorage.setItem(PLATFORM_SIDEBAR_WIDTH_KEY, cssWidth);
    };

    const onPointerUp = (): void => {
      document.body.classList.remove("is-resizing-panels");
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp, { once: true });
  });
}

function injectModuleResize(frame: HTMLIFrameElement): void {
  const frameDocument = frame.contentDocument;

  if (!frameDocument) return;

  const layout = frameDocument.querySelector<HTMLElement>(".module-layout");
  const teachingArea = frameDocument.querySelector<HTMLElement>(".teaching-area");

  if (!layout || !teachingArea) return;

  let style = frameDocument.querySelector<HTMLStyleElement>("#module-resize-style");

  if (!style) {
    style = frameDocument.createElement("style");
    style.id = "module-resize-style";
    frameDocument.head.append(style);
  }

  style.textContent = `
	    .module-layout {
	      grid-template-columns: minmax(0, 1fr) 12px var(--module-teaching-width, clamp(300px, 28vw, 420px)) !important;
	      gap: 0 !important;
	      column-gap: 0 !important;
    }

    .module-layout > .experiment-board {
      margin-right: 7px;
    }

    .module-layout > .teaching-area {
      margin-left: 7px;
    }

    .module-resize-handle {
      position: relative;
      z-index: 8;
      min-width: 12px;
      cursor: col-resize;
      touch-action: none;
    }

    .module-resize-handle::before {
      position: absolute;
      inset: 18px 4px;
      border-radius: 999px;
      background: rgba(111, 143, 122, 0.2);
      content: "";
      transition: background 160ms ease, box-shadow 160ms ease;
    }

	    .module-resize-handle:hover::before,
	    .module-resize-handle[data-active="true"]::before {
	      background: rgba(47, 111, 100, 0.42);
	      box-shadow: 0 0 0 5px rgba(111, 143, 122, 0.12);
	    }

	    @media (min-width: 760px) {
	      .experiment-board {
	        gap: 10px !important;
	      }

	      .experiment-header {
	        padding-bottom: 8px !important;
	      }

	      .experiment-header .eyebrow,
	      .output-heading .eyebrow {
	        margin: 0 !important;
	        font-size: 10px !important;
	        letter-spacing: 0.12em !important;
	      }

	      .experiment-header h1 {
	        margin: 0 !important;
	        font-size: clamp(30px, 3.2vw, 42px) !important;
	        line-height: 0.96 !important;
	      }

	      .experiment-header p:not(.eyebrow),
	      .module-kicker,
	      .module-description,
	      .output-heading p {
	        display: none !important;
	      }

	      .output-dock {
	        gap: 8px !important;
	      }

	      .output-heading {
	        display: flex !important;
	        align-items: baseline !important;
	        justify-content: space-between !important;
	        gap: 12px !important;
	        margin: 0 !important;
	      }

	      .output-heading h2 {
	        margin: 0 !important;
	        font-size: clamp(18px, 1.8vw, 24px) !important;
	        line-height: 1.05 !important;
	      }

	      .chart-frame {
	        min-height: 0 !important;
	      }
	    }
	
	    body.is-resizing-module {
	      cursor: col-resize;
	      user-select: none;
	    }

    @media (max-width: 980px) {
      .module-layout {
        grid-template-columns: 1fr !important;
        gap: 14px !important;
      }

      .module-layout > .experiment-board,
      .module-layout > .teaching-area {
        margin: 0;
      }

      .module-resize-handle {
        display: none;
	      }
	    }
	  `;

  const savedWidth = window.localStorage.getItem(MODULE_TEACHING_WIDTH_KEY);

  if (savedWidth) {
    layout.style.setProperty("--module-teaching-width", savedWidth);
  }

  if (layout.querySelector(".module-resize-handle")) return;

  const handle = frameDocument.createElement("div");
  handle.className = "module-resize-handle";
  handle.setAttribute("role", "separator");
  handle.setAttribute("aria-orientation", "vertical");
  handle.setAttribute("aria-label", "调整中间内容和右侧说明栏宽度");
  layout.insertBefore(handle, teachingArea);

  handle.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    handle.dataset.active = "true";
    handle.setPointerCapture(event.pointerId);
    frameDocument.body.classList.add("is-resizing-module");

    const onPointerMove = (moveEvent: PointerEvent): void => {
      const rect = layout.getBoundingClientRect();
      const maxWidth = Math.min(500, rect.width * 0.46);
      const width = clamp(rect.right - moveEvent.clientX, 260, maxWidth);
      const cssWidth = `${Math.round(width)}px`;

      layout.style.setProperty("--module-teaching-width", cssWidth);
      window.localStorage.setItem(MODULE_TEACHING_WIDTH_KEY, cssWidth);
    };

    const onPointerUp = (): void => {
      handle.dataset.active = "false";
      frameDocument.body.classList.remove("is-resizing-module");
      frameDocument.removeEventListener("pointermove", onPointerMove);
      frameDocument.removeEventListener("pointerup", onPointerUp);
    };

    frameDocument.addEventListener("pointermove", onPointerMove);
    frameDocument.addEventListener("pointerup", onPointerUp, { once: true });
  });

  const observer = new MutationObserver(() => {
    if (!layout.querySelector(".module-resize-handle")) {
      observer.disconnect();
      window.requestAnimationFrame(() => injectModuleResize(frame));
    }
  });

  observer.observe(layout, { childList: true });
}

function render(): void {
  const activeVisualizer = getVisualizerById(getHashId());

  if (platformShell) {
    syncActiveVisualizer(activeVisualizer);
    return;
  }

  const shell = document.createElement("section");
  shell.className = "platform-shell";
  shell.append(createLanguageTabs());

  const sidebar = document.createElement("aside");
  sidebar.className = "platform-sidebar";

  const titleGroup = document.createElement("div");
  titleGroup.className = "platform-sidebar__title-group";

  const brandMark = document.createElement("div");
  brandMark.className = "platform-sidebar__mark";
  brandMark.setAttribute("aria-hidden", "true");
  brandMark.innerHTML = `<svg viewBox="0 0 64 64" role="img">
    <path d="M8 44c7-1 9-26 24-26s17 25 24 26" />
    <path d="M10 46h44" />
    <circle cx="32" cy="18" r="4" />
  </svg>`;

  const title = document.createElement("h1");
  title.className = "platform-sidebar__title";
  title.textContent = "Statistics Learning Studio";

  const subtitle = document.createElement("p");
  subtitle.className = "platform-sidebar__subtitle";
  subtitle.textContent = "统计可视化学习";

  const activeTitle = document.createElement("p");
  activeTitle.className = "platform-sidebar__active-title";
  activeTitle.textContent = activeVisualizer.pageTitle;
  activeTitleElement = activeTitle;

  titleGroup.append(brandMark, title, subtitle, activeTitle);

  const nav = document.createElement("nav");
  nav.className = "visualizer-nav";
  nav.setAttribute("aria-label", "选择可视化模块");

  for (const group of ["Core Visualizers", "WALS Simulation", "WALS MES"] as const) {
    nav.append(createNavGroup(group, activeVisualizer));
  }

  const tipCard = document.createElement("aside");
  tipCard.className = "platform-sidebar__tip";
  tipCard.innerHTML = `
    <strong>Explore. Simulate. Understand.</strong>
    <span>Interactive visual tools to build statistical intuition and confidence.</span>
  `;

  sidebar.append(titleGroup, nav, tipCard);

  const frame = document.createElement("iframe");
  frame.className = "visualizer-frame";
  frame.addEventListener("load", () => {
    frame.dataset.loading = "false";
    syncFrameLanguage(frame);
    injectModuleResize(frame);
  });
  visualizerFrame = frame;

  const resizeHandle = document.createElement("div");
  resizeHandle.className = "platform-resize-handle";
  resizeHandle.setAttribute("role", "separator");
  resizeHandle.setAttribute("aria-orientation", "vertical");
  resizeHandle.setAttribute("aria-label", "调整左侧目录和模块内容宽度");
  enablePlatformResize(shell, resizeHandle);

  shell.append(sidebar, resizeHandle, frame);
  platformShell = shell;
  app.append(shell);
  syncActiveVisualizer(activeVisualizer);
}

if (!getHashId()) {
  setHashId(getDefaultVisualizer().id);
} else {
  render();
}

window.addEventListener("hashchange", render);
