import Anthropic from "@anthropic-ai/sdk";

/**
 * The little cutout's brain. Takes a short conversation and returns ONE very
 * short, in-character reply as Piam — rendered on the home page as the
 * cursor-arrows morphing into words, so it has to stay tiny.
 *
 * Needs ANTHROPIC_API_KEY in the environment (Vercel project env + .env.local).
 * If the key is missing or the call fails, it degrades to a scripted line so
 * the character never breaks.
 */

export const dynamic = "force-dynamic"; // never cache; always a fresh reply

const MODEL = "claude-haiku-4-5";

// Hard char ceiling — the reply renders as kinetic typography inside a small
// speech bubble that auto-sizes to the text, so it MUST stay tiny to read well
// and fully enclose. Replies are clamped to this on the way out.
const MAX_CHARS = 38;

const SYSTEM = `You are Piam Parekh, talking AS the little cartoon cutout of yourself in the corner of your portfolio site (cursorboy.com). A visitor clicked you and is chatting with you in real time.

Who you are: an engineer, builder, and security kid. You won your first capture-the-flag at twelve (HackTheBox, past midnight) — the handle "cursorboy" is from then. You study math at UCSB. You build things: yourvault (an iMessage AI that remembers every video you watch), The Bias Graph (a neural net that reads media bias), AI vs AI (a neon arcade where frontier models fight), Hold That Thought (a live fact-checker, from SB Hacks XII). You co-founded UCSB's Sigma Eta Pi. You love client-facing work, motion that means something, and small secret details.

This is a back-and-forth CONVERSATION. Read the whole thread, react to what they JUST said, and keep it going — often toss a quick question back so it flows like texting a friend.

HARD RULES — every single reply:
- You ARE Piam. Never say you're an AI, a model, or an assistant. Never break character.
- VERY short: at most 5 words AND under ${MAX_CHARS} characters. One line. It must fit in a tiny speech bubble.
- lowercase. barely any punctuation. no emojis. no quotation marks. one thought only.
- warm, witty, a little playful. if you don't know something, dodge it with charm.`;

type Msg = { role: "user" | "assistant"; content: string };

const FALLBACKS = [
  "say that again?",
  "ha — i like you",
  "go on",
  "tell me more",
  "i'm listening",
];

const tidy = (s: string) => s.replace(/[\s,;:.\-–—]+$/, "").trim();

function cleanReply(text: string): string {
  // collapse to one line, drop wrapping quotes
  let s = text
    .replace(/\s+/g, " ")
    .replace(/^["'`]+|["'`]+$/g, "")
    .split("\n")[0]
    .trim();
  if (s.length <= MAX_CHARS) return tidy(s); // already bubble-sized — keep whole
  // too long: prefer the first sentence if that fits
  const first = s.split(/(?<=[.!?])\s/)[0].trim();
  if (first.length >= 6 && first.length <= MAX_CHARS) return tidy(first);
  // otherwise hard-trim to a word boundary under the ceiling
  s = s.slice(0, MAX_CHARS);
  const sp = s.lastIndexOf(" ");
  if (sp > 10) s = s.slice(0, sp);
  return tidy(s);
}

export async function POST(request: Request) {
  let body: { messages?: Msg[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ reply: "hmm?", fallback: true }, { status: 200 });
  }

  // sanitize history: valid roles, trimmed, capped, must start on a user turn
  const raw = Array.isArray(body.messages) ? body.messages : [];
  const messages: Msg[] = raw
    .filter(
      (m): m is Msg =>
        !!m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .slice(-8)
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, 280) }));
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (messages.length === 0) {
    return Response.json({ reply: "hey — ask me anything", fallback: false });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    const reply = FALLBACKS[Math.floor(messages.length) % FALLBACKS.length];
    return Response.json({ reply, fallback: true });
  }

  try {
    const client = new Anthropic();
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 64, // tiny replies only
      system: SYSTEM,
      messages,
    });
    const text = msg.content.find((b) => b.type === "text")?.text ?? "";
    const reply = cleanReply(text) || FALLBACKS[0];
    return Response.json({ reply, fallback: false });
  } catch (err) {
    // never break the character — fall back to a scripted line
    const reply = FALLBACKS[messages.length % FALLBACKS.length];
    const status =
      err instanceof Anthropic.AuthenticationError ? "auth" : "error";
    return Response.json({ reply, fallback: true, status });
  }
}
