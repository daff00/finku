# Finku — Frontend

> React PWA for Finku personal finance tracker, built with React 19 + TypeScript + Vite + Tailwind v4 + shadcn/ui.

## Tech Stack
- **React** 19
- **TypeScript** 6.0
- **Vite** 8.x — build tool
- **Tailwind CSS** v4 — styling
- **shadcn/ui** — component library
- **React Router** v7 — navigation
- **TanStack Query** v5 — data fetching + caching
- **Recharts** v3 — charts
- **Axios** — HTTP client

## Project Structure

frontend/
├── public/ # Static assets
└── src/
├── components/
│ ├── layout/ # AppShell, Sidebar, BottomNav
│ ├── shared/ # Reusable components across pages
│ └── ui/ # shadcn/ui auto-generated components
├── hooks/ # Custom React hooks
├── lib/ # Utilities (cn, formatters, constants)
├── pages/
│ ├── dashboard/ # Net worth, account cards, recent transactions
│ ├── transactions/ # Full transaction list, filters, search
│ ├── analytics/ # Charts — income vs expense, category breakdown
│ ├── import/ # CSV + PDF import flow
│ └── settings/ # Account management
├── services/ # Axios API calls to backend
├── store/ # Global state management
├── types/ # TypeScript type definitions
├── App.tsx # Routes definition
└── main.tsx # App entry point + providers


## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production
npm run build
```

## Environment Variables

Create a `.env.local` file in the `frontend/` root:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | Dashboard | Net worth, account cards, recent transactions |
| `/transactions` | Transactions | Full list with filters and search |
| `/analytics` | Analytics | Income vs expense, category breakdown, net worth over time |
| `/import` | Import | CSV and PDF bank statement import |
| `/settings` | Settings | Manage accounts, colors, preferences |

## Bank Account Colors

| Bank | Color |
|---|---|
| BCA | `#0066AE` |
| Mandiri | `#F5A623` |
| Mandiri RDN | `#E8750A` |
| Seabank | `#FF5C00` |
| Bank Jago | `#00B14F` |
| OVO | `#4C3494` |
| GoPay | `#00AED6` |