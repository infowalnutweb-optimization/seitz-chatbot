# The Seitz Foundation — Chatbot Widget

## Overview

This is a standalone, embeddable screening chatbot widget built for **paulseitz.com** (The Seitz Foundation). It qualifies website visitors through a warm, conversational flow and routes them to the appropriate Calendly booking link based on their answers. All collected information is automatically passed into the Calendly booking notes so Paul can review it before each meeting.

The widget is a **single JavaScript file** with no external dependencies (no React, no frameworks). It injects its own CSS and HTML into any page where it is loaded.

---

## Quick Start

Add this single line before the closing `</body>` tag on any page of paulseitz.com:

```html
<script src="seitz-chatbot-widget.js"></script>
```

That's it. The chat bubble will appear in the bottom-right corner of the page.

---

## File Contents

| File | Purpose |
|------|---------|
| `seitz-chatbot-widget.js` | The complete widget — HTML, CSS, and JS bundled into one file |
| `README.md` | This integration guide |

---

## Configuration

Open `seitz-chatbot-widget.js` in any text editor. Near the top of the file (around line 20), you will find a `CONFIG` object:

```javascript
const CONFIG = {
  // Replace these with Paul's actual Calendly links
  calendlyUrls: {
    currenceOnboarding: "https://calendly.com/paulseitz/currence-onboarding",
    strategySession: "https://calendly.com/paulseitz/60-min-strategy",
  },

  // Widget images (hosted on CDN — can be replaced with your own)
  headerBg: "https://d2xsxph8kpxj0f.cloudfront.net/...",
  botAvatar: "https://d2xsxph8kpxj0f.cloudfront.net/...",

  // Bot protection: minimum seconds a human needs to complete the chat
  minHumanDurationSec: 15,

  // Delay before showing "Chat with us!" label (ms)
  triggerLabelDelay: 3000,
};
```

### What to Change

| Setting | What It Does | Default |
|---------|-------------|---------|
| `calendlyUrls.currenceOnboarding` | Calendly link for visitors with savings rate under 4% | Placeholder URL |
| `calendlyUrls.strategySession` | Calendly link for visitors with savings rate 4%+ | Placeholder URL |
| `headerBg` | Background image in the chat header | Hawaiian sunset (CDN-hosted) |
| `botAvatar` | Bot avatar image shown in header and next to messages | Foundation logo (CDN-hosted) |
| `minHumanDurationSec` | Minimum seconds before booking link appears (bot protection) | 15 |
| `triggerLabelDelay` | Milliseconds before "Chat with us!" tooltip appears | 3000 |

---

## Conversation Flow

The chatbot asks seven qualifying questions in this order:

| Step | Question | Input Type |
|------|----------|------------|
| 1 | Name | Free text |
| 2 | Age | Number |
| 3 | Annual income | Multiple choice (5 brackets) |
| 4 | Current savings rate | Number (percentage) |
| 5 | Business owner or W-2? | Multiple choice (4 options) |
| 6 | Saving vs. investing strategies | Multiple choice (4 options) |
| 7 | Wealth management approach | Multiple choice (3 options) |

### Routing Logic

After all questions are answered, the widget routes the visitor based on their **savings rate**:

- **Savings rate under 4%** — Routes to the **Currence Onboarding Session** (designed to help build a savings foundation first).
- **Savings rate 4% or above** — Routes to the **60-Minute Strategy Session** (a deeper dive into family banking and wealth-building strategy).

### Calendly Notes

All seven answers are automatically encoded into the Calendly booking URL via the `a1` query parameter. When the visitor books, Paul will see the full screening summary in the booking notes:

```
Name: John Smith
Age: 35
Annual Income: $100,000 - $200,000
Savings Rate: 10%
Employment Type: Business Owner
Strategy Interest: Saving with Sound Money (Family Banking)
Wealth Management Approach: Wants self-management education
```

---

## Bot Protection

The widget includes two layers of invisible bot protection:

1. **Honeypot Field** — A hidden input field that is invisible to human visitors but gets auto-filled by automated bots. If the field contains any value when the user reaches the booking step, the Calendly link is silently blocked and a polite error message is shown instead.

2. **Timing Check** — The widget records when the conversation starts. If all seven questions are completed in fewer than 15 seconds (configurable via `minHumanDurationSec`), the session is flagged as non-human and the booking link is withheld.

Neither protection mechanism requires any action from real visitors. They are completely invisible to humans.

---

## Hosting the Script

You have several options for hosting the widget file:

**Option A — Same server as paulseitz.com.** Upload `seitz-chatbot-widget.js` to your web server (e.g., in a `/js/` directory) and reference it:

```html
<script src="/js/seitz-chatbot-widget.js"></script>
```

**Option B — CDN.** Upload the file to a CDN (Cloudflare, AWS CloudFront, Netlify, etc.) and reference the CDN URL:

```html
<script src="https://your-cdn.com/seitz-chatbot-widget.js"></script>
```

**Option C — Inline.** Copy the entire contents of the JS file into a `<script>` tag directly in the HTML. This avoids an extra network request but makes the HTML file larger.

---

## Customizing the Design

The widget uses CSS custom properties (variables) defined inside the JavaScript file. Search for `--seitz-` in the CSS block to find all color tokens:

| Variable | Purpose | Default |
|----------|---------|---------|
| `--seitz-maroon` | Header overlay, brand headings | Deep maroon |
| `--seitz-teal` | Bot message accents, send button | Ocean teal |
| `--seitz-gold` | Chat trigger button, booking CTA | Warm gold |
| `--seitz-sand` | Input backgrounds, bot bubbles | Warm sand |
| `--seitz-text` | Primary text color | Dark charcoal |
| `--seitz-text-muted` | Secondary/helper text | Medium gray |

The widget uses **DM Serif Display** (headings) and **Source Sans 3** (body text), loaded from Google Fonts. These can be changed by editing the `@import` URL and the `--seitz-font-display` / `--seitz-font-body` variables.

---

## Browser Compatibility

The widget works in all modern browsers: Chrome, Firefox, Safari, Edge (latest two versions). It uses standard DOM APIs and CSS features with no polyfills required. The widget is fully responsive and works on mobile devices.

---

## Troubleshooting

**The chat bubble doesn't appear.** Ensure the script tag is placed before `</body>` and the file path is correct. Check the browser console for 404 errors.

**Fonts look different.** The widget loads Google Fonts via CSS `@import`. If your site has a Content Security Policy (CSP), ensure `fonts.googleapis.com` and `fonts.gstatic.com` are allowed.

**Calendly link doesn't pre-fill notes.** Verify that the Calendly event type has a custom question with the field identifier `a1` enabled, or that Calendly's "Additional Notes" field is active for the event.

**Bot protection is too aggressive.** Increase `minHumanDurationSec` in the CONFIG (e.g., to 10 or even 5) if legitimate users are being blocked. The typing animations alone take about 20 seconds for a real user, so 15 seconds is already conservative.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | April 2026 | Initial release with full conversation flow, Calendly integration, honeypot + timing bot protection |
