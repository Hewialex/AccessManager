# Secure Access System

This project implements an enterprise access control system (MAC, RBAC, ABAC, RuBAC, DAC) using Next.js, TypeScript, Prisma, and PostgreSQL.

## Quick start (local)

1. Copy `.env.example` to `.env` and fill values:

```powershell
copy .env.example .env
# then edit .env to set DATABASE_URL and JWT_SECRET
```

2. Install dependencies

```powershell
npm install
```

3. Run Prisma migrations

```powershell
npx prisma migrate dev --name initial
```

4. Generate Prisma client (if needed)

```powershell
npx prisma generate
```

5. Seed the database

```powershell
node prisma/seed.ts
```

6. Run dev server

```powershell
npm run dev
```

### Quick SQLite demo (no external DB)
1. Replace `DATABASE_URL` in `.env` with `file:./dev.db` and set `provider = "sqlite"` in `prisma/schema.prisma` datasource for local testing.
2. Run migrations & seed as above.

## Useful commands
- `npx prisma studio` — view DB in browser
- `npx prisma migrate status` — migration status

## Notes
- The seed script uses bcrypt. Install any missing native deps if required.
- JWT secret must be strong in production. Use a secrets manager and rotate keys regularly.
