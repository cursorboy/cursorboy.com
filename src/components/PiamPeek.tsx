"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * A cutout of Piam who peeks (just his face) from the corner of the home page.
 * Hover and he pops fully out. Click him and he travels up to the name, where a
 * speech bubble forms around the cursor-arrows and they animate into whatever he
 * has to say. Click again and they move on to the next line.
 */
const LINES = [
  "hi!",
  "that's me",
  "i love legos",
  "taco bell?",
  "let's build",
  "go climb?",
];

type Bubble = { left: number; top: number; width: number; height: number };

export default function PiamPeek() {
  const [bubble, setBubble] = useState<Bubble | null>(null);
  const [peekStyle, setPeekStyle] = useState<CSSProperties | undefined>();
  const peekRef = useRef<HTMLDivElement>(null);
  const idx = useRef(0);
  const timer = useRef<number>(0);

  // NameLetters reports where the cursors will gather → wrap a bubble there and
  // send the cutout up to stand just beneath it.
  useEffect(() => {
    function onBubble(e: Event) {
      const b = (e as CustomEvent<Bubble>).detail;
      setBubble(b);
      const el = peekRef.current;
      if (!el) return;
      const h = el.offsetHeight;
      const w = el.offsetWidth;
      const rightPx = parseFloat(getComputedStyle(el).right) || 0;
      const layoutTop = window.innerHeight - h;
      const layoutLeft = window.innerWidth - rightPx - w;
      // stand off the bubble's lower-right, not directly under it
      const bubbleRight = b.left + b.width / 2 + (b.width + 96) / 2;
      const bubbleBottom = b.top + b.height / 2 + (b.height + 72) / 2;
      const targetCenterX = bubbleRight + 18;
      const targetHeadTop = bubbleBottom - 2;
      const dx = targetCenterX - (layoutLeft + w / 2);
      const dy = targetHeadTop - layoutTop;
      setPeekStyle({ transform: `translate(${dx}px, ${dy}px)` });
    }
    window.addEventListener("piam:bubble", onBubble);
    return () => {
      window.removeEventListener("piam:bubble", onBubble);
      window.clearTimeout(timer.current);
    };
  }, []);

  function speak() {
    const line = LINES[idx.current % LINES.length];
    idx.current = (idx.current + 1) % LINES.length;
    window.dispatchEvent(new CustomEvent("piam:say", { detail: { text: line } }));
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setBubble(null);
      setPeekStyle(undefined);
      window.dispatchEvent(new Event("piam:hush"));
    }, 5200);
  }

  return (
    <>
      {bubble && (
        <div
          className="piamSayBubble"
          style={{
            left: bubble.left + bubble.width / 2,
            top: bubble.top + bubble.height / 2,
            width: bubble.width + 96,
            height: bubble.height + 72,
          }}
          aria-hidden
        />
      )}
      <div
        ref={peekRef}
        className={`piamPeek ${peekStyle ? "is-saying" : ""}`}
        style={peekStyle}
        data-ui
      >
        <button
          type="button"
          className="piamPeekBtn"
          onClick={speak}
          aria-label="It's me, Piam. Click and I'll say something."
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/me/cutout.png"
            alt=""
            className="piamPeekImg"
            draggable={false}
          />
          <span className="piamShadow" aria-hidden />
        </button>
      </div>
    </>
  );
}
