# Personal Finance Tracker

Personal Finance Tracker is a full-stack web application for recording income and expenses, managing transaction categories, monitoring monthly cash flow, and generating simple spending insights.

This project is built as a portfolio project to demonstrate full-stack development, REST API design, relational database modeling, CRUD operations, filtering, validation, and dashboard-style financial summaries.

## Features

### Category Management

- View income and expense categories
- Add new category
- Edit existing category
- Delete category
- Prevent deleting categories that are already used by transactions
- Validate duplicate category names by type

### Transaction Management

- View all transactions in a clean table
- Add income or expense transaction
- Edit transaction
- Delete transaction
- Filter transactions by:
  - type
  - category
  - month
  - description keyword
- Validate transaction data before saving

### Dashboard

- View monthly income
- View monthly expense
- View monthly balance
- View monthly transaction count
- View expense summary by category
- View recent transactions

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS

### Backend

- Node.js
- Express
- TypeScript
- Zod
- Prisma ORM

### Database

- PostgreSQL

### Development Tools

- Git
- ESLint
- Prisma Studio

## Project Structure

```txt
personal-finance-tracker/
├─ frontend/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ lib/
│  │  ├─ pages/
│  │  ├─ types/
│  │  ├─ utils/
│  │  ├─ App.tsx
│  │  └─ main.tsx
│  ├─ package.json
│  └─ vite.config.ts
│
├─ backend/
│  ├─ prisma/
│  │  ├─ migrations/
│  │  ├─ schema.prisma
│  │  └─ seed.ts
│  ├─ src/
│  │  ├─ controllers/
│  │  ├─ lib/
│  │  ├─ routes/
│  │  ├─ validations/
│  │  ├─ app.ts
│  │  └─ server.ts
│  ├─ package.json
│  ├─ prisma.config.ts
│  └─ tsconfig.json
│
├─ .gitignore
└─ README.md