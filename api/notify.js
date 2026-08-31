// api/notify.js — Vercel Serverless Function
// Receives lead-capture submissions from the portfolio chat widget and
// forwards them to Web3Forms so Tapendu gets an email notification.
// The WEB3FORMS_ACCESS_KEY is read from Vercel environment variables
// and is never exposed to the browser.

const WEB3FORMS_URL = "https://api.web3forms.com/submit";

// Must match the allowed origin in api/chat.js exactly.
const ALLOWED_ORIGIN = "https://paltapendu.github.io";

/**
 * Sets the CORS response headers required so that the GitHub Pages frontend
 * (cross-origin) can successfully call this Vercel function.
 * Mirrors api/chat.js setCorsHeaders() exactly.
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
  // CORS preflight
  if (req.method === "OPTIONS") {
    setCorsHeaders(res);
    return res.status(204).end();
  }

  // Set CORS headers on every response
  setCorsHeaders(res);

  // Method guard
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ error: "Method Not Allowed. Only POST requests are accepted." });
  }

  // Parse and validate request body
  const { name, contact, message } = req.body || {};

  const trimmedName    = (name    || "").trim();
  const trimmedMessage = (message || "").trim();
  const trimmedContact = (contact || "").trim();

  if (!trimmedName) {
    return res.status(400).json({
      error: "Bad Request. `name` is required and cannot be empty.",
    });
  }

  if (!trimmedMessage) {
    return res.status(400).json({
      error: "Bad Request. `message` is required and cannot be empty.",
    });
  }

  // Guard: access key must be configured
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;

  if (!accessKey) {
    console.error("[notify.js] WEB3FORMS_ACCESS_KEY environment variable is not set.");
    return res.status(500).json({
      success: false,
      error: "Server configuration error. Please try again later.",
    });
  }

  // Forward to Web3Forms
  let w3fResponse;
  try {
    w3fResponse = await fetch(WEB3FORMS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        name:    trimmedName,
        contact: trimmedContact || "Not provided",
        message: trimmedMessage,
      }),
    });
  } catch (networkError) {
    console.error("[notify.js] Network error reaching Web3Forms:", networkError);
    return res.status(502).json({
      success: false,
      error: "Unable to reach the notification service. Please try again.",
    });
  }

  // Handle non-2xx responses from Web3Forms
  if (!w3fResponse.ok) {
    let w3fBody = "(unreadable)";
    try { w3fBody = await w3fResponse.text(); } catch (_) {}
    console.error("[notify.js] Web3Forms returned " + w3fResponse.status + ":", w3fBody);
    return res.status(502).json({
      success: false,
      error: "The notification service returned an error. Please try again later.",
    });
  }

  // Parse Web3Forms response
  let w3fData;
  try {
    w3fData = await w3fResponse.json();
  } catch (parseError) {
    console.error("[notify.js] Failed to parse Web3Forms response:", parseError);
    return res.status(502).json({
      success: false,
      error: "Received an unreadable response from the notification service.",
    });
  }

  // Web3Forms returns { success: true } on a valid submission.
  if (!w3fData.success) {
    console.error("[notify.js] Web3Forms reported failure:", JSON.stringify(w3fData));
    return res.status(502).json({
      success: false,
      error: "The notification service rejected the submission. Please try again.",
    });
  }

  // All good
  return res.status(200).json({ success: true });
}
