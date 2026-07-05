# 🚀 Next-Gen Personal Finance Tracker & Autonomous AI Advisor
### An Enterprise-Grade Wealth Management Ecosystem with Omnichannel WhatsApp Integration & Multi-LLM Load Balancing

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-7.8-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![OpenAI Function Calling](https://img.shields.io/badge/AI_Agent-15+_Tools-FF6F00?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![WhatsApp Bot](https://img.shields.io/badge/WhatsApp_Gateway-Baileys-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://github.com/WhiskeySockets/Baileys)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

---

## 🌟 Overview

**Personal Finance Tracker** is not just a standard expense tracking tool—it is a full-fledged **Autonomous Financial Ecosystem** designed to showcase modern software engineering practices, Clean Architecture, advanced Large Language Model (LLM) orchestration, and seamless omnichannel integrations.

Built from the ground up to solve real-world personal finance friction, this platform allows users to manage multiple bank accounts, e-wallets, budgets, savings goals, and automated payday allocation routines through an intuitive React frontend or **conversational natural language via WhatsApp**. Powered by a modular AI engine with 15+ tool definitions, the assistant acts as a proactive 24/7 financial advisor—recording transactions, scanning physical shopping receipts via Multimodal Vision AI, auditing cash flows, and issuing automated budget warnings.

---

## 🔥 Key Architectural Innovations & Features

### 🤖 1. Autonomous AI Financial Advisor (15+ Tool Schema Engine)
Unlike traditional chatbots that only generate text summaries, this system implements **OpenAI Function Calling & Tool Orchestration** to autonomously interact with the relational database:
- **Natural Language CRUD**: Simply type *"Spent 25k on lunch using Gopay"* or *"Move 1 million from BCA to Bibit"*—the AI understands context, validates account balances, maps UUIDs, and executes database mutations in real time.
- **Multimodal Receipt OCR Scanning**: Upload physical shopping receipts or bills via web or WhatsApp. The AI vision model extracts line items, calculates totals, identifies vendor categories, and prompts for confirmation before recording.
- **Proactive Budget Guardrails**: Automatically evaluates category budget utilization on every transaction. If spending exceeds 70% of the monthly limit, the AI issues real-time warnings to prevent overspending.
- **Anti-Hallucination & Truth Enforcement**: Hardcoded architectural constraints prevent the AI from guessing account balances or claiming transactions are recorded without executing verified database transactions.

### ⚡ 2. Multi-Provider AI Load Balancer & Failover Pool
To guarantee 99.9% uptime and zero API rate-limit bottlenecks (HTTP 429), the backend features a custom-built **Smart Load Balancing Engine (`ai.providers.ts`)**:
- **Automatic Round-Robin & Failover**: Seamlessly cycles across multiple free and enterprise API providers:
  - **Google Gemini Studio** (`gemini-2.5-flash`, `gemini-2.0-flash`) — Generous 1,500 requests/day per key.
  - **Cerebras Cloud** (`llama-3.3-70b`) — Ultra-low latency inference at **2,000 tokens/second**.
  - **Groq Cloud** (`llama-3.3-70b-versatile`, `llama-3.2-90b-vision`) — High-speed processing.
  - **OpenRouter** (`nvidia/nemotron-3-nano-30b-a3b:free`, `qwen-2.5-coder`) — Curated fallback models.
- **Dynamic Key Collector**: Supports both comma-separated key lists and indexed environment variables (`GEMINI_API_KEY_1`, `GEMINI_API_KEY_2`, etc.), automatically catching configuration typos and aggregating pools without requiring manual model variable selection.

### 📱 3. Omnichannel WhatsApp Bot Gateway
A dedicated WhatsApp Gateway built using `Baileys` bridges messaging with the serverless API:
- **Real-Time Webhook Sync**: Forwards incoming WhatsApp messages and receipt images to the backend with secure authorization tokens (`VERCEL_SECRET_TOKEN`).
- **Formatted WhatsApp Receipts**: Outputs beautifully formatted transaction confirmations using native WhatsApp styling (bold asterisks, structured summaries, and clean emojis).
- **Multi-User Phone Mapping**: Links WhatsApp phone numbers to authenticated user accounts for personalized, multi-tenant financial management.

### 🏦 4. Enterprise Wealth & Cashflow Management
- **Multi-Wallet & Payment Methods**: Track liquid cash, bank accounts (BCA, Mandiri), e-wallets (Gopay, OVO, Dana), and investment portfolios in one unified dashboard.
- **1-Click Payday Allocation Routines (`AllocationRoutine`)**: Automate complex salary distributions. Define multiple transfer legs (e.g., *60% Living Expenses, 20% Savings, 20% Investments*) and execute them all simultaneously inside a single database transaction.
- **Recurring Transactions Scheduler (`RecurringTransaction`)**: Set up automated daily, weekly, monthly, or yearly schedules for fixed utility bills, subscriptions, and payrolls.
- **Dream Savings Goals (`SavingsGoal`)**: Visual progress trackers for long-term financial milestones with target deadlines and dedicated goal accounts.

### 📊 5. Advanced Interactive Analytics
- **Dynamic Charting**: Built with `Recharts` to provide visual breakdowns of monthly cash flows, net savings trajectories, and expense distribution by category.
- **Historical Trend Analysis**: Multi-month comparative aggregations evaluating spending velocity and income stability.

---

## 🛠️ Technology Stack

| Layer | Technologies & Frameworks |
| :--- | :--- |
| **Frontend** | React 19, TypeScript 5.7, Vite 6, Tailwind CSS 4.0, React Router DOM 7, Recharts, Lucide Icons, Axios |
| **Backend API** | Node.js 22.x, Express 4.x, TypeScript, Zod (Schema Validation), JSON Web Tokens (JWT), Bcrypt.js |
| **Database & ORM** | PostgreSQL 16+, Prisma ORM 7.8 (Type-Safe Client & Migrations), Supabase / Neon Compatible |
| **AI & Machine Learning** | OpenAI SDK, Google Gemini API, Cerebras Cloud API, Groq SDK, OpenRouter API, Multimodal Vision OCR |
| **Integrations & DevOps** | Baileys (WhatsApp Web Socket Gateway), Vercel Serverless Functions, Git, ESLint |

---

## 🏛️ System Architecture & Modular Design

The backend codebase adheres to **Clean Architecture** and **SOLID Principles**, ensuring scalability and maintainability. The AI engine is structured into focused, single-responsibility modules:

```text
personal-finance-tracker/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Relational database schema (7 core entities)
│   │   └── migrations/          # Version-controlled SQL database migrations
│   ├── src/
│   │   ├── controllers/         # HTTP request handlers & business logic
│   │   ├── routes/              # REST API endpoint definitions
│   │   ├── lib/                 # Prisma database client & JWT utilities
│   │   ├── middlewares/         # Authentication guard & error interceptors
│   │   ├── services/
│   │   │   ├── ai.service.ts    # Main AI entry point (~150 lines clean orchestrator)
│   │   │   └── ai/              # Modular AI Engine Core:
│   │   │       ├── ai.providers.ts  # Multi-provider load balancer & key aggregator
│   │   │       ├── ai.schemas.ts    # OpenAI Tool JSON function definitions (15+ tools)
│   │   │       ├── ai.executor.ts   # Database transaction execution handler
│   │   │       └── ai.prompt.ts     # System instructions & WhatsApp formatting rules
│   │   └── server.ts            # Express server initialization
├── frontend/                    # SPA Vite React TypeScript client
├── whatsapp-bot/                # Baileys WhatsApp webhook server
└── README.md                    # Project documentation
```

---

## 🗄️ Database Schema & Entity Relationships

The relational model is designed for multi-tenant isolation and strict data integrity:

```mermaid
erDiagram
    User ||--o{ Account : owns
    User ||--o{ Category : manages
    User ||--o{ Transaction : records
    User ||--o{ Budget : sets
    User ||--o{ SavingsGoal : targets
    User ||--o{ AllocationRoutine : defines
    User ||--o{ RecurringTransaction : schedules

    Account ||--o{ Transaction : "from account"
    Account ||--o{ Transaction : "to account (transfer)"
    Category ||--o{ Transaction : categorizes
    Category ||--o{ Budget : constrains
    Category ||--o{ RecurringTransaction : templates
    Account ||--o{ RecurringTransaction : templates
```

### Core Entities:
1. **`User`**: Secure authentication credentials, hashed passwords, and profile settings.
2. **`Account`**: Financial wallets (Bank, E-Wallet, Cash, Investment, Goal) with real-time balance computation.
3. **`Category`**: Income and expense classifications with duplicate name protection per user.
4. **`Transaction`**: Immutable ledger records supporting `income`, `expense`, and inter-account `transfer` types.
5. **`Budget`**: Monthly spending ceilings per category with dynamic usage computation.
6. **`SavingsGoal`**: Dedicated savings milestones linked to specialized goal accounts.
7. **`AllocationRoutine`**: Payday distribution templates containing multiple transfer items executed via database transactions.
8. **`RecurringTransaction`**: Automated schedule definitions for recurring billing cycles.

---

## 🔌 Comprehensive API Reference

### 🔐 Authentication & Users
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new user account | ❌ |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | ❌ |
| `GET` | `/api/auth/me` | Get current authenticated user profile | ✅ |

### 🤖 AI Financial Advisor & WhatsApp Gateway
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/ai/chat` | Send prompt/image to AI Advisor (supports Vision OCR) | ✅ |
| `POST` | `/api/ai/whatsapp` | Serverless Webhook for WhatsApp Gateway integration | 🔐 *(Secret Token)* |

### 💳 Accounts & Wallets
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/accounts` | Get all payment methods & real-time balances | ✅ |
| `POST` | `/api/accounts` | Create a new account / wallet | ✅ |
| `PUT` | `/api/accounts/:id` | Update account details | ✅ |
| `DELETE` | `/api/accounts/:id` | Soft/Hard delete account | ✅ |

### 🏷️ Categories & Budgets
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/categories` | List all income & expense categories | ✅ |
| `POST` | `/api/categories` | Create new category | ✅ |
| `GET` | `/api/budgets` | Get monthly budget allocations & % status | ✅ |
| `POST` | `/api/budgets` | Set or update monthly budget ceiling (`upsert`) | ✅ |

### 💸 Transactions & Payday Routines
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/transactions` | Filtered transaction history (by month, type, search) | ✅ |
| `POST` | `/api/transactions` | Record new transaction or inter-account transfer | ✅ |
| `DELETE` | `/api/transactions/:id` | Delete transaction record | ✅ |
| `GET` | `/api/routines` | Get 1-click payday allocation routines | ✅ |
| `POST` | `/api/routines/:id/execute` | Execute all routine transfers in a database transaction | ✅ |

---

## ⚡ Getting Started & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: v14.0 or higher (or cloud instance like Supabase / Neon)
- **Git**: Latest version

### 1. Clone the Repository
```bash
git clone https://github.com/NaqibZuhair/personal-finance-tracker.git
cd personal-finance-tracker
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/personal_finance_tracker?schema=public"
JWT_SECRET="your_super_secret_jwt_key_32_characters"
FRONTEND_URL="http://localhost:5173"

# --- AI LOAD BALANCER & FAILOVER POOL ---
# Simply provide your API keys (supports comma-separated lists or _1, _2 indexed variables)
GEMINI_API_KEYS="AIzaSyKey1...,AIzaSyKey2..."
OPENROUTER_API_KEYS="sk-or-v1-Key1...,sk-or-v1-Key2..."
CEREBRAS_API_KEYS="csk-Key1..."
GROQ_API_KEYS="gsk_Key1..."

# --- WHATSAPP GATEWAY INTEGRATION ---
WA_GATEWAY_URL="http://localhost:3000"
VERCEL_SECRET_TOKEN="your_whatsapp_secret_verification_token"
```

Run database migrations and generate Prisma Client:
```bash
npx prisma migrate dev
npx prisma generate
```

Start the backend server:
```bash
npm run dev
# Server running at http://localhost:5000
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_BASE_URL="http://localhost:5000/api"
```

Start the React Vite development server:
```bash
npm run dev
# Web application running at http://localhost:5173
```

---

## 🌐 Production Deployment Guide (Vercel)

This application is fully optimized for serverless deployment on **Vercel**:
1. Connect your GitHub repository to Vercel.
2. In **Project Settings > Environment Variables**, add:
   - `DATABASE_URL` (Your production Supabase/Neon PostgreSQL connection string)
   - `JWT_SECRET`
   - `GEMINI_API_KEYS`, `OPENROUTER_API_KEYS`, `CEREBRAS_API_KEYS`
   - `VERCEL_SECRET_TOKEN`
3. Vercel automatically detects `vercel.json` in the root and builds both the React frontend and serverless API endpoints.
4. **Note on AI Models**: You do **not** need to set `AI_MODEL` or `GEMINI_MODEL` variables in production; model curation (Nvidia Nemotron, Gemini 2.5 Flash, Cerebras Llama 3.3) is handled automatically inside code.

---

## 🗺️ Roadmap & Future Vision

We are actively developing future enhancements outlined in `MASTER_ROADMAP.md`:
- [ ] **Phase 2: Docker & Containerization**: Full multi-container orchestration (`docker-compose`) for one-click local deployments.
- [ ] **Phase 3: Live Bank API & Open Banking**: Real-time synchronization with BCA, Mandiri, and Jenius via Mutasi/Open Banking APIs.
- [ ] **Phase 4: Advanced Double-Entry Accounting Ledger**: Complex debits, credits, balance sheets, and trial balances for professional accountants.
- [ ] **Phase 5: Multi-Currency & Investment Portfolio Tracker**: Real-time stock, mutual fund, and cryptocurrency valuation tracking with automatic FX conversion.

---

## 👨‍💻 Author & Portfolio Value

**Naqib Zuhair**  
*Full-Stack & AI Systems Developer*

This project serves as a cornerstone engineering portfolio demonstrating expertise in:
- Complex full-stack web application architecture & serverless API design.
- Advanced Large Language Model (LLM) orchestration, tool schemas, and multi-provider failover engineering.
- Relational database modeling, transactional integrity, and Prisma ORM optimization.
- Secure multi-tenant authentication, data isolation, and omnichannel webhook integrations.

---

### 📝 License
This project is licensed under the **MIT License**. Feel free to use, fork, and learn from this ecosystem!