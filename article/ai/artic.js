"use strict";

// Reading progress: one animation frame per scroll burst; original ID retained.
const progress = document.getElementById("progress");
const readingPercent = document.getElementById("reading-percent");
const tocLinks = [...document.querySelectorAll('.toc a[href^="#"]')];
const articleSections = tocLinks.map(link => document.getElementById(link.hash.slice(1)));
let ticking = false;

function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
  if (progress) progress.style.width = `${pct}%`;
  if (readingPercent) readingPercent.textContent = `${Math.round(pct)}%`;
  let active = 0;
  articleSections.forEach((section, index) => {
    if (section && section.getBoundingClientRect().top <= 165) active = index;
  });
  if (max > 0 && window.scrollY >= max - 3) active = tocLinks.length - 1;
  tocLinks.forEach((link, index) => {
    if (index === active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  ticking = false;
}
function scheduleProgress() {
  if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
}
window.addEventListener("scroll", scheduleProgress, { passive: true });
window.addEventListener("resize", scheduleProgress);
window.addEventListener("load", scheduleProgress);
document.fonts?.ready.then(scheduleProgress);
updateProgress();

// Intersection over Union: the original formula, shared by the result and SVG.
function boxMetrics(a, b) {
  const ix1 = Math.max(a[0], b[0]);
  const iy1 = Math.max(a[1], b[1]);
  const ix2 = Math.min(a[2], b[2]);
  const iy2 = Math.min(a[3], b[3]);
  const intersection = Math.max(0, ix2 - ix1) * Math.max(0, iy2 - iy1);
  const areaA = Math.max(0, a[2] - a[0]) * Math.max(0, a[3] - a[1]);
  const areaB = Math.max(0, b[2] - b[0]) * Math.max(0, b[3] - b[1]);
  const union = areaA + areaB - intersection;
  return { intersection, union, ix1, iy1, ix2, iy2, areaA, areaB };
}
function iou(a, b) {
  const { intersection, union } = boxMetrics(a, b);
  return union > 0 ? intersection / union : 0;
}
const ids = ["a1", "a2", "a3", "a4", "b1", "b2", "b3", "b4"];
const inputs = ids.map(id => document.getElementById(id));
const iouOutput = document.getElementById("iou-result");
const iouError = document.getElementById("iou-error");
const svgShapes = document.getElementById("iou-shapes");
const invalidVisual = document.getElementById("iou-invalid-visual");
const areaFormatter = new Intl.NumberFormat("en", { maximumFractionDigits: 6 });
function showArea(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value === null ? "—" : (value !== 0 && (value < .000001 || value >= 1e9) ? value.toExponential(3) : areaFormatter.format(value)) + " u²";
}
function setRect(id, x, y, width, height) {
  const rect = document.getElementById(id);
  if (!rect) return;
  for (const [name, value] of Object.entries({ x, y, width, height })) rect.setAttribute(name, String(value));
}
function renderBoxes(a, b, metrics) {
  if (!svgShapes) return;
  const minX = Math.min(a[0], b[0]), minY = Math.min(a[1], b[1]);
  const width = Math.max(a[2], b[2]) - minX, height = Math.max(a[3], b[3]) - minY;
  const scale = Math.min(280 / width, 210 / height);
  const offsetX = (360 - width * scale) / 2, offsetY = (280 - height * scale) / 2;
  const x = value => offsetX + (value - minX) * scale;
  const y = value => offsetY + (value - minY) * scale;
  setRect("iou-box-a", x(a[0]), y(a[1]), (a[2] - a[0]) * scale, (a[3] - a[1]) * scale);
  setRect("iou-box-b", x(b[0]), y(b[1]), (b[2] - b[0]) * scale, (b[3] - b[1]) * scale);
  setRect("iou-intersection", x(metrics.ix1), y(metrics.iy1), Math.max(0, metrics.ix2 - metrics.ix1) * scale, Math.max(0, metrics.iy2 - metrics.iy1) * scale);
  svgShapes.setAttribute("visibility", "visible");
  if (invalidVisual) invalidVisual.setAttribute("visibility", "hidden");
  const description = document.getElementById("iou-diagram-desc");
  if (description) description.textContent = `Box A: (${a.join(", ")}). Box B: (${b.join(", ")}). Intersection area ${metrics.intersection}; union area ${metrics.union}. Both boxes use the same scale.`;
}
function invalidIoU(message, badIndices) {
  if (iouOutput) iouOutput.textContent = "IoU = —";
  if (iouError) iouError.textContent = message;
  inputs.forEach((input, index) => { if (input) input.setAttribute("aria-invalid", String(badIndices.includes(index))); });
  if (svgShapes) svgShapes.setAttribute("visibility", "hidden");
  if (invalidVisual) invalidVisual.setAttribute("visibility", "visible");
  const description = document.getElementById("iou-diagram-desc");
  if (description) description.textContent = message;
  const meter = document.getElementById("iou-meter-fill");
  if (meter) meter.style.width = "0%";
  showArea("intersection-area", null); showArea("union-area", null);
}
function updateIoU() {
  if (!iouOutput || inputs.some(input => !input)) return;
  const values = inputs.map(input => input.value.trim() === "" ? NaN : Number(input.value));
  const missing = values.flatMap((value, index) => Number.isFinite(value) ? [] : [index]);
  if (missing.length) { invalidIoU("Enter a finite number for every coordinate.", missing); return; }
  const a = values.slice(0, 4), b = values.slice(4, 8);
  const badIndices = [];
  [a, b].forEach((box, index) => {
    if (box[2] <= box[0]) badIndices.push(index * 4, index * 4 + 2);
    if (box[3] <= box[1]) badIndices.push(index * 4 + 1, index * 4 + 3);
  });
  if (badIndices.length) { invalidIoU("Each box needs x2 > x1 and y2 > y1. Check the highlighted coordinates.", badIndices); return; }
  const metrics = boxMetrics(a, b);
  const rangeX = Math.max(a[2], b[2]) - Math.min(a[0], b[0]);
  const rangeY = Math.max(a[3], b[3]) - Math.min(a[1], b[1]);
  if (![metrics.areaA, metrics.areaB, metrics.union, rangeX, rangeY].every(Number.isFinite) || metrics.areaA <= 0 || metrics.areaB <= 0 || !Number.isFinite(Math.min(280 / rangeX, 210 / rangeY))) {
    invalidIoU("Use a less extreme coordinate range so areas and the diagram can be represented accurately.", ids.map((_, index) => index)); return;
  }
  const result = iou(a, b);
  if (iouError) iouError.textContent = "";
  inputs.forEach(input => input.removeAttribute("aria-invalid"));
  iouOutput.textContent = `IoU = ${result.toFixed(3)} (${(result * 100).toFixed(1)}%)`;
  const meter = document.getElementById("iou-meter-fill");
  if (meter) meter.style.width = `${result * 100}%`;
  showArea("intersection-area", metrics.intersection); showArea("union-area", metrics.union);
  renderBoxes(a, b, metrics);
}
if (iouOutput && inputs.every(Boolean)) {
  inputs.forEach(input => input.addEventListener("input", updateIoU));
  const presets = {
    partial: [0, 0, 100, 100, 50, 50, 150, 150],
    identical: [0, 0, 100, 100, 0, 0, 100, 100],
    apart: [0, 0, 100, 100, 150, 150, 250, 250]
  };
  document.querySelectorAll("button[data-preset]").forEach(button => {
    button.addEventListener("click", () => {
      const preset = presets[button.dataset.preset];
      if (!preset) return;
      inputs.forEach((input, index) => { input.value = preset[index]; });
      updateIoU();
    });
  });
  updateIoU();
}

// Clipboard API plus a local-file/denied-permission fallback; restore focus.
async function copyText(text) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    try { await navigator.clipboard.writeText(text); return; } catch { /* Try the selection-based fallback. */ }
  }
  const previousFocus = document.activeElement;
  const selection = window.getSelection();
  const ranges = selection ? Array.from({ length: selection.rangeCount }, (_, i) => selection.getRangeAt(i).cloneRange()) : [];
  const textarea = document.createElement("textarea");
  textarea.value = text; textarea.readOnly = true;
  textarea.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;";
  document.body.appendChild(textarea);
  let copied = false;
  try { textarea.select(); textarea.setSelectionRange(0, textarea.value.length); copied = document.execCommand("copy"); }
  finally {
    textarea.remove();
    previousFocus?.focus({ preventScroll: true });
    if (selection) { selection.removeAllRanges(); ranges.forEach(range => selection.addRange(range)); }
  }
  if (!copied) throw new Error("Clipboard unavailable");
}
document.querySelectorAll("button[data-copy]").forEach(button => {
  let resetTimer;
  const originalText = button.textContent;
  button.addEventListener("click", async () => {
    const code = document.getElementById(button.dataset.copy);
    const status = document.getElementById("copy-status");
    if (!code) { if (status) status.textContent = "The code block could not be found."; return; }
    clearTimeout(resetTimer);
    try {
      await copyText(code.textContent);
      button.textContent = "Copied!";
      if (status) status.textContent = "Python code copied to the clipboard.";
    } catch {
      button.textContent = "Select code";
      const range = document.createRange(); range.selectNodeContents(code);
      const selection = window.getSelection(); selection?.removeAllRanges(); selection?.addRange(range);
      if (status) status.textContent = "Automatic copying is unavailable. The code is selected; use your browser's copy command.";
    }
    resetTimer = setTimeout(() => { button.textContent = originalText; }, 1800);
  });
});

