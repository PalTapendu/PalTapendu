<div align="center">

# TP. — Tapendu Pal

### I build with AI. Every single day.

**Applied AI · Automation Architect**

[![Live Site](https://img.shields.io/badge/Live-tapendu.is--a.dev-2ea44f?style=for-the-badge)](https://tapendu.is-a.dev)
[![Status](https://img.shields.io/badge/Status-Online-brightgreen?style=for-the-badge)]()

</div>

---

## About

I'm an engineer who lives at the intersection of software engineering and applied AI. I use tools like GitHub Copilot, ChatGPT, and Claude to design, prototype, and ship automated enterprise systems — bringing the same AI-native mindset into professional, production-grade engineering.

Professionally, I work as a **Program Analyst — Automation Test Engineer** at **Cognizant Technology Solutions** (Healthcare domain), building and maintaining automated test suites at scale. Outside of work, I build full-stack, AI-powered projects — this portfolio being one of them.

**Live site:** [tapendu.is-a.dev](https://tapendu.is-a.dev)

---

## Highlights

| | |
|---|---|
| 🧪 **2+ Yrs** | SDET @ Cognizant — building & testing enterprise software at scale |
| 🤖 **5+ AI Tools** | Daily engineering stack (Copilot, ChatGPT, Claude, and more) |
| 🚀 **2 Live Projects** | Shipped and in production, with more in active development |
| 🎓 **B.Tech** | Computer Science & Engineering |

---

## ✨ Features

- **Live, self-updating experience counter** — the "years of experience" stat on the hero section calculates itself from a real start date, so it never needs manual updates.
- **AI chat assistant** — a custom-built conversational widget, personally trained on this site's own content, that can answer visitor questions about my background, skills, and projects in real time.
- **"Notify me" lead capture** — a fully conversational (no traditional form) flow that lets visitors leave their name, contact info, and a message, delivered straight to my inbox — with the AI assistant itself proactively offering this whenever it can't answer a question.
- **Persistent conversations** — chats are remembered across visits (within a rolling window), with a friendly prompt to resume or start fresh.
- **Interactive, animated UI** — mouse-reactive background, scroll-triggered reveal animations, a live-typing terminal effect, and a custom illustrated character that reacts to visitor interaction.
- **Fully responsive** — designed and tested across desktop and mobile.

---

## 🛠️ Tech Stack

**Frontend**
- HTML5, CSS3 (custom, no framework), Vanilla JavaScript

**Backend / AI**
- [Vercel](https://vercel.com) — serverless functions, hosting the AI backend
- [Groq API](https://groq.com) — LLM inference for the chat assistant
- [Web3Forms](https://web3forms.com) — client-side email delivery for the lead-capture flow

**Infrastructure**
- [GitHub Pages](https://pages.github.com) — primary site hosting
- [is-a.dev](https://is-a.dev) — free custom subdomains (`tapendu.is-a.dev` for the site, `api.tapendu.is-a.dev` for the backend)

---

## 🏗️ Architecture

```
Visitor's Browser
       │
       ├── Static Site (HTML/CSS/JS) ── served via GitHub Pages
       │        │
       │        ├── Chat Widget ──► api.tapendu.is-a.dev (Vercel) ──► Groq API
       │        │                         │
       │        │                         └── System prompt built from
       │        │                             live-scraped page content
       │        │
       │        └── Notify Flow ──► api.web3forms.com (direct, client-side)
       │                                  │
       │                                  └── Email delivered to inbox
```

The chat assistant's knowledge is never hardcoded — its system prompt is built server-side from the site's own live content on every request, so any update to the site automatically updates what the assistant knows, with zero prompt maintenance.

---

## 📁 Project Structure

```
├── index.html          # Main site markup
├── style.css           # All styling
├── script.js           # All client-side logic (widget, animations, flows)
└── api/
    └── chat.js         # Vercel serverless function — Groq proxy
```

---

## 📬 Contact

Have a project in mind, or just want to talk shop? Reach out through the [Contact section](https://tapendu.is-a.dev/#contact) on the live site — or use the AI assistant in the corner, it'll pass your message along.

- **GitHub:** [@PalTapendu](https://github.com/PalTapendu)
- **LinkedIn:** [tapendu-pal](https://linkedin.com/in/tapendu-pal-b23273224)

---

<div align="center">

*Built with AI, refined by hand.*

</div>
