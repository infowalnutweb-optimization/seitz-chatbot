/**
 * The Seitz Foundation — Screening Chatbot Widget
 * 
 * Embeddable widget for paulseitz.com
 * Drop this single script tag before </body> on any page:
 *   <script src="seitz-chatbot-widget.js"></script>
 * 
 * Configuration (optional — edit the CONFIG object below):
 *   - Calendly URLs
 *   - Bot avatar image
 *   - Header background image
 *   - Timing threshold for bot protection
 * 
 * Version: 1.0.0
 * Last updated: April 2026
 */
(function () {
  "use strict";

  // ═══════════════════════════════════════════════════════════
  // CONFIGURATION — Edit these values to customize the widget
  // ═══════════════════════════════════════════════════════════
  const CONFIG = {
    // Replace these with Paul's actual Calendly links
    calendlyUrls: {
      currenceOnboarding: "https://calendly.com/paulseitz/currence-onboarding",
      strategySession: "https://calendly.com/paulseitz/60-min-strategy",
    },

    // Widget images (hosted on CDN)
    headerBg: "https://d2xsxph8kpxj0f.cloudfront.net/310519663064093133/BHsQ64X9pSfu8hywYGBiX9/chatbot-header-bg-NVUfhUNEmWjiTy2m7CApA3.webp",
    botAvatar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663064093133/BHsQ64X9pSfu8hywYGBiX9/bot-avatar-nav9qjGD3yBsHh2kLJ9Jjx.webp",

    // Bot protection: minimum seconds a human needs to complete the chat
    minHumanDurationSec: 15,

    // Delay before showing "Chat with us!" label (ms)
    triggerLabelDelay: 3000,
  };

  // ═══════════════════════════════════════════════════════════
  // CONVERSATION FLOW
  // ═══════════════════════════════════════════════════════════
  const STEPS = {
    greeting: {
      botMessages: [
        "Aloha! Welcome to The Seitz Foundation.",
        "I'm here to help connect you with Paul Seitz, a Certified Wealth Management Professional based in Oahu, Hawaii.",
        "I'll ask you a few quick questions so we can find the best session for your needs. Let's get started!",
      ],
      inputType: "info",
      nextStep: function () { return "name"; },
    },
    name: {
      botMessages: ["First, what's your name?"],
      inputType: "text",
      placeholder: "Your full name",
      validate: function (v) { return v.trim().length < 2 ? "Please enter your name." : null; },
      nextStep: function () { return "age"; },
    },
    age: {
      botMessages: [], // dynamically generated with name
      inputType: "number",
      placeholder: "Your age",
      validate: function (v) {
        var n = parseInt(v);
        return (isNaN(n) || n < 18 || n > 120) ? "Please enter a valid age (18+)." : null;
      },
      nextStep: function () { return "income"; },
    },
    income: {
      botMessages: ["Great! And what is your approximate annual income?"],
      inputType: "select",
      options: [
        { label: "Under $50,000", value: "Under $50,000" },
        { label: "$50,000 – $100,000", value: "$50,000 - $100,000" },
        { label: "$100,000 – $200,000", value: "$100,000 - $200,000" },
        { label: "$200,000 – $500,000", value: "$200,000 - $500,000" },
        { label: "$500,000+", value: "$500,000+" },
      ],
      nextStep: function () { return "savingsRate"; },
    },
    savingsRate: {
      botMessages: ["What percentage of your monthly or annual income are you currently saving?"],
      inputType: "number",
      placeholder: "e.g. 10",
      suffix: "%",
      validate: function (v) {
        var n = parseFloat(v);
        return (isNaN(n) || n < 0 || n > 100) ? "Please enter a percentage between 0 and 100." : null;
      },
      nextStep: function () { return "employmentType"; },
    },
    employmentType: {
      botMessages: ["Are you a business owner or a W-2 wage earner?"],
      inputType: "select",
      options: [
        { label: "Business Owner", value: "Business Owner" },
        { label: "W-2 Wage Earner", value: "W-2 Wage Earner" },
        { label: "Both", value: "Both" },
        { label: "Other (Retired, 1099, etc.)", value: "Other" },
      ],
      nextStep: function () { return "investmentInterest"; },
    },
    investmentInterest: {
      botMessages: ["Are you more interested in saving strategies or investing strategies?"],
      inputType: "select",
      options: [
        { label: "I'm not sure yet — I'd like to learn more", value: "Exploring options" },
        { label: "Saving with sound money — Family Banking with whole life insurance & Bitcoin", value: "Saving with Sound Money (Family Banking)" },
        { label: "Investing — Stock market investments", value: "Stock Market Investments" },
        { label: "Both saving and investing strategies", value: "Both (Saving + Investing)" },
      ],
      nextStep: function () { return "wealthManagement"; },
    },
    wealthManagement: {
      botMessages: [
        "One important thing to know: Paul doesn't manage your assets for you. He teaches you how to manage your own wealth — which leads to significant cost savings and better lifetime returns.",
        "How does that approach sound to you?",
      ],
      inputType: "select",
      options: [
        { label: "That's exactly what I want — I want to learn to manage my own wealth", value: "Wants self-management education" },
        { label: "I'm open to it — tell me more", value: "Open to learning more" },
        { label: "I'd prefer someone to manage it for me", value: "Prefers managed approach" },
      ],
      nextStep: function () { return "routing"; },
    },
    routing: {
      botMessages: [],
      inputType: "info",
      nextStep: function () { return "booking"; },
    },
    booking: {
      botMessages: [],
      inputType: "info",
      nextStep: function () { return "booking"; },
    },
  };

  var STEP_ORDER = ["greeting", "name", "age", "income", "savingsRate", "employmentType", "investmentInterest", "wealthManagement"];

  // ═══════════════════════════════════════════════════════════
  // HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════
  function getRouting(answers) {
    var rate = parseFloat(answers.savingsRate);
    return (isNaN(rate) || rate < 4) ? "currence" : "strategy";
  }

  function buildCalendlyNotes(answers) {
    return [
      "Name: " + answers.name,
      "Age: " + answers.age,
      "Annual Income: " + answers.income,
      "Savings Rate: " + answers.savingsRate + "%",
      "Employment Type: " + answers.employmentType,
      "Strategy Interest: " + answers.investmentInterest,
      "Wealth Management Approach: " + answers.wealthManagement,
    ].join("\n");
  }

  function buildCalendlyUrl(answers, routing) {
    var baseUrl = routing === "currence"
      ? CONFIG.calendlyUrls.currenceOnboarding
      : CONFIG.calendlyUrls.strategySession;
    var notes = buildCalendlyNotes(answers);
    var parts = answers.name.trim().split(/\s+/);
    var firstName = parts[0] || "";
    var lastName = parts.slice(1).join(" ") || "";
    var params = new URLSearchParams();
    if (firstName) params.set("first_name", firstName);
    if (lastName) params.set("last_name", lastName);
    params.set("a1", notes);
    return baseUrl + "?" + params.toString();
  }

  function getFirstName(name) {
    return name.trim().split(/\s+/)[0] || "there";
  }

  function getRoutingMessages(answers, routing) {
    var fn = getFirstName(answers.name);
    if (routing === "currence") {
      return [
        "Thank you, " + fn + "! Based on what you've shared, I'd recommend starting with a <strong>Currence Onboarding Session</strong>.",
        "This session is designed to help you build a strong savings foundation — the first step toward creating generational wealth.",
        "Click below to book your session with Paul!",
      ];
    }
    return [
      "Excellent, " + fn + "! Based on your savings discipline and interest in wealth strategy, I'd recommend a <strong>60-Minute Strategy Session</strong> with Paul.",
      "In this session, Paul will dive deep into your financial situation and help you design a personalized family banking and wealth-building plan.",
      "Click below to book your session!",
    ];
  }

  // ═══════════════════════════════════════════════════════════
  // INJECT STYLES
  // ═══════════════════════════════════════════════════════════
  function injectStyles() {
    var css = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Source+Sans+3:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');

      #seitz-chatbot-widget *,
      #seitz-chatbot-widget *::before,
      #seitz-chatbot-widget *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      #seitz-chatbot-widget {
        --seitz-font-display: 'DM Serif Display', Georgia, serif;
        --seitz-font-body: 'Source Sans 3', system-ui, sans-serif;
        --seitz-maroon: oklch(0.35 0.12 15);
        --seitz-teal: oklch(0.52 0.10 190);
        --seitz-teal-dark: oklch(0.42 0.10 190);
        --seitz-gold: oklch(0.78 0.12 85);
        --seitz-gold-dark: oklch(0.68 0.14 70);
        --seitz-sand: oklch(0.98 0.01 80);
        --seitz-sand-border: oklch(0.88 0.03 80);
        --seitz-text: oklch(0.22 0.02 30);
        --seitz-text-muted: oklch(0.50 0.03 30);
        font-family: var(--seitz-font-body);
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999999;
        line-height: 1.5;
      }

      /* Trigger Button */
      .seitz-trigger-wrap {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .seitz-trigger-label {
        background: white;
        border-radius: 12px;
        padding: 10px 16px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        border: 1px solid oklch(0.88 0.03 80);
        font-family: var(--seitz-font-body);
        opacity: 0;
        transform: translateX(20px);
        transition: opacity 0.4s ease, transform 0.4s ease;
      }
      .seitz-trigger-label.visible {
        opacity: 1;
        transform: translateX(0);
      }
      .seitz-trigger-label p {
        font-size: 14px;
        font-weight: 500;
        color: var(--seitz-maroon);
        white-space: nowrap;
        margin: 0;
      }

      .seitz-trigger-btn {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--seitz-gold), var(--seitz-gold-dark));
        box-shadow: 0 8px 30px rgba(0,0,0,0.2);
        transition: transform 0.2s ease;
        animation: seitzPulse 3s ease-in-out infinite;
        flex-shrink: 0;
      }
      .seitz-trigger-btn:hover { transform: scale(1.05); }
      .seitz-trigger-btn:active { transform: scale(0.95); }
      .seitz-trigger-btn svg { width: 28px; height: 28px; color: white; }

      @keyframes seitzPulse {
        0%, 100% { box-shadow: 0 8px 30px rgba(0,0,0,0.2), 0 0 0 0 oklch(0.78 0.12 85 / 0.4); }
        50% { box-shadow: 0 8px 30px rgba(0,0,0,0.2), 0 0 0 12px oklch(0.78 0.12 85 / 0); }
      }

      /* Chat Window */
      .seitz-chat-window {
        width: 400px;
        max-width: calc(100vw - 2rem);
        height: min(640px, calc(100vh - 3rem));
        border-radius: 20px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 25px 60px -12px rgba(0,0,0,0.25), 0 0 0 1px oklch(0.88 0.03 80);
        opacity: 0;
        transform: translateY(40px) scale(0.92);
        transition: opacity 0.35s ease, transform 0.35s ease;
      }
      .seitz-chat-window.open {
        opacity: 1;
        transform: translateY(0) scale(1);
      }

      /* Header */
      .seitz-chat-header {
        position: relative;
        padding: 20px 20px 16px;
        flex-shrink: 0;
        background-size: cover;
        background-position: center;
      }
      .seitz-chat-header .seitz-close-btn {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: none;
        background: rgba(255,255,255,0.15);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }
      .seitz-chat-header .seitz-close-btn:hover { background: rgba(255,255,255,0.25); }
      .seitz-chat-header .seitz-close-btn svg { width: 16px; height: 16px; }

      .seitz-header-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .seitz-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        overflow: hidden;
        border: 2px solid rgba(255,255,255,0.3);
        flex-shrink: 0;
        background: rgba(255,255,255,0.1);
      }
      .seitz-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .seitz-header-text h3 {
        color: white;
        font-family: var(--seitz-font-display);
        font-size: 18px;
        line-height: 1.2;
        margin: 0;
        font-weight: 400;
      }
      .seitz-header-text p {
        color: rgba(255,255,255,0.7);
        font-size: 12px;
        margin: 2px 0 0;
        font-family: var(--seitz-font-body);
      }

      /* Progress Bar */
      .seitz-progress {
        display: flex;
        gap: 6px;
        margin-top: 16px;
      }
      .seitz-progress-dot {
        height: 4px;
        flex: 1;
        border-radius: 4px;
        transition: background 0.5s ease;
      }

      /* Messages */
      .seitz-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: white;
      }
      .seitz-messages::-webkit-scrollbar { width: 5px; }
      .seitz-messages::-webkit-scrollbar-track { background: transparent; }
      .seitz-messages::-webkit-scrollbar-thumb { background: oklch(0.80 0.03 80); border-radius: 10px; }

      .seitz-msg-row {
        display: flex;
        opacity: 0;
        transform: translateY(8px);
        animation: seitzFadeIn 0.3s ease forwards;
      }
      .seitz-msg-row.user { justify-content: flex-end; }
      .seitz-msg-row.bot { justify-content: flex-start; }

      @keyframes seitzFadeIn {
        to { opacity: 1; transform: translateY(0); }
      }

      .seitz-msg-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        overflow: hidden;
        flex-shrink: 0;
        margin-right: 8px;
        margin-top: 4px;
        border: 1px solid oklch(0.88 0.03 80);
      }
      .seitz-msg-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }

      .seitz-msg-bubble {
        max-width: 80%;
        padding: 10px 16px;
        font-size: 14px;
        line-height: 1.6;
        font-family: var(--seitz-font-body);
      }
      .seitz-msg-bubble.bot {
        background: var(--seitz-sand);
        color: var(--seitz-text);
        border-radius: 16px 16px 16px 6px;
        border: 1px solid oklch(0.92 0.02 80);
      }
      .seitz-msg-bubble.user {
        background: linear-gradient(135deg, var(--seitz-teal), var(--seitz-teal-dark));
        color: white;
        border-radius: 16px 16px 6px 16px;
      }

      /* Typing Indicator */
      .seitz-typing-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .seitz-typing-dots {
        background: white;
        border-radius: 16px 16px 16px 6px;
        padding: 12px 16px;
        display: flex;
        gap: 6px;
        border: 1px solid oklch(0.92 0.02 80);
      }
      .seitz-typing-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--seitz-teal);
        animation: seitzBounce 1.4s ease-in-out infinite;
      }
      .seitz-typing-dot:nth-child(2) { animation-delay: 0.2s; }
      .seitz-typing-dot:nth-child(3) { animation-delay: 0.4s; }

      @keyframes seitzBounce {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-4px); }
      }

      /* Input Area */
      .seitz-input-area {
        flex-shrink: 0;
        border-top: 1px solid oklch(0.90 0.02 80);
        padding: 12px 16px;
        background: white;
      }

      .seitz-text-input-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .seitz-input-field-wrap {
        flex: 1;
        position: relative;
      }
      .seitz-text-input {
        width: 100%;
        padding: 10px 16px;
        border-radius: 12px;
        font-size: 14px;
        border: 1px solid oklch(0.90 0.02 80);
        background: var(--seitz-sand);
        color: var(--seitz-text);
        font-family: var(--seitz-font-body);
        outline: none;
        transition: border-color 0.2s;
      }
      .seitz-text-input:focus {
        border-color: var(--seitz-teal);
        box-shadow: 0 0 0 3px oklch(0.52 0.10 190 / 0.15);
      }
      .seitz-text-input.error { border-color: oklch(0.577 0.245 27.325); }
      .seitz-input-suffix {
        position: absolute;
        right: 40px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 14px;
        color: var(--seitz-text-muted);
        font-family: var(--seitz-font-body);
      }
      .seitz-send-btn {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--seitz-teal), var(--seitz-teal-dark));
        transition: transform 0.2s;
        flex-shrink: 0;
      }
      .seitz-send-btn:hover { transform: scale(1.05); }
      .seitz-send-btn:active { transform: scale(0.95); }
      .seitz-send-btn svg { width: 16px; height: 16px; color: white; }

      .seitz-error-text {
        font-size: 12px;
        color: oklch(0.577 0.245 27.325);
        margin: 6px 0 0 4px;
        font-family: var(--seitz-font-body);
      }

      /* Select Options */
      .seitz-options { display: flex; flex-direction: column; gap: 8px; }
      .seitz-option-btn {
        width: 100%;
        text-align: left;
        padding: 10px 16px;
        border-radius: 12px;
        font-size: 14px;
        border: 1px solid oklch(0.88 0.03 80);
        background: var(--seitz-sand);
        color: oklch(0.30 0.02 30);
        font-family: var(--seitz-font-body);
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 8px;
        opacity: 0;
        transform: translateY(8px);
        animation: seitzFadeIn 0.25s ease forwards;
      }
      .seitz-option-btn:hover {
        border-color: var(--seitz-teal);
        background: oklch(0.96 0.02 190);
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      }
      .seitz-option-btn svg {
        width: 16px;
        height: 16px;
        color: var(--seitz-teal);
        flex-shrink: 0;
        transition: transform 0.2s;
      }
      .seitz-option-btn:hover svg { transform: translateX(2px); }

      /* Booking CTA */
      .seitz-booking { display: flex; flex-direction: column; gap: 12px; }
      .seitz-book-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 12px 20px;
        border-radius: 12px;
        border: none;
        font-size: 14px;
        font-weight: 600;
        font-family: var(--seitz-font-body);
        color: white;
        background: linear-gradient(135deg, var(--seitz-gold), var(--seitz-gold-dark));
        cursor: pointer;
        text-decoration: none;
        letter-spacing: 0.02em;
        transition: all 0.2s;
      }
      .seitz-book-btn:hover { transform: scale(1.02); box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
      .seitz-book-btn:active { transform: scale(0.98); }
      .seitz-book-btn svg { width: 20px; height: 20px; }

      .seitz-restart-btn {
        width: 100%;
        text-align: center;
        font-size: 12px;
        padding: 6px;
        border: none;
        background: transparent;
        color: var(--seitz-text-muted);
        font-family: var(--seitz-font-body);
        cursor: pointer;
        transition: color 0.2s;
      }
      .seitz-restart-btn:hover { text-decoration: underline; }

      .seitz-start-btn {
        width: 100%;
        padding: 12px 20px;
        border-radius: 12px;
        border: none;
        font-size: 14px;
        font-weight: 600;
        font-family: var(--seitz-font-body);
        color: white;
        background: linear-gradient(135deg, var(--seitz-teal), var(--seitz-teal-dark));
        cursor: pointer;
        transition: all 0.2s;
      }
      .seitz-start-btn:hover { transform: scale(1.02); }
      .seitz-start-btn:active { transform: scale(0.98); }

      /* Footer */
      .seitz-footer {
        text-align: center;
        padding: 6px 0 2px;
        background: white;
      }
      .seitz-footer span {
        font-size: 10px;
        color: oklch(0.70 0.02 80);
        font-family: var(--seitz-font-body);
      }

      /* Honeypot */
      .seitz-hp {
        position: absolute;
        left: -9999px;
        top: -9999px;
        width: 0;
        height: 0;
        overflow: hidden;
        opacity: 0;
        pointer-events: none;
      }

      /* Hidden state */
      .seitz-hidden { display: none !important; }
    `;
    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ═══════════════════════════════════════════════════════════
  // SVG ICONS
  // ═══════════════════════════════════════════════════════════
  var ICONS = {
    messageCircle: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>',
    x: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6l-12 12M6 6l12 12"/></svg>',
    send: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M11 13h7"/></svg>',
    calendar: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4M16 2v4M3 4h18v18H3Z"/><path d="M3 10h18"/></svg>',
    chevronRight: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
  };

  // ═══════════════════════════════════════════════════════════
  // WIDGET CLASS
  // ═══════════════════════════════════════════════════════════
  function SeitzChatbot() {
    this.isOpen = false;
    this.hasStarted = false;
    this.currentStep = "greeting";
    this.answers = { name: "", age: "", income: "", savingsRate: "", employmentType: "", investmentInterest: "", wealthManagement: "" };
    this.messages = [];
    this.isTyping = false;
    this.honeypot = "";
    this.isBotDetected = false;
    this.conversationStartTime = 0;
    this.inputValue = "";
    this.error = null;
    this.showInput = false;
    this.msgIdCounter = 0;
    this.animationQueue = [];
    this.isAnimating = false;

    this.init();
  }

  SeitzChatbot.prototype.init = function () {
    injectStyles();
    this.buildDOM();
    this.bindEvents();

    // Show trigger label after delay
    var self = this;
    setTimeout(function () {
      var label = self.root.querySelector(".seitz-trigger-label");
      if (label) label.classList.add("visible");
    }, CONFIG.triggerLabelDelay);
  };

  SeitzChatbot.prototype.buildDOM = function () {
    var root = document.createElement("div");
    root.id = "seitz-chatbot-widget";
    root.innerHTML = this.getTriggerHTML() + this.getChatWindowHTML();
    document.body.appendChild(root);
    this.root = root;
    this.triggerWrap = root.querySelector(".seitz-trigger-wrap");
    this.chatWindow = root.querySelector(".seitz-chat-window");
    this.messagesEl = root.querySelector(".seitz-messages");
    this.inputArea = root.querySelector(".seitz-input-area");
    this.inputEl = root.querySelector(".seitz-text-input");
    this.honeypotEl = root.querySelector(".seitz-hp input");
  };

  SeitzChatbot.prototype.getTriggerHTML = function () {
    return '<div class="seitz-trigger-wrap">' +
      '<div class="seitz-trigger-label"><p>Chat with us!</p></div>' +
      '<button class="seitz-trigger-btn" aria-label="Open chat">' + ICONS.messageCircle + '</button>' +
    '</div>';
  };

  SeitzChatbot.prototype.getChatWindowHTML = function () {
    return '<div class="seitz-chat-window seitz-hidden">' +
      '<div class="seitz-chat-header" style="background: linear-gradient(to bottom, oklch(0.35 0.12 15 / 0.92), oklch(0.42 0.10 190 / 0.88)), url(' + CONFIG.headerBg + '); background-size: cover; background-position: center;">' +
        '<button class="seitz-close-btn" aria-label="Close chat">' + ICONS.x + '</button>' +
        '<div class="seitz-header-info">' +
          '<div class="seitz-avatar"><img src="' + CONFIG.botAvatar + '" alt="The Seitz Foundation" /></div>' +
          '<div class="seitz-header-text"><h3>The Seitz Foundation</h3><p>Screening Assistant</p></div>' +
        '</div>' +
        '<div class="seitz-progress">' + this.getProgressHTML() + '</div>' +
      '</div>' +
      '<div class="seitz-messages"></div>' +
      '<div class="seitz-input-area"></div>' +
      '<div class="seitz-hp" aria-hidden="true"><label>Leave empty</label><input type="text" name="website_url" autocomplete="off" tabindex="-1" /></div>' +
      '<div class="seitz-footer"><span>The Seitz Foundation · Oahu, Hawaii</span></div>' +
    '</div>';
  };

  SeitzChatbot.prototype.getProgressHTML = function () {
    var html = "";
    var currentIdx = STEP_ORDER.indexOf(this.currentStep);
    for (var i = 0; i < STEP_ORDER.length; i++) {
      var bg;
      if (i < currentIdx) bg = "oklch(0.78 0.12 85)";
      else if (i === currentIdx) bg = "oklch(0.78 0.12 85 / 0.5)";
      else bg = "rgba(255,255,255,0.2)";
      html += '<div class="seitz-progress-dot" style="background:' + bg + '"></div>';
    }
    return html;
  };

  SeitzChatbot.prototype.updateProgress = function () {
    var dots = this.root.querySelectorAll(".seitz-progress-dot");
    var currentIdx = STEP_ORDER.indexOf(this.currentStep);
    if (currentIdx === -1) currentIdx = STEP_ORDER.length; // booking/routing = all complete
    for (var i = 0; i < dots.length; i++) {
      if (i < currentIdx) dots[i].style.background = "oklch(0.78 0.12 85)";
      else if (i === currentIdx) dots[i].style.background = "oklch(0.78 0.12 85 / 0.5)";
      else dots[i].style.background = "rgba(255,255,255,0.2)";
    }
  };

  SeitzChatbot.prototype.open = function () {
    this.isOpen = true;
    this.triggerWrap.classList.add("seitz-hidden");
    this.chatWindow.classList.remove("seitz-hidden");
    // Trigger animation on next frame
    var self = this;
    requestAnimationFrame(function () {
      self.chatWindow.classList.add("open");
    });

    if (!this.hasStarted) {
      this.hasStarted = true;
      this.conversationStartTime = Date.now();
      this.startConversation();
    }
  };

  SeitzChatbot.prototype.close = function () {
    this.isOpen = false;
    this.chatWindow.classList.remove("open");
    var self = this;
    setTimeout(function () {
      self.chatWindow.classList.add("seitz-hidden");
      self.triggerWrap.classList.remove("seitz-hidden");
    }, 350);
  };

  SeitzChatbot.prototype.bindEvents = function () {
    var self = this;
    this.root.querySelector(".seitz-trigger-btn").addEventListener("click", function () {
      var label = self.root.querySelector(".seitz-trigger-label");
      if (label) label.classList.remove("visible");
      self.open();
    });
    this.root.querySelector(".seitz-close-btn").addEventListener("click", function () {
      self.close();
    });
    // Monitor honeypot
    if (this.honeypotEl) {
      this.honeypotEl.addEventListener("input", function (e) {
        self.honeypot = e.target.value;
      });
    }
  };

  SeitzChatbot.prototype.startConversation = function () {
    var self = this;
    var step = STEPS.greeting;
    this.addBotMessages(step.botMessages, function () {
      self.currentStep = "name";
      self.updateProgress();
      var nameStep = STEPS.name;
      self.addBotMessages(nameStep.botMessages, function () {
        self.showInput = true;
        self.renderInput();
      });
    });
  };

  SeitzChatbot.prototype.addBotMessages = function (texts, onComplete) {
    var self = this;
    var i = 0;

    function next() {
      if (i >= texts.length) {
        if (onComplete) onComplete();
        return;
      }
      self.showTyping();
      var delay = 600 + texts[i].length * 8;
      setTimeout(function () {
        self.hideTyping();
        self.addMessage("bot", texts[i]);
        i++;
        if (i < texts.length) {
          setTimeout(next, 300);
        } else {
          if (onComplete) onComplete();
        }
      }, delay);
    }
    next();
  };

  SeitzChatbot.prototype.addMessage = function (type, text) {
    this.msgIdCounter++;
    this.messages.push({ id: this.msgIdCounter, type: type, text: text });

    var row = document.createElement("div");
    row.className = "seitz-msg-row " + type;
    row.style.animationDelay = "0s";

    var html = "";
    if (type === "bot") {
      html += '<div class="seitz-msg-avatar"><img src="' + CONFIG.botAvatar + '" alt="" /></div>';
    }
    html += '<div class="seitz-msg-bubble ' + type + '">' + text + '</div>';
    row.innerHTML = html;
    this.messagesEl.appendChild(row);
    this.scrollToBottom();
  };

  SeitzChatbot.prototype.showTyping = function () {
    this.isTyping = true;
    var el = document.createElement("div");
    el.className = "seitz-typing-row";
    el.id = "seitz-typing";
    el.innerHTML = '<div class="seitz-msg-avatar"><img src="' + CONFIG.botAvatar + '" alt="" /></div>' +
      '<div class="seitz-typing-dots"><span class="seitz-typing-dot"></span><span class="seitz-typing-dot"></span><span class="seitz-typing-dot"></span></div>';
    this.messagesEl.appendChild(el);
    this.scrollToBottom();
  };

  SeitzChatbot.prototype.hideTyping = function () {
    this.isTyping = false;
    var el = document.getElementById("seitz-typing");
    if (el) el.remove();
  };

  SeitzChatbot.prototype.scrollToBottom = function () {
    var self = this;
    requestAnimationFrame(function () {
      self.messagesEl.scrollTop = self.messagesEl.scrollHeight;
    });
  };

  SeitzChatbot.prototype.renderInput = function () {
    var step = STEPS[this.currentStep];
    if (!step) { this.inputArea.innerHTML = ""; return; }

    var self = this;
    var html = "";

    if (step.inputType === "text" || step.inputType === "number") {
      html = '<div class="seitz-text-input-wrap">' +
        '<div class="seitz-input-field-wrap">' +
          '<input class="seitz-text-input" type="' + (step.inputType === "number" ? "number" : "text") + '" placeholder="' + (step.placeholder || "") + '" />' +
          (step.suffix ? '<span class="seitz-input-suffix">' + step.suffix + '</span>' : '') +
        '</div>' +
        '<button class="seitz-send-btn">' + ICONS.send + '</button>' +
      '</div>' +
      '<div class="seitz-error-text seitz-hidden"></div>';
    } else if (step.inputType === "select") {
      html = '<div class="seitz-options">';
      step.options.forEach(function (opt, i) {
        html += '<button class="seitz-option-btn" data-value="' + self.escapeAttr(opt.value) + '" data-label="' + self.escapeAttr(opt.label) + '" style="animation-delay:' + (i * 0.08) + 's">' +
          ICONS.chevronRight + '<span>' + opt.label + '</span></button>';
      });
      html += '</div>';
    } else if (step.inputType === "info" && this.currentStep === "greeting") {
      html = '<button class="seitz-start-btn">Let\'s Get Started</button>';
    }

    // Booking CTA
    if (this.currentStep === "booking" && !this.isBotDetected) {
      var routing = getRouting(this.answers);
      var url = buildCalendlyUrl(this.answers, routing);
      var label = routing === "currence" ? "Book Currence Onboarding Session" : "Book 60-Minute Strategy Session";
      html = '<div class="seitz-booking">' +
        '<a class="seitz-book-btn" href="' + url + '" target="_blank" rel="noopener noreferrer">' + ICONS.calendar + ' ' + label + '</a>' +
        '<button class="seitz-restart-btn">Start over</button>' +
      '</div>';
    }

    this.inputArea.innerHTML = html;

    // Bind events
    var input = this.inputArea.querySelector(".seitz-text-input");
    if (input) {
      input.focus();
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          self.handleSubmitText();
        }
      });
    }
    var sendBtn = this.inputArea.querySelector(".seitz-send-btn");
    if (sendBtn) {
      sendBtn.addEventListener("click", function () { self.handleSubmitText(); });
    }
    var optionBtns = this.inputArea.querySelectorAll(".seitz-option-btn");
    optionBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        self.handleSelectOption(btn.dataset.value, btn.dataset.label);
      });
    });
    var startBtn = this.inputArea.querySelector(".seitz-start-btn");
    if (startBtn) {
      startBtn.addEventListener("click", function () { self.advanceToGreeting(); });
    }
    var restartBtn = this.inputArea.querySelector(".seitz-restart-btn");
    if (restartBtn) {
      restartBtn.addEventListener("click", function () { self.handleRestart(); });
    }
  };

  SeitzChatbot.prototype.handleSubmitText = function () {
    var input = this.inputArea.querySelector(".seitz-text-input");
    if (!input) return;
    var value = input.value.trim();
    if (!value) return;

    var step = STEPS[this.currentStep];
    if (!step) return;

    if (step.validate) {
      var err = step.validate(value);
      if (err) {
        this.showError(err);
        return;
      }
    }

    this.clearError();
    var displayValue = step.suffix ? value + step.suffix : value;
    this.addMessage("user", displayValue);

    if (this.currentStep === "name") this.answers.name = value;
    else if (this.currentStep === "age") this.answers.age = value;
    else if (this.currentStep === "savingsRate") this.answers.savingsRate = value;

    var nextStepId = step.nextStep(value);
    this.advanceToStep(nextStepId);
  };

  SeitzChatbot.prototype.handleSelectOption = function (value, label) {
    this.clearError();
    this.addMessage("user", label);

    if (this.currentStep === "income") this.answers.income = value;
    else if (this.currentStep === "employmentType") this.answers.employmentType = value;
    else if (this.currentStep === "investmentInterest") this.answers.investmentInterest = value;
    else if (this.currentStep === "wealthManagement") this.answers.wealthManagement = value;

    var step = STEPS[this.currentStep];
    if (!step) return;
    var nextStepId = step.nextStep(value);
    this.advanceToStep(nextStepId);
  };

  SeitzChatbot.prototype.advanceToGreeting = function () {
    this.currentStep = "name";
    this.updateProgress();
    var self = this;
    var nameStep = STEPS.name;
    this.addBotMessages(nameStep.botMessages, function () {
      self.showInput = true;
      self.renderInput();
    });
  };

  SeitzChatbot.prototype.advanceToStep = function (stepId) {
    this.currentStep = stepId;
    this.updateProgress();
    this.inputArea.innerHTML = "";
    var self = this;

    if (stepId === "age") {
      var msgs = ["Nice to meet you, " + getFirstName(this.answers.name) + "! How old are you?"];
      this.addBotMessages(msgs, function () {
        self.showInput = true;
        self.renderInput();
      });
    } else if (stepId === "routing") {
      // Bot detection check
      var elapsedSec = (Date.now() - this.conversationStartTime) / 1000;
      if (this.honeypot || elapsedSec < CONFIG.minHumanDurationSec) {
        this.isBotDetected = true;
        this.addBotMessages(
          ["We're sorry, but we weren't able to verify this session. Please refresh the page and try again, or contact us directly."],
          function () { self.inputArea.innerHTML = ""; }
        );
        return;
      }

      var routing = getRouting(this.answers);
      var msgs = getRoutingMessages(this.answers, routing);
      this.addBotMessages(msgs, function () {
        self.currentStep = "booking";
        self.updateProgress();
        self.showInput = true;
        self.renderInput();
      });
    } else {
      var step = STEPS[stepId];
      if (step && step.botMessages.length > 0) {
        this.addBotMessages(step.botMessages, function () {
          self.showInput = true;
          self.renderInput();
        });
      } else {
        this.showInput = true;
        this.renderInput();
      }
    }
  };

  SeitzChatbot.prototype.handleRestart = function () {
    this.messages = [];
    this.messagesEl.innerHTML = "";
    this.currentStep = "greeting";
    this.answers = { name: "", age: "", income: "", savingsRate: "", employmentType: "", investmentInterest: "", wealthManagement: "" };
    this.inputValue = "";
    this.error = null;
    this.showInput = false;
    this.hasStarted = false;
    this.honeypot = "";
    this.isBotDetected = false;
    this.conversationStartTime = 0;
    this.inputArea.innerHTML = "";
    this.updateProgress();
    // Restart
    this.hasStarted = true;
    this.conversationStartTime = Date.now();
    this.startConversation();
  };

  SeitzChatbot.prototype.showError = function (msg) {
    var el = this.inputArea.querySelector(".seitz-error-text");
    if (el) {
      el.textContent = msg;
      el.classList.remove("seitz-hidden");
    }
    var input = this.inputArea.querySelector(".seitz-text-input");
    if (input) input.classList.add("error");
  };

  SeitzChatbot.prototype.clearError = function () {
    var el = this.inputArea.querySelector(".seitz-error-text");
    if (el) el.classList.add("seitz-hidden");
    var input = this.inputArea.querySelector(".seitz-text-input");
    if (input) input.classList.remove("error");
  };

  SeitzChatbot.prototype.escapeAttr = function (str) {
    return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  };

  // ════════════════════════════════════════════��══════════════
  // INITIALIZE
  // ═══════════════════════════════════════════════════════════
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { new SeitzChatbot(); });
  } else {
    new SeitzChatbot();
  }
})();
