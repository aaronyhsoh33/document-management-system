# Documents Management System

A full-stack Documents Management System that allows users to view, add, and search documents and folders.

## Tech Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, shadcn/ui |
| Backend  | Node.js, Express, TypeScript, Prisma ORM        |
| Database | PostgreSQL                                      |

## Features

- View documents and folders in a file-explorer table layout
- Navigate into nested folders with breadcrumb trail
- Add folders (nestable to any depth)
- Add document records (simulated — no actual file upload)
- Delete items (folder deletion cascades to all contents)
- Search across all documents and folders by name
- Sortable columns (Name, Date) and configurable pagination

## Prerequisites

- Docker & Docker Compose (recommended), OR
- Node.js >= 22, PostgreSQL, and npm (for local development)

## Quick Start with Docker

The easiest way to run the entire application (frontend, backend, and database) in a single command:

```bash
git clone <repo-url>
cd document-management-system
npm run docker
```

This:
- ✅ Initializes PostgreSQL inside the container
- ✅ Runs database migrations
- ✅ Applies database triggers (enforce folder-only parent constraint)
- ✅ Seeds sample data
- ✅ Starts backend on port 3001
- ✅ Starts frontend on port 3000

**Access the app at `http://localhost:3000`**

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd document-management-system
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PG_USER=postgres
PG_PASSWORD=your_password
PG_HOST=localhost
PG_PORT=5432
PG_DB=documents_db
PORT=3001
```

Create the database:

```bash
createdb -U postgres documents_db
```

Run Prisma migration:

```bash
npx prisma migrate dev
```

Apply DB triggers (enforce that only folders can be parents):

```bash
psql -U postgres -d documents_db -f prisma/migrations/triggers.sql
```

Start the backend:

```bash
npm run dev
```

Backend runs on http://localhost:3001

### 3. Frontend setup

```bash
cd ../frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Start the frontend:

```bash
npm run dev
```

Frontend runs on http://localhost:3000

## Production Build

### Docker (Recommended)

Build and run the entire application in a single container:

```bash
npm run docker
```

This starts:
- PostgreSQL database (initialized and seeded)
- Backend API on port 3001
- Frontend on port 3000

**Access the app at `http://localhost:3000`**

### Manual Build

#### Manual Build

#### Backend

```bash
cd backend
npm run build
```

This compiles TypeScript to `dist/` and optimizes for production.

Start the backend server:

```bash
export NODE_ENV=production
export DATABASE_URL="postgresql://user:password@host:5432/documents_db"
export PORT=3001

npx prisma migrate deploy
npm start
```

#### Frontend

```bash
cd frontend
npm run build
```

This creates an optimized Next.js build in `.next/`.

Start the frontend server:

```bash
export NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
npm start
```

Frontend runs on http://localhost:3000 by default.

## Running Tests

```bash
cd backend && npm test
```

## API Reference

| Method | Endpoint                    | Description                                          |
|--------|-----------------------------|------------------------------------------------------|
| GET    | `/api/items`                | List root items (supports `page`, `limit`, `sort`, `order`) |
| GET    | `/api/items/:id/children`   | List children of a folder                            |
| POST   | `/api/items`                | Create a folder or document                          |
| DELETE | `/api/items/:id`            | Delete an item (cascades for folders)                |
| GET    | `/api/items/search?q=`      | Search all items by name                             |

### POST `/api/items` body

```json
{
  "name": "My Report",
  "type": "document",
  "parentId": 3,
  "mimeType": "application/pdf",
  "size": 204800,
  "createdBy": "John Green"
}
```

## Project Structure

```
document-management-system/
├── frontend/                  # Next.js application
│   ├── app/
│   │   └── page.tsx           # Main FileExplorer page
│   ├── components/
│   │   ├── BreadcrumbNav.tsx
│   │   ├── AddItemModal.tsx
│   │   ├── ItemsTable.tsx
│   │   └── ui/                # shadcn/ui components
│   └── lib/
│       ├── api.ts             # Typed API client
│       └── types.ts           # Shared TypeScript types
├── backend/                   # Express API
│   ├── src/
│   │   ├── app.ts             # Express app setup
│   │   ├── index.ts           # Server entry point
│   │   ├── controllers/
│   │   │   └── itemsController.ts
│   │   ├── routes/
│   │   │   └── items.ts
│   │   ├── middleware/
│   │   │   └── errorHandler.ts
│   │   ├── lib/
│   │   │   └── prisma.ts
│   │   └── __tests__/
│   │       └── items.test.ts  # 15 unit tests
│   └── prisma/
│       ├── schema.prisma
│       └── migrations/
│           └── triggers.sql   # PostgreSQL triggers
└── docs/
    └── plans/                 # Design and implementation docs
```
