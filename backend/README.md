# CampusPrint Backend

Production-grade Node.js + Express backend for CampusPrint with layered architecture.

## Features

- Layered architecture: routes -> controllers -> services -> repositories
- PostgreSQL + Prisma schema for users, printers, print jobs, and credit ledger
- JWT Access + Refresh auth with Redis-backed refresh token sessions
- RBAC middleware for STUDENT, PRINTER_OWNER, ADMIN
- Atomic credit transaction with Prisma transactions
- Redis caching for online printer search
- Global error format: `{ status, message, code }`
- Security middleware: helmet + rate limiting
- Winston logging with rotating error logs

## Quick Start

1. Create environment variables:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Start dev server:

```bash
npm run dev
```

## API Base

- Base URL: `http://localhost:4000/api/v1`

## Admin Promotion

Admin accounts cannot be created via register endpoint. Promote users manually:

```bash
npm run promote-admin -- <user-id>
```
