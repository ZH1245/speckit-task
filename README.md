This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database (Docker)

The app needs PostgreSQL. A `docker-compose.yml` is provided that boots Postgres and, on first start, auto-creates the `tasks_dev` and `tasks_test` databases **and** the `tasks` table — no manual SQL.

```bash
docker compose up -d          # starts Postgres on localhost:5432
```

`.env.local` should point at it:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tasks_dev
DATABASE_URL_TEST=postgresql://postgres:postgres@localhost:5432/tasks_test
```

> Port 5432 must be free. If another Postgres already owns it, stop that one first (`docker ps`), or change the host port in `docker-compose.yml` and the URLs above.

Then run the app (`pnpm dev`) or the tests (`pnpm test`). To reset the data: `docker compose down -v`.

## Running the app in Docker

A production image is provided via the `Dockerfile` (Next.js standalone output):

```bash
docker build -t speckit-task .
docker run --rm -p 3000:3000 \
  -e DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/tasks_dev \
  speckit-task
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
