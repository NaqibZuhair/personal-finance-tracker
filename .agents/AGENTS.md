# 🤖 AGENT BEHAVIORAL RULES & PROJECT ARCHITECTURE GUIDELINES
**Project**: Personal Finance Tracker (Next-Gen Autonomous Financial Ecosystem)  
**Owner**: Naqib Zuhair  

As an AI coding assistant working on this repository, you MUST strictly adhere to the following architectural, coding, and stylistic constraints. Failure to follow these rules violates project standards.

---

## 🏛️ 1. ARCHITECTURE & MODULARITY (CLEAN ARCHITECTURE)
- **NO GOD FILES / MONOLITHS**: Never create or allow files to grow beyond 300–400 lines of code. If a service, controller, or component becomes large, you MUST refactor and split it into modular, single-responsibility files.
  - *Example Standard*: The AI engine in `backend/src/services/ai/` is cleanly divided into `ai.providers.ts` (load balancer), `ai.schemas.ts` (15+ OpenAI tools), `ai.executor.ts` (database queries), and `ai.prompt.ts` (system instructions). Follow this modular pattern for all future features!
- **SOLID Principles**: Ensure separation of concerns across Routes, Controllers, Services, and Database layers.

---

## 🚫 2. CODE STYLE & NO AI SPAM COMMENTS
- **CLEAN, SELF-DOCUMENTING CODE**: Do NOT clutter code with redundant, conversational, or obvious AI comments (e.g., `// Ini fungsi untuk mengambil data`, `// Ditambahkan oleh AI pada tanggal X`, `// Start of modification`).
- **Minimal Professional Comments**: Only write meaningful JSDoc / TSDoc comments for complex business logic, architectural decisions, or regex explanations.
- **TypeScript Strictness**: Maintain proper typing; avoid explicit `any` where interfaces or Zod schemas can be defined.

---

## 🎨 3. FRONTEND UI & DESIGN SYSTEM CONSISTENCY
When building or modifying React Vite Tailwind components in `frontend/`:
- **Visual Excellence & Premium Aesthetics**: Maintain the stunning, modern UI design established in the project (vibrant harmonious color palettes, sleek dark/light mode contrast, subtle glassmorphism, and smooth hover micro-animations).
- **Consistent Color Semantics**:
  - Income / Positive: Emerald / Green (`text-emerald-500`, `bg-emerald-500/10`)
  - Expense / Negative / Delete: Rose / Red (`text-rose-500`, `bg-rose-500/10`)
  - Transfers / Goals / Analytics: Indigo / Blue / Violet (`text-indigo-500`, `bg-blue-500/10`)
- **Typography & Spacing**: Follow existing Tailwind sizing tokens (`p-4`, `p-6`, `rounded-xl`, `rounded-2xl`, `shadow-md`, `shadow-xl`, `gap-4`). Do NOT introduce random, clashing font families or ad-hoc spacing that breaks visual harmony.
- **Interactive Micro-Animations**: Use smooth transitions (`transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`) for interactive cards and buttons.

---

## 🔒 4. SECURITY & MULTI-TENANT DATA ISOLATION
- **Strict User Isolation**: Every database query in Prisma MUST include `where: { userId }` (or check ownership) to ensure strict multi-tenant row-level security. Never leak data between authenticated users!
- **Secret Protection**: Never print, log, or commit `.env` secrets, API keys, or JWT tokens.

---

## 📱 5. WHATSAPP GATEWAY & AI BOT RULES
- **WhatsApp Bold Formatting**: WhatsApp does NOT render Markdown double asterisks (`**bold**`). Always use SINGLE asterisks (`*bold*`) for bold text in WhatsApp message templates and system instructions.
- **Professional Emoji Usage**: Keep AI assistant emojis minimal and professional (maximum 1–2 emojis per message). Do NOT use excessive, spammy, or "alay" emoji strings.
- **No False Transaction Claims**: The AI must NEVER claim a transaction is recorded unless it has successfully executed the `record_transaction` database tool.

---

## 🗺️ 6. EXECUTING THE MASTER ROADMAP
When instructed to execute tasks from `MASTER_ROADMAP.md` (e.g., Phase 2 Docker, Phase 3 Live Bank APIs, Phase 4 Double-Entry Ledger, Phase 5 Multi-Currency):
1. Read `MASTER_ROADMAP.md` and understand the specific architectural requirements for that phase.
2. Design database schema additions cleanly in `prisma/schema.prisma` and create proper migrations (`npx prisma migrate dev`).
3. Build comprehensive frontend UI components that seamlessly integrate with the existing dashboard and navigation.
