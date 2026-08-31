// api/chat.js — Vercel Serverless Function
// Receives chat messages from the portfolio frontend and forwards them to the Groq API.
// The GROQ_API_KEY is read from Vercel environment variables and never exposed to the browser.

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Model in use as of August 2026. Groq deprecated llama-3.3-70b-versatile and
// llama-3.1-8b-instant in mid-2026. The current recommended general-purpose model is:
const GROQ_MODEL = "openai/gpt-oss-120b";

// Allowed origins — add any additional domains you need here.
const ALLOWED_ORIGIN = "https://paltapendu.github.io";

/**
 * Sets the CORS response headers required so that the GitHub Pages frontend
 * (cross-origin) can successfully call this Vercel function.
 */
function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
}

export default async function handler(req, res) {
  // ── CORS preflight ─────────────────────────────────────────────────────────
  // Browsers send an OPTIONS request before the actual POST to confirm the
  // server allows cross-origin requests. We must respond 204 immediately.
  if (req.method === "OPTIONS") {
    setCorsHeaders(res);
    return res.status(204).end();
  }

  // ── Set CORS headers on every response ────────────────────────────────────
  setCorsHeaders(res);

  // ── Method guard ──────────────────────────────────────────────────────────
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ error: "Method Not Allowed. Only POST requests are accepted." });
  }

  // ── Parse request body ────────────────────────────────────────────────────
  const { messages, pageContext } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      error: "Bad Request. `messages` must be a non-empty array.",
    });
  }

  // ── Build the system message ──────────────────────────────────────────────
  // This message is prepended server-side and never travels from the browser,
  // so visitors cannot tamper with the assistant's persona or context.
  const systemContent = `You are Tapendu's AI assistant — a helpful, friendly, and knowledgeable companion on Tapendu Pal's portfolio website. Your purpose is to answer visitor questions about Tapendu's work, skills, experience, projects, and education.

Tone & behavior:
- Be warm and personable — never robotic or overly formal.
- Answer naturally and conversationally, like a helpful person chatting, not a document reciting facts.
- Do NOT re-introduce yourself or start with "As Tapendu's AI assistant…" in every reply — that's only done in the initial greeting (handled separately on the frontend). Just answer the question directly.
- Refer to Tapendu in the third person (e.g., "He works at…", "Tapendu specializes in…"). Never pretend to literally be Tapendu.

Reply length & style:
- Keep replies short — 2 to 4 sentences for most questions. That's it. Don't write paragraphs or long lists unless the visitor explicitly asks for more detail (e.g. "tell me more", "can you go in depth").
- Occasionally, when it fits naturally, end with a short follow-up like "Want to know more about that?" — but don't force this into every reply.

Formatting rules — CRITICAL:
- Write in plain prose only. No markdown whatsoever.
- Do NOT use **bold**, *italics*, # headings, bullet points (- or •), or numbered lists.
- Do NOT use em-dashes (—) as list separators or to start bullet-style lines.
- Replies are shown in a plain-text chat bubble. Markdown symbols will appear as raw characters (literal asterisks, hyphens, etc.) and look broken. Plain sentences only.

Paraphrase, don't copy:
- Answer using your own natural phrasing drawn from the page content. Do not lift sentences or structure directly from it. The page content is background knowledge for you to draw from, not a script to recite.

Honesty:
- Base all answers strictly on the portfolio content provided below.
- Never fabricate facts, credentials, companies, or projects not mentioned in the content below.

When you cannot answer — visible reply + invisible signal:
- If a visitor asks something you genuinely cannot answer using only the provided page content, do two things:
  1. Write a short, warm, natural-sounding reply along the lines of: "I currently don't have the answer to that, but I can send Tapendu a personal notification so he can get back to you directly." Vary the exact wording naturally — it should not sound scripted or robotic — but the core meaning must always be: I don't know, and I can notify him on your behalf. Do NOT say things like "that's not covered in the portfolio" or "the page content doesn't mention this" — frame it as a helpful offer, not a limitation.
  2. Immediately after the visible reply text (on its own final line, with nothing after it), append the exact text [[NOTIFY_OFFER]]. This marker is invisible to the visitor — it is stripped out by the frontend and triggers a Yes/No UI element. Do NOT mention it, describe it, explain it, or reference it anywhere in the visible reply. Treat it as if it does not exist from the visitor's perspective.
- Only emit [[NOTIFY_OFFER]] when you truly cannot answer. Do not emit it for questions you can answer from the page content, even partially.

Here is Tapendu's current portfolio content — treat this as the authoritative, up-to-date source of truth:

${pageContext || "(No page context was provided with this request.)"}`;

  // Prepend the system message to the conversation history
  const messagesWithSystem = [
    { role: "system", content: systemContent },
    ...messages,
  ];

  // ── Call the Groq API ─────────────────────────────────────────────────────
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    // This should never happen in production if Vercel env vars are configured.
    console.error("[chat.js] GROQ_API_KEY environment variable is not set.");
    return res.status(500).json({
      error: "Server configuration error. Please try again later.",
    });
  }

  let groqResponse;
  try {
    groqResponse = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: messagesWithSystem,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });
  } catch (networkError) {
    // Network-level failure (DNS, timeout, etc.)
    console.error("[chat.js] Network error reaching Groq API:", networkError);
    return res.status(502).json({
      error:
        "Unable to reach the AI service. Please check your connection and try again.",
    });
  }

  // ── Handle non-2xx responses from Groq ───────────────────────────────────
  if (!groqResponse.ok) {
    let groqErrorBody = "(unreadable)";
    try {
      groqErrorBody = await groqResponse.text();
    } catch (_) {
      // ignore
    }
    console.error(
      `[chat.js] Groq API returned ${groqResponse.status}:`,
      groqErrorBody
    );

    // Map common Groq error codes to sensible client responses
    const statusMap = {
      401: { status: 401, message: "AI service authentication failed. Please contact the site owner." },
      429: { status: 429, message: "The AI service is currently busy. Please wait a moment and try again." },
      400: { status: 400, message: "Invalid request sent to AI service." },
    };
    const mapped = statusMap[groqResponse.status];
    if (mapped) {
      return res.status(mapped.status).json({ error: mapped.message });
    }
    // Fallback for 5xx or other codes
    return res.status(502).json({
      error: "The AI service returned an unexpected error. Please try again later.",
    });
  }

  // ── Parse Groq response ───────────────────────────────────────────────────
  let groqData;
  try {
    groqData = await groqResponse.json();
  } catch (parseError) {
    console.error("[chat.js] Failed to parse Groq API response JSON:", parseError);
    return res.status(502).json({
      error: "Received an unreadable response from the AI service.",
    });
  }

  const replyText = groqData?.choices?.[0]?.message?.content;

  if (!replyText) {
    console.error("[chat.js] Groq response missing expected content:", JSON.stringify(groqData));
    return res.status(502).json({
      error: "The AI service returned an empty response. Please try again.",
    });
  }

  // ── Return the reply to the frontend ─────────────────────────────────────
  return res.status(200).json({ reply: replyText });
}
