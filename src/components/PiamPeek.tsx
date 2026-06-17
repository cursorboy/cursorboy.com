"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";

/**
 * A cutout of Piam who peeks (just his face) from the corner of the home page.
 * Hover and he pops fully out. Click him and he travels up to the name, where a
 * speech bubble forms around the cursor-arrows. Then you can actually talk to
 * him: type a message and a tiny in-character reply (from /api/chat) morphs into
 * the cursors. Click him again — or hit Escape — to send him back to the corner.
 */

type Bubble = { left: number; top: number; width: number; height: number };
type ChatMsg = { role: "user" | "assistant"; content: string };

const OPENER = "hey — ask me anything";

export default function PiamPeek() {
  const [bubble, setBubble] = useState<Bubble | null>(null);
  const [peekStyle, setPeekStyle] = useState<CSSProperties | undefined>();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [draft, setDraft] = useState("");

  const peekRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const history = useRef<ChatMsg[]>([]);

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
    return () => window.removeEventListener("piam:bubble", onBubble);
  }, []);

  // form the bubble + cursors around a line of text
  function say(text: string) {
    window.dispatchEvent(new CustomEvent("piam:say", { detail: { text } }));
  }

  function openChat() {
    if (open) {
      inputRef.current?.focus();
      return;
    }
    setOpen(true);
    history.current = [];
    say(OPENER);
    // wait a beat for the cutout to travel up, then focus the field
    window.setTimeout(() => inputRef.current?.focus(), 120);
  }

  function closeChat() {
    setOpen(false);
    setPending(false);
    setDraft("");
    history.current = [];
    setBubble(null);
    setPeekStyle(undefined);
    window.dispatchEvent(new Event("piam:hush"));
  }

  async function send(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || pending) return;
    setDraft("");
    history.current = [
      ...history.current,
      { role: "user" as const, content: text },
    ].slice(-8);
    setPending(true);
    say("one sec");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history.current }),
      });
      const data = (await res.json()) as { reply?: string };
      const reply = (data.reply || "hmm").slice(0, 80);
      history.current = [
        ...history.current,
        { role: "assistant" as const, content: reply },
      ].slice(-8);
      say(reply);
    } catch {
      say("lost my words — try again?");
    } finally {
      setPending(false);
      inputRef.current?.focus();
    }
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

      {open && (
        <form
          className="piamChat"
          data-ui
          onSubmit={send}
          onKeyDown={(e) => {
            if (e.key === "Escape") closeChat();
          }}
        >
          <input
            ref={inputRef}
            className="piamChatInput"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="say something to piam…"
            aria-label="Chat with Piam"
            maxLength={200}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            className="piamChatSend"
            disabled={pending || !draft.trim()}
            aria-label="Send"
          >
            {pending ? "…" : "↵"}
          </button>
          <button
            type="button"
            className="piamChatClose"
            onClick={closeChat}
            aria-label="Close chat"
          >
            ×
          </button>
        </form>
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
          onClick={openChat}
          aria-label="It's me, Piam. Click to chat."
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