// Balanced motion: CSS handles slow movement; JS only updates pointer tilt.
const motionButton = document.getElementById("motion-toggle");
const stage = document.getElementById("network-stage");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
let userPaused = false;
try { userPaused = localStorage.getItem("vision-notes-motion") === "paused"; } catch { /* Storage is optional. */ }
function resetTilt() { stage?.style.removeProperty("--pointer-x"); stage?.style.removeProperty("--pointer-y"); }
function syncMotion() {
  const paused = reducedMotion.matches || userPaused;
  document.body.dataset.motion = paused ? "paused" : "running";
  if (motionButton) {
    motionButton.hidden = false;
    motionButton.setAttribute("aria-pressed", String(paused));
    motionButton.textContent = paused ? "Motion off" : "Motion on";
    motionButton.setAttribute("aria-label", reducedMotion.matches ? "Motion is off because your system prefers reduced motion" : "Pause visual motion");
    motionButton.disabled = reducedMotion.matches;
  }
  resetTilt();
}
motionButton?.addEventListener("click", () => {
  userPaused = !userPaused;
  try { localStorage.setItem("vision-notes-motion", userPaused ? "paused" : "running"); } catch { /* Storage is optional. */ }
  syncMotion();
});
reducedMotion.addEventListener("change", syncMotion);
finePointer.addEventListener("change", resetTilt);
let tiltFrame = 0, pointerX = 0, pointerY = 0;
stage?.addEventListener("pointermove", event => {
  if (reducedMotion.matches || userPaused || !finePointer.matches) return;
  const rect = stage.getBoundingClientRect();
  pointerX = (event.clientX - rect.left) / rect.width;
  pointerY = (event.clientY - rect.top) / rect.height;
  if (!tiltFrame) tiltFrame = requestAnimationFrame(() => {
    tiltFrame = 0;
    if (reducedMotion.matches || userPaused || !finePointer.matches) return;
    stage.style.setProperty("--pointer-x", `${(pointerX - .5) * 7}deg`);
    stage.style.setProperty("--pointer-y", `${(.5 - pointerY) * 5}deg`);
  });
}, { passive: true });
stage?.addEventListener("pointerleave", () => { cancelAnimationFrame(tiltFrame); tiltFrame = 0; resetTilt(); });
document.addEventListener("visibilitychange", () => { document.body.dataset.pageHidden = String(document.hidden); if (document.hidden) resetTilt(); });
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add("is-revealed"); revealObserver.unobserve(entry.target);
    }
  }, { threshold: .12 });
  document.querySelectorAll("[data-reveal]").forEach(element => revealObserver.observe(element));
}
syncMotion();
