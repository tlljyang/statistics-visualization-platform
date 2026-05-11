import "./styles.css";
import {
  getDefaultVisualizer,
  getVisualizerById,
  resolveVisualizerPath,
  visualizers,
  type VisualizerLink
} from "./visualizers";

const app = document.querySelector<HTMLMainElement>("#app");

if (!app) {
  throw new Error("Missing #app mount point.");
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

function createNavButton(visualizer: VisualizerLink, isActive: boolean): HTMLButtonElement {
  const button = document.createElement("button");
  button.className = "visualizer-nav__button";
  button.type = "button";
  button.textContent = visualizer.label;
  button.dataset.active = String(isActive);
  button.setAttribute("aria-pressed", String(isActive));
  button.addEventListener("click", () => setHashId(visualizer.id));

  return button;
}

function createNavGroup(
  groupName: VisualizerLink["group"],
  activeVisualizer: VisualizerLink
): HTMLElement {
  const group = document.createElement("section");
  group.className = "visualizer-nav__group";

  const heading = document.createElement("h2");
  heading.className = "visualizer-nav__group-title";
  heading.textContent = groupName;

  const buttons = document.createElement("div");
  buttons.className = "visualizer-nav__button-row";

  for (const visualizer of visualizers.filter((item) => item.group === groupName)) {
    buttons.append(createNavButton(visualizer, visualizer.id === activeVisualizer.id));
  }

  group.append(heading, buttons);

  return group;
}

function render(): void {
  const activeVisualizer = getVisualizerById(getHashId());
  document.title = `${activeVisualizer.pageTitle} | 统计学习可视化平台`;

  app.replaceChildren();

  const shell = document.createElement("section");
  shell.className = "platform-shell";

  const header = document.createElement("header");
  header.className = "platform-header";

  const titleGroup = document.createElement("div");
  titleGroup.className = "platform-header__title-group";

  const title = document.createElement("h1");
  title.className = "platform-header__title";
  title.textContent = "统计学习可视化平台";

  const activeTitle = document.createElement("p");
  activeTitle.className = "platform-header__active-title";
  activeTitle.textContent = activeVisualizer.pageTitle;

  titleGroup.append(title, activeTitle);

  const nav = document.createElement("nav");
  nav.className = "visualizer-nav";
  nav.setAttribute("aria-label", "选择可视化模块");

  for (const group of ["Core Visualizers", "WALS Simulation", "WALS MES"] as const) {
    nav.append(createNavGroup(group, activeVisualizer));
  }

  header.append(titleGroup, nav);

  const frame = document.createElement("iframe");
  frame.className = "visualizer-frame";
  frame.title = activeVisualizer.pageTitle;
  frame.src = resolveVisualizerPath(import.meta.env.BASE_URL, activeVisualizer.path);

  shell.append(header, frame);
  app.append(shell);
}

if (!getHashId()) {
  setHashId(getDefaultVisualizer().id);
} else {
  render();
}

window.addEventListener("hashchange", render);
