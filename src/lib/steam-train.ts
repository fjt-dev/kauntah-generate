import { d51Frames } from "../data/sl-art.ts";

// Browser animation inspired by mtoyoda/sl's D51 and smoke progression.
const smokeShapes = [
  "(   )",
  "(    )",
  "(    )",
  "(   )",
  "(  )",
  "(  )",
  "( )",
  "( )",
  "()",
  "()",
  "O",
  "O",
  "O",
  "O",
  "O",
  " ",
];
export function steamTrainFrame(frame: number): string {
  const tick = Math.max(0, Math.floor(frame));
  const smoke = Array.from({ length: 6 }, () => Array<string>(83).fill(" "));
  for (let index = 0; index < 4; index++) {
    const age = (Math.floor(tick / 2) + index * 4) % smokeShapes.length;
    const row = 5 - Math.min(5, Math.floor(age / 2));
    const column = 7 + age * 2;
    [...smokeShapes[age]].forEach((character, offset) => {
      smoke[row][column + offset] = character;
    });
  }
  return [
    ...smoke.map((row) => row.join("")),
    ...d51Frames[tick % d51Frames.length],
  ].join("\n");
}

let stopActiveTrain: (() => void) | undefined;

/** One page-wide, non-interactive overlay; repeat invocation replaces the old train. */
export function runSteamTrain(): void {
  stopActiveTrain?.();
  const overlay = document.createElement("div");
  overlay.className = "sl-overlay";
  overlay.setAttribute("aria-hidden", "true");
  const train = document.createElement("pre");
  train.className = "sl-train";
  train.textContent = steamTrainFrame(0);
  overlay.append(train);
  document.body.append(overlay);

  let animation: Animation | undefined;
  let frameRequest = 0;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;
  function stop() {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(frameRequest);
    clearTimeout(timeout);
    animation?.cancel();
    overlay.remove();
    document.removeEventListener("keydown", dismiss, true);
    window.removeEventListener("pagehide", stop);
    if (stopActiveTrain === stop) stopActiveTrain = undefined;
  }
  function dismiss(event: KeyboardEvent) {
    if (event.key === "Escape") stop();
  }
  stopActiveTrain = stop;
  document.addEventListener("keydown", dismiss, true);
  window.addEventListener("pagehide", stop, { once: true });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    overlay.classList.add("sl-reduced");
    timeout = setTimeout(stop, 1500);
    return;
  }
  const width = train.getBoundingClientRect().width;
  const characterWidth = width / 83;
  const columns = Math.ceil((window.innerWidth + width) / characterWidth);
  // The original UNIX animation advances by one character every 40 ms.
  animation = train.animate(
    [
      { transform: "translate(0, -50%)" },
      { transform: `translate(calc(-100vw - 100%), -50%)` },
    ],
    {
      duration: columns * 40,
      easing: `steps(${columns}, end)`,
      fill: "forwards",
    },
  );
  const started = performance.now();
  let previousFrame = -1;
  function update(now: number) {
    if (stopped) return;
    const frame = Math.floor((now - started) / 40);
    if (frame !== previousFrame) {
      train.textContent = steamTrainFrame(frame);
      overlay.dataset.frame = String(frame);
      previousFrame = frame;
    }
    frameRequest = requestAnimationFrame(update);
  }
  frameRequest = requestAnimationFrame(update);
  void animation.finished.then(stop, stop);
}
