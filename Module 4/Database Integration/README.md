# Database Integration

The posts API keeps its existing HTTP and repository contract while persistence is implemented with PostgreSQL and Prisma. Prisma-specific operations and errors stay behind the repository boundary.

## Requirements

- Node.js 18 or later
- PostgreSQL 14 or later

## Local setup

```bash
npm install
cp .env.example .env
```

Set `DATABASE_URL` in `.env` to a PostgreSQL database that you own. The committed example is a placeholder; never commit `.env` or real credentials.

```bash
npm run prisma:format
npm run prisma:validate
npm run prisma:generate
npm run prisma:migrate:dev -- --name init_database_integration
npm run db:seed
npm start
```

For a deployed environment, apply the committed migration history with `npm run prisma:migrate:deploy` rather than `migrate dev`. `db:seed` is safe to re-run: it ensures the initial author exists and adds the sample posts only when the posts table is empty. It never deletes existing data.

To reset a **disposable local database only**, Prisma's `npx prisma migrate reset` drops and recreates its schema. It is destructive and should not be used with data that needs to be kept.

## API contract

| Method | Endpoint | Result |
| --- | --- | --- |
| `GET` | `/posts` | `200 { "data": [...] }` (empty list when there are no posts) |
| `GET` | `/posts/:id` | `200 { "data": post }` or `404 { "error": "Post not found" }` |
| `POST` | `/posts` | `201 { "data": post }`; requires a title and an existing `authorId` |
| `PATCH` | `/posts/:id` | `200 { "data": post }` or `404 { "error": "Post not found" }` |
| `DELETE` | `/posts/:id` | `204` or `404 { "error": "Post not found" }` |

Database uniqueness conflicts return a safe `409` response; invalid foreign keys return a safe `422` response. Raw Prisma and database details are not sent to clients. Prisma is imported only in the shared database module and repository layer.

## Validation without a live database

```bash
npm test
npm run prisma:validate
npm run prisma:generate
```

The repository contract tests use a fake Prisma delegate; they do not require a running PostgreSQL service. To prove the complete API against PostgreSQL, use a local database, apply the migration, seed it, then exercise the routes listed above.
