"use client";

import { useEffect, useRef } from "react";

const BRUSH_COLOR = "#738cde";
const BRUSH_WIDTH = 38;
const FADE_MS = 2000;
// Share of a stroke's intensity left after FADE_MS; small enough to be invisible.
const RESIDUE = 0.03;
const FADE_STEP_MS = 32;
const INTERACTIVE = "a, button, input, textarea, select, label, summary";

type Point = { x: number; y: number };

export function StrokeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let drawing = false;
    let running = false;
    let frame = 0;
    let lastFade = 0;
    let lastPaint = 0;
    let previous: Point = { x: 0, y: 0 };
    let previousMid: Point = { x: 0, y: 0 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = BRUSH_WIDTH;
      ctx.strokeStyle = BRUSH_COLOR;
    };

    // Fading each pixel on its own keeps overlapping strokes from building up.
    const tick = (now: number) => {
      const elapsed = now - lastFade;
      if (elapsed >= FADE_STEP_MS) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = `rgba(0, 0, 0, ${1 - Math.pow(RESIDUE, elapsed / FADE_MS)})`;
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = "source-over";
        lastFade = now;
      }

      if (!drawing && now - lastPaint > FADE_MS * 1.2) {
        ctx.clearRect(0, 0, width, height);
        running = false;
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (running) return;
      running = true;
      lastFade = performance.now();
      frame = requestAnimationFrame(tick);
    };

    const extend = (x: number, y: number) => {
      const mid = { x: (previous.x + x) / 2, y: (previous.y + y) / 2 };
      ctx.beginPath();
      ctx.moveTo(previousMid.x, previousMid.y);
      ctx.quadraticCurveTo(previous.x, previous.y, mid.x, mid.y);
      ctx.stroke();
      previous = { x, y };
      previousMid = mid;
      lastPaint = performance.now();
    };

    const onMove = (event: PointerEvent) => {
      const events = event.getCoalescedEvents?.() ?? [];
      for (const point of events.length ? events : [event]) extend(point.clientX, point.clientY);
    };

    const stop = () => {
      if (!drawing) return;
      drawing = false;
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", onMove);
    };

    const onDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      const onScrollbar = event.clientX >= document.documentElement.clientWidth;
      if (event.button !== 0 || event.pointerType === "touch" || onScrollbar) return;
      if (target?.closest(INTERACTIVE)) return;

      drawing = true;
      previous = { x: event.clientX, y: event.clientY };
      previousMid = previous;
      // Keeps the drag from selecting page text while drawing.
      document.body.style.userSelect = "none";
      window.getSelection()?.removeAllRanges();
      window.addEventListener("pointermove", onMove);
      startLoop();
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);

    return () => {
      cancelAnimationFrame(frame);
      stop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, []);

  return <canvas ref={canvasRef} className="draw-canvas" aria-hidden />;
}
