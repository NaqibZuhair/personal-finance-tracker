# 🤖 AI HANDOVER & ARCHITECTURAL CONTEXT (READ FIRST!)
**Project Name**: Personal Finance Tracker (Next-Gen Autonomous Financial Ecosystem)  
**Lead Developer & Owner**: Naqib Zuhair  
**Current Date/Version**: July 2026 / Phase 1 Complete (Moving to Master Roadmap Execution)  

> **TO THE NEXT AI ASSISTANT / DEVELOPER**:  
> Welcome! You are continuing work on a highly polished, enterprise-grade full-stack wealth management platform. The previous engineering session established strict Clean Architecture standards, multi-provider AI failover systems, omnichannel WhatsApp integration, and a stunning React frontend.  
> Before writing any code or executing tasks from `MASTER_ROADMAP.md`, **YOU MUST READ AND ADHERE TO THE 5 MANDATORY RULES BELOW.**

---

## 🛑 MANDATORY ENGINEERING & STYLE RULES

### 1. NO GOD FILES — STRICT CLEAN ARCHITECTURE & MODULARITY
- **Rule**: Never create monolithic files exceeding 300–400 lines. 
- **Standard**: If you are adding new features (e.g., Bank APIs, Double-Entry Accounting, Multi-Currency), break them down into focused, modular files by responsibility (e.g., `.routes.ts`, `.controller.ts`, `.service.ts`, `.schemas.ts`, `.executor.ts`).
- **Proof of Concept**: Look at `backend/src/services/ai/`. We refactored a 1,144-line monolith into 5 clean, single-responsibility files (`ai.providers.ts`, `ai.schemas.ts`, `ai.executor.ts`, `ai.prompt.ts`, `ai.service.ts`). You must maintain this exact standard of craftsmanship.

### 2. NO SPAMMY / UNNECESSARY AI COMMENTS
- **Rule**: Do NOT write conversational, repetitive, or obvious AI comments in code such as:
  - ❌ `// Ini adalah fungsi untuk menghitung total`
  - ❌ `// Modified by AI to fix bug`
  - ❌ `// Start of new feature implementation`
- **Standard**: Write clean, expressive, self-documenting TypeScript code. Only include professional JSDoc / TSDoc comments when explaining complex algorithms, regex, or non-obvious business logic.

### 3. FRONTEND DESIGN SYSTEM & VISUAL EXCELLENCE (UI/UX)
- **Rule**: Maintain 100% visual consistency with the existing React + Vite + Tailwind CSS 4 frontend. Do NOT introduce random color schemes, mismatched fonts, or clunky layouts.
- **Color Tokens**:
  - **Income / Success**: Green / Emerald (`emerald-500`, `bg-emerald-500/10`)
  - **Expense / Warning / Delete**: Red / Rose (`rose-500`, `bg-rose-500/10`)
  - **Transfers / Goals / Tech**: Blue / Indigo / Violet (`indigo-500`, `bg-indigo-500/10`)
- **Aesthetics**: Use modern cards with subtle glassmorphism, clean border contrasts (`border-slate-800/60`), smooth gradients, and interactive hover micro-animations (`hover:scale-[1.02] transition-all`).
- **Typography & Spacing**: Keep styling standardized using Tailwind utilities (`rounded-xl`, `p-6`, `shadow-xl`, `gap-4`).

### 4. SECURITY & MULTI-TENANT ROW-LEVEL ISOLATION
- **Rule**: This is a multi-user ecosystem with JWT authentication. Every Prisma database query MUST be scoped to the authenticated user:
  ```typescript
  // YES (Secure):
  await prisma.transaction.findMany({ where: { userId: req.user.id, ...filters } });
  
  // NO (Insecure - Data Leakage!):
  await prisma.transaction.findMany({ where: { ...filters } });
  ```
- **Rule**: Never log sensitive secrets, API keys (`GEMINI_API_KEYS`, `OPENROUTER_API_KEYS`), or JWT tokens to the console or terminal.

### 5. WHATSAPP GATEWAY & AI BOT PROTOCOLS
- **WhatsApp Bold Text**: WhatsApp does NOT read double asterisks (`**bold**`). You MUST use single asterisks (`*bold*`) across all WhatsApp reply generators and AI system instructions.
- **Anti-Alay Emojis**: The AI assistant must use emojis minimally and professionally (max 1–2 per message). No emoji spamming.
- **Truth Enforcement**: The AI must never claim a transaction is recorded unless the database function `record_transaction` returns success.

---

## 🗺️ MASTER ROADMAP EXECUTION GUIDELINES

When Naqib asks you to execute the next phases from `MASTER_ROADMAP.md`:
1. **Phase 2 (Docker & DevOps)**: Ensure clean `Dockerfile` and `docker-compose.yml` configurations with proper multi-stage builds and environment variable injections.
2. **Phase 3 (Live Bank APIs & Open Banking)**: Build modular bank sync adapters inside `backend/src/services/banking/` to keep external integrations isolated from core ledger logic.
3. **Phase 4 (Double-Entry Accounting)**: Ensure general ledger entries (Debits & Credits) balance perfectly inside atomic Prisma transactions (`prisma.$transaction`).
4. **Phase 5 (Multi-Currency & Investments)**: Store FX exchange rates cleanly and build intuitive UI selectors with real-time portfolio valuation charts in Recharts.

---
*Good luck! Keep the code clean, secure, and visually stunning. Make Naqib proud!* 🚀🔥💯
