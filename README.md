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
├─ docs/
│  └─ screenshots/
├─ .gitignore
└─ README.md
```

## Screenshots

### Dashboard

![Dashboard](docs/screenshots/dashboard.png)

### Transactions Page

![Transactions Page](docs/screenshots/transactions.png)

### Add Transaction Form

![Add Transaction Form](docs/screenshots/add-transactions.png)

### Edit Transaction Form

![Edit Transaction Form](docs/screenshots/edit-transaction.png)

### Categories Page

![Categories Page](docs/screenshots/categories.png)

## Database Design

The MVP uses two main entities:

```txt
Category
Transaction
```

### Category

Stores income and expense categories.

Fields:

```txt
id
name
type
createdAt
updatedAt
```

Rules:

- `name` is required
- `type` must be `income` or `expense`
- Combination of `name` and `type` must be unique
- Category cannot be deleted if it is used by transactions

### Transaction

Stores income and expense records.

Fields:

```txt
id
type
amount
description
transactionDate
categoryId
createdAt
updatedAt
```

Rules:

- `type` must be `income` or `expense`
- `amount` must be greater than 0
- `transactionDate` is required
- `categoryId` is required
- Transaction type must match category type

### Relationship

```txt
Category 1 ── many Transaction
```

One category can have many transactions. One transaction belongs to one category.

## API Endpoints

### Health Check

```txt
GET /api/health
```

### Categories

```txt
GET     /api/categories
POST    /api/categories
PUT     /api/categories/:id
DELETE  /api/categories/:id
```

### Transactions

```txt
GET     /api/transactions
GET     /api/transactions/:id
POST    /api/transactions
PUT     /api/transactions/:id
DELETE  /api/transactions/:id
```

### Transaction Filters

```txt
GET /api/transactions?type=expense
GET /api/transactions?categoryId=category_id
GET /api/transactions?month=2026-05
GET /api/transactions?search=makan
```

Filters can be combined.

Example:

```txt
GET /api/transactions?type=expense&month=2026-05&search=makan
```

### Dashboard Summary

```txt
GET /api/summary/monthly?month=2026-05
GET /api/summary/categories?month=2026-05
GET /api/summary/recent
```

## Frontend Pages

```txt
/
```

Dashboard page with monthly summary, category spending summary, and recent transactions.

```txt
/transactions
```

Transaction table with filter, edit, and delete actions.

```txt
/transactions/new
```

Form page for creating a new transaction.

```txt
/transactions/:id/edit
```

Form page for editing an existing transaction.

```txt
/categories
```

Category management page for income and expense categories.

## Getting Started

### Prerequisites

Make sure these tools are installed:

```txt
Node.js 18 or higher
PostgreSQL
Git
```

## Backend Setup

Go to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/personal_finance_tracker?schema=public"
```

Create the PostgreSQL database:

```sql
CREATE DATABASE personal_finance_tracker;
```

Run Prisma migration:

```bash
npx prisma migrate dev
```

Generate Prisma Client:

```bash
npx prisma generate
```

Seed initial categories:

```bash
npx prisma db seed
```

Run backend development server:

```bash
npm run dev
```

Backend will run on:

```txt
http://localhost:5000
```

Test health endpoint:

```txt
http://localhost:5000/api/health
```

## Frontend Setup

Go to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `frontend` folder:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Run frontend development server:

```bash
npm run dev
```

Frontend will run on:

```txt
http://localhost:5173
```

## Build

### Build Frontend

```bash
cd frontend
npm run build
```

### Build Backend

```bash
cd backend
npm run build
```

## Environment Variables

### Backend

```env
PORT=5000
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/personal_finance_tracker?schema=public"
```

### Frontend

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Future Improvements

Planned improvements after MVP:

- Authentication
- Multi-user support
- Budget tracking
- CSV export
- Chart visualization
- Deployment
- Docker setup
- Automated testing

## Portfolio Value

This project demonstrates:

- Full-stack application development
- REST API design
- Relational database modeling
- Prisma ORM usage
- PostgreSQL migration workflow
- Form validation with Zod
- CRUD operations
- Filtered data queries
- Dashboard summary aggregation
- Component-based UI development
- TypeScript usage across frontend and backend